import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents,
  getUpcomingEvents,
} from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEventValidator, updateEventValidator } from '../validators/event.validator';

const router = Router();

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', getEvent);
router.post('/', authenticate, authorize('ADMIN'), createEventValidator, validate, createEvent);
router.patch('/:id', authenticate, authorize('ADMIN'), updateEventValidator, validate, updateEvent);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteEvent);

export default router;
