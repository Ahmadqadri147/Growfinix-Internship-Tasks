import { Router } from 'express';
import {
  createBooking,
  confirmBooking,
  cancelBooking,
  getUserBookings,
  getBookingByRef,
  getBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingValidator, confirmBookingValidator } from '../validators/booking.validator';

const router = Router();

router.get('/my-bookings', authenticate, getUserBookings);
router.get('/ref/:ref', getBookingByRef);
router.get('/:id', authenticate, getBooking);
router.post('/', authenticate, createBookingValidator, validate, createBooking);
router.patch('/:id/confirm', authenticate, confirmBookingValidator, validate, confirmBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
