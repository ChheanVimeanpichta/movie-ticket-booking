import { Router } from 'express';
import { createBooking, getBookingHistory } from '../controllers/bookingController.js';
const router = Router();
router.post('/', createBooking);
router.get('/history', getBookingHistory);
export default router;
