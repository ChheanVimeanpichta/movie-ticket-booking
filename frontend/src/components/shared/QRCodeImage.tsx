import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeImageProps {
  data: string;
  size?: number;
  className?: string;
  alt?: string;
  centerLogo?: string;
}

export default function QRCodeImage({
  data,
  size = 320,
  className = "w-full rounded",
  alt = "QR code",
  centerLogo,
}: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (!data) return;

    QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: centerLogo ? "H" : "M",
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate QR code:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [data, size, centerLogo]);

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-white aspect-square w-full rounded ${className}`}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cine-red border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full">
      <img src={dataUrl} alt={alt} className={className} />
      {centerLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-10 w-10 rounded-lg bg-white p-1 shadow-md border border-gray-200 flex items-center justify-center overflow-hidden">
            <img src={centerLogo} alt="Bank Logo" className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
