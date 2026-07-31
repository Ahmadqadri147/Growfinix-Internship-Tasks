import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      pendingBookings,
      confirmedBookings,
      recentBookings,
      upcomingEvents,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.event.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalAmount: true } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true } },
        },
      }),
      prisma.event.count({ where: { status: 'PUBLISHED', date: { gte: new Date() } } }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEvents,
          totalBookings,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          pendingBookings,
          confirmedBookings,
          upcomingEvents,
        },
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueData = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        status: 'CONFIRMED',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyRevenue = await prisma.booking.groupBy({
      by: ['status'],
      _sum: { totalAmount: true },
    });

    res.json({
      success: true,
      data: {
        dailyRevenue,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOccupancyData = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: { select: { bookings: true } },
        venue: { select: { capacity: true } },
      },
    });

    const occupancyData = events.map((event) => {
      const totalSeats = event.venue?.capacity || 0;
      const bookedSeats = event._count.bookings;
      const occupancyRate = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
      return {
        eventId: event.id,
        eventTitle: event.title,
        totalSeats,
        bookedSeats,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
      };
    });

    res.json({ success: true, data: occupancyData });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', role, search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        bookings: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { event: { select: { id: true, title: true, date: true } } },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      throw new ApiError(400, 'Invalid role. Must be USER or ADMIN.');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    if (role === 'ADMIN') {
      await prisma.admin.upsert({
        where: { userId: id },
        update: {},
        create: { userId: id, permissions: ['all'] },
      });
    } else {
      await prisma.admin.deleteMany({ where: { userId: id } });
    }

    res.json({ success: true, message: 'User role updated successfully.', data: user });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true, date: true } },
          bookingTickets: { include: { ticketType: true } },
          bookingSeats: { include: { seat: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count(),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};
