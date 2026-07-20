import type { Request, Response } from 'express';

export const login = (_req: Request, res: Response) => {
  res.json({ message: 'Login endpoint placeholder' });
};

export const signup = (_req: Request, res: Response) => {
  res.json({ message: 'Signup endpoint placeholder' });
};
