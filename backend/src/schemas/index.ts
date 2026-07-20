import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const lockSeatsSchema = z.object({
  body: z.object({
    showtimeId: z.string().uuid('Invalid showtimeId'),
    seatIds: z.array(z.string().uuid()).min(1, 'Select at least one seat'),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    showtimeId: z.string().uuid('Invalid showtimeId'),
    seatIds: z.array(z.string().uuid()).min(1, 'Select at least one seat'),
  }),
});

export const paymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid bookingId'),
  }),
});