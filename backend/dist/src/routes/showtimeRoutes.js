import { Router } from 'express';
import { getShowtimes } from '../controllers/showtimeController.js';
const router = Router();
router.get('/', getShowtimes);
export default router;
