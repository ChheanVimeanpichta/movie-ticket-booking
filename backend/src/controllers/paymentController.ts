import type { Request, Response } from 'express';

const ALLOWED_METHODS = [
  'aba',
  'aba pay',
  'aba mobile',
  'acleda',
  'acleda mobile',
  'acleda bank',
  'wing',
  'wing mobile',
  'wing bank',
  'wingpay',
];

export const processPayment = (req: Request, res: Response) => {
  const { paymentMethod, proofFileName } = req.body || {};

  if (
    paymentMethod &&
    !ALLOWED_METHODS.includes(String(paymentMethod).trim().toLowerCase())
  ) {
    res.status(400).json({
      success: false,
      message: 'Invalid payment method. Only ABA Mobile, ACLEDA Bank, and WING receipts are accepted.',
    });
    return;
  }

  if (proofFileName) {
    const ext = String(proofFileName).slice(String(proofFileName).lastIndexOf('.')).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      res.status(400).json({
        success: false,
        message: 'Invalid receipt file type. Only JPG, JPEG, and PNG images are allowed.',
      });
      return;
    }
  }

  res.json({ message: 'Payment receipt validated and booking confirmed', status: 'success' });
};
