import { Router } from 'express';
import { getVenues, getVenue, getVenueByEvent, createVenue, updateVenue, deleteVenue } from '../controllers/venue.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getVenues);
router.get('/event/:eventId', getVenueByEvent);
router.get('/:id', getVenue);
router.post('/', authenticate, authorize('ADMIN'), createVenue);
router.patch('/:id', authenticate, authorize('ADMIN'), updateVenue);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteVenue);

export default router;
