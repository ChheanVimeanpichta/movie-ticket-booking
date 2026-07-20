import type { Request, Response } from 'express';

export const getShowtimes = (_req: Request, res: Response) => {
  res.json({ showtimes: [] });
};
