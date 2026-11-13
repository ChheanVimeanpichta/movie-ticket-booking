import Tesseract from "tesseract.js";

export interface ReceiptValidationResult {
  isValid: boolean;
  errorMessage?: string;
  detectedBank?: "aba" | "acleda" | "wing" | "unknown";
  extractedTextSnippet?: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/pjpeg",
  "image/x-png",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates an uploaded payment receipt image:
 * 1. Enforces file format (JPG, JPEG, PNG only).
 * 2. Enforces maximum size of 5 MB.
 * 3. Uses Tesseract.js OCR to inspect text content.
 * 4. Rejects unrelated images (selfies, human portraits, random photos, chat screenshots, QR pay screens, account balances).
 * 5. Rejects failed or pending transactions.
 * 6. Verifies that the receipt matches the customer's selected bank (ABA Mobile, ACLEDA, or WING).
 */
export async function validatePaymentReceipt(
  file: File,
  selectedProviderId: "aba" | "acleda" | "wing"
): Promise<ReceiptValidationResult> {
  // 1. File format validation
  const fileName = file.name || "";
  const dotIndex = fileName.lastIndexOf(".");
  const fileExt = dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";

  const hasValidExt = ALLOWED_EXTENSIONS.includes(fileExt);
  const hasValidMime = ALLOWED_MIME_TYPES.includes((file.type || "").toLowerCase());

  if (!hasValidExt && !hasValidMime) {
    return {
      isValid: false,
      errorMessage: "Only JPG, JPEG, and PNG images are accepted.",
    };
  }

  // 2. Maximum image size validation (5 MB)
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      errorMessage: "Image file size exceeds 5 MB. Please upload an image under 5 MB.",
    };
  }

  // 3. OCR extraction with Tesseract.js (with safety timeout)
  let ocrText = "";
  try {
    const ocrPromise = Tesseract.recognize(file, "eng", {
      logger: () => {},
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 18000);
    });

    const result = await Promise.race([ocrPromise, timeoutPromise]);
    if (result && "data" in result) {
      ocrText = result.data.text || "";
    }
  } catch (err) {
    console.warn("OCR recognition error:", err);
  }

  const normalized = ocrText.toLowerCase().replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  const cleanAlphaNum = normalized.replace(/[^a-z0-9]/g, "");

  // 4. Reject Low-Text Images (Selfies, portraits, landscape photos, wallpapers, empty pictures)
  // Genuine bank receipts contain significant textual information (bank name, transaction numbers, amounts, dates).
  // Random pictures / selfies have virtually no recognized textual content or very few characters.
  if (cleanAlphaNum.length < 20) {
    return {
      isValid: false,
      errorMessage: "This image does not appear to be a bank transaction receipt. Please upload a clear screenshot of your payment receipt.",
      extractedTextSnippet: ocrText.slice(0, 80),
    };
  }

  // Common completion markers on genuine bank receipts
  const hasStrongReceiptIndicator =
    normalized.includes("successful") ||
    normalized.includes("success") ||
    normalized.includes("transferred") ||
    normalized.includes("transfer successful") ||
    normalized.includes("paid successfully") ||
    normalized.includes("payment successful") ||
    normalized.includes("trx id") ||
    normalized.includes("txn id") ||
    normalized.includes("transaction id") ||
    normalized.includes("ref no") ||
    normalized.includes("reference no") ||
    normalized.includes("payment receipt");

  // 5. Reject Telegram, Messenger, Social Media Screenshots
  const isChatApp =
    normalized.includes("telegram") ||
    normalized.includes("messenger") ||
    normalized.includes("whatsapp") ||
    normalized.includes("viber") ||
    normalized.includes("type a message") ||
    normalized.includes("sent a photo") ||
    normalized.includes("voice message") ||
    normalized.includes("online") ||
    normalized.includes("last seen") ||
    normalized.includes("yesterday at");

  if (isChatApp && !hasStrongReceiptIndicator) {
    return {
      isValid: false,
      errorMessage: "Telegram or Messenger chat screenshots cannot be used as proof of payment. Please upload an official bank transaction receipt.",
    };
  }

  // 6. Reject QR Payment screens without completed transaction (unpaid QR prompt)
  const isUnpaidQRScreen =
    (normalized.includes("scan to pay") ||
      normalized.includes("scan qr") ||
      normalized.includes("show qr") ||
      normalized.includes("pay with qr") ||
      normalized.includes("scan this qr") ||
      normalized.includes("my qr code") ||
      normalized.includes("scan me")) &&
    !hasStrongReceiptIndicator &&
    !normalized.includes("completed") &&
    !normalized.includes("paid to") &&
    !normalized.includes("transfer to");

  if (isUnpaidQRScreen) {
    return {
      isValid: false,
      errorMessage: "QR payment screens cannot be used as proof of completed payment. Please scan and complete the payment first, then upload the transaction receipt.",
    };
  }

  // 7. Reject Bank Account Balance screenshots
  const isBalanceScreen =
    (normalized.includes("account balance") ||
      normalized.includes("available balance") ||
      normalized.includes("current balance") ||
      normalized.includes("total balance") ||
      normalized.includes("wallet balance") ||
      normalized.includes("total assets") ||
      normalized.includes("saving account balance")) &&
    !hasStrongReceiptIndicator &&
    !normalized.includes("transferred to") &&
    !normalized.includes("paid to");

  if (isBalanceScreen) {
    return {
      isValid: false,
      errorMessage: "Screenshots of bank account balances cannot be used as proof of payment. Please upload a completed transaction receipt.",
    };
  }

  // 8. Reject Failed or Pending Transactions
  const isFailedOrPending =
    (normalized.includes("failed") ||
      normalized.includes("declined") ||
      normalized.includes("unsuccessful") ||
      normalized.includes("rejected") ||
      normalized.includes("payment failed") ||
      normalized.includes("transaction failed") ||
      normalized.includes("pending") ||
      normalized.includes("processing") ||
      normalized.includes("cancelled")) &&
    !normalized.includes("successful") &&
    !normalized.includes("success");

  if (isFailedOrPending) {
    return {
      isValid: false,
      errorMessage: "Please upload a successful transaction screenshot. This receipt shows a pending or failed transaction.",
    };
  }

  // 9. Detect Bank Identity with OCR font distortion tolerances
  const abaPatterns = [
    "aba",
    "aba mobile",
    "aba bank",
    "advanced bank of asia",
    "payway",
    "a8a",
    "ab4",
  ];

  const acledaPatterns = [
    "acleda",
    "acleda mobile",
    "acleda bank",
    "toanchet",
    "toan chet",
    "unity toanchet",
    "unity",
    "actena", // Common OCR read of stylized ACLEDA font
    "aceoa",  // Common OCR read of stylized ACLEDA font
    "acieda",
    "acleba",
    "aoleda",
    "acled",
    "023 994 444", // ACLEDA 24/7 Call Center Hotline
    "015 999 233",
    "transaction khor to", // Common OCR read of Transaction KHQR to
    "transaction qr to",
    "transaction khqr",
  ];

  const wingPatterns = [
    "wing",
    "wing bank",
    "wing mobile",
    "wingpay",
    "wing money",
    "wingmall",
    "wing cash",
    "wing account",
  ];

  const hasAba = abaPatterns.some((p) => normalized.includes(p));
  const hasAcleda = acledaPatterns.some((p) => normalized.includes(p));
  const hasWing = wingPatterns.some((p) => normalized.includes(p));

  let detectedBank: "aba" | "acleda" | "wing" | "unknown" = "unknown";
  if (hasAba && !hasAcleda && !hasWing) {
    detectedBank = "aba";
  } else if (hasAcleda && !hasAba && !hasWing) {
    detectedBank = "acleda";
  } else if (hasWing && !hasAba && !hasAcleda) {
    detectedBank = "wing";
  }

  // 10. Check for general bank transaction receipt indicators
  const hasTransactionIndicator =
    hasStrongReceiptIndicator ||
    normalized.includes("amount") ||
    normalized.includes("usd") ||
    normalized.includes("khr") ||
    normalized.includes("fee") ||
    normalized.includes("to:") ||
    normalized.includes("from:") ||
    normalized.includes("trn") ||
    normalized.includes("ref") ||
    normalized.includes("date") ||
    normalized.includes("$");

  if (!hasTransactionIndicator) {
    return {
      isValid: false,
      errorMessage: "This image does not appear to be a bank transaction receipt. Please upload a valid ABA, ACLEDA, or WING payment receipt.",
    };
  }

  // 11. Bank matching with selected payment provider
  if (selectedProviderId === "aba") {
    if (detectedBank === "acleda" || detectedBank === "wing") {
      const otherBankName = detectedBank === "acleda" ? "ACLEDA Bank" : "WING";
      return {
        isValid: false,
        errorMessage: `You selected ABA Pay, but this appears to be an ${otherBankName} receipt. Please upload an ABA Mobile payment receipt.`,
        detectedBank,
      };
    }
    if (!hasAba) {
      return {
        isValid: false,
        errorMessage: "Please upload a valid ABA Mobile payment receipt.",
      };
    }
  } else if (selectedProviderId === "acleda") {
    if (detectedBank === "aba" || detectedBank === "wing") {
      const otherBankName = detectedBank === "aba" ? "ABA Mobile" : "WING";
      return {
        isValid: false,
        errorMessage: `You selected ACLEDA, but this appears to be an ${otherBankName} receipt. Please upload an ACLEDA Bank payment receipt.`,
        detectedBank,
      };
    }
    if (!hasAcleda) {
      return {
        isValid: false,
        errorMessage: "Please upload a valid ACLEDA Bank payment receipt.",
      };
    }
  } else if (selectedProviderId === "wing") {
    if (detectedBank === "aba" || detectedBank === "acleda") {
      const otherBankName = detectedBank === "aba" ? "ABA Mobile" : "ACLEDA Bank";
      return {
        isValid: false,
        errorMessage: `You selected Wing, but this appears to be an ${otherBankName} receipt. Please upload a WING payment receipt.`,
        detectedBank,
      };
    }
    if (!hasWing) {
      return {
        isValid: false,
        errorMessage: "Please upload a valid WING payment receipt.",
      };
    }
  }

  return {
    isValid: true,
    detectedBank: detectedBank !== "unknown" ? detectedBank : selectedProviderId,
    extractedTextSnippet: ocrText.slice(0, 150),
  };
}
