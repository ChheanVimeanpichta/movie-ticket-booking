import { Router } from 'express';
import { getMovieById, getMovies } from '../controllers/movieController.js';
const router = Router();
router.get('/', getMovies);
router.get('/:movieId', getMovieById);
export default router;
