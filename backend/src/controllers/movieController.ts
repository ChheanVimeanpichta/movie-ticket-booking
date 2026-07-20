import type { Request, Response } from 'express';

export const getMovies = (_req: Request, res: Response) => {
  res.json({ movies: [] });
};

export const getMovieById = (_req: Request, res: Response) => {
  res.json({ movie: null });
};
