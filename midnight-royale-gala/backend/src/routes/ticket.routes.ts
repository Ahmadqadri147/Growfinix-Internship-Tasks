import { Router } from 'express';
import {
  getTicketTypes,
  getTicketType,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getAvailableTickets,
} from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/event/:eventId', getTicketTypes);
router.get('/event/:eventId/available', getAvailableTickets);
router.get('/:id', getTicketType);
router.post('/', authenticate, authorize('ADMIN'), createTicketType);
router.patch('/:id', authenticate, authorize('ADMIN'), updateTicketType);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTicketType);

export default router;
