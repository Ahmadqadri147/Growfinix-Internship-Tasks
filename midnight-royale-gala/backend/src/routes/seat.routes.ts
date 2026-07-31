import { Router } from 'express';
import {
  getSeatsByEvent,
  getSeat,
  lockSeatHandler,
  releaseSeatHandler,
  getUserLockedSeats,
  generateSeatsForEvent,
} from '../controllers/seat.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/event/:eventId', getSeatsByEvent);
router.get('/my-locks', authenticate, getUserLockedSeats);
router.get('/:id', getSeat);
router.post('/lock', authenticate, lockSeatHandler);
router.post('/release', authenticate, releaseSeatHandler);
router.post('/generate/:eventId', authenticate, authorize('ADMIN'), generateSeatsForEvent);

export default router;
