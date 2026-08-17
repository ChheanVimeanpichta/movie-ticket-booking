import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Invalid request';
      res.status(400).json({ message });
      return;
    }
    next();
  };
};
