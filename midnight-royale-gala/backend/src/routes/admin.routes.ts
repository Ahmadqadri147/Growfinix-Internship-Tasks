import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueData,
  getOccupancyData,
  getUsers,
  getUserDetail,
  updateUserRole,
  getAllBookings,
  getActivityLogs,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueData);
router.get('/occupancy', getOccupancyData);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/role', updateUserRole);
router.get('/bookings', getAllBookings);
router.get('/activity-logs', getActivityLogs);

export default router;
