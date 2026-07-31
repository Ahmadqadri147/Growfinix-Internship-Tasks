import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  handleStripeWebhook,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);
router.get('/:bookingId/status', authenticate, getPaymentStatus);
router.post('/webhook', handleStripeWebhook);

export default router;
