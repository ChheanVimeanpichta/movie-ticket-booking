import type { Request, Response } from 'express';

export const processPayment = (_req: Request, res: Response) => {
  res.json({ message: 'Mock payment completed', status: 'success' });
};
