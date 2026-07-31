import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import venueRoutes from './venue.routes';
import ticketRoutes from './ticket.routes';
import seatRoutes from './seat.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import couponRoutes from './coupon.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/venues', venueRoutes);
router.use('/tickets', ticketRoutes);
router.use('/seats', seatRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/coupons', couponRoutes);

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Midnight Royale Gala API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
