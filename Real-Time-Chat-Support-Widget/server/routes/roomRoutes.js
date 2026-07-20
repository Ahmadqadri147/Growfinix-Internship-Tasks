import { Router } from 'express';
import { createGuestIdentity, createRoom } from '../controllers/roomController.js';

const router = Router();

router.get('/guest', createGuestIdentity);
router.post('/room', createRoom);

export default router;
