import { Router } from 'express';
import { createBooking, getBookingHistory } from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createBooking);
router.get('/history', getBookingHistory);

export default router;
