import { Router } from 'express';
import { getSeats, lockSeats } from '../controllers/seatController.js';

const router = Router();

router.get('/', getSeats);
router.post('/lock', lockSeats);

export default router;
