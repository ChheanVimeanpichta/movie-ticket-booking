import type { Request, Response } from 'express';

export const createBooking = (_req: Request, res: Response) => {
  res.json({ message: 'Booking creation placeholder' });
};

export const getBookingHistory = (_req: Request, res: Response) => {
  res.json({ bookings: [] });
};
