import { Router } from 'express';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', authenticate, authorize('ADMIN'), getCoupons);
router.get('/:id', authenticate, authorize('ADMIN'), getCoupon);
router.post('/', authenticate, authorize('ADMIN'), createCoupon);
router.patch('/:id', authenticate, authorize('ADMIN'), updateCoupon);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCoupon);

export default router;
