import type { Request, Response } from 'express';

export const getSeats = (_req: Request, res: Response) => {
  res.json({ seats: [] });
};

export const lockSeats = (_req: Request, res: Response) => {
  res.json({ message: 'Seat locking placeholder' });
};
