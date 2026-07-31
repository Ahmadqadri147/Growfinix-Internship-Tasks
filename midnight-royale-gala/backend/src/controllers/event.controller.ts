import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '12', status, featured, search, city, dateFrom, dateTo } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (featured === 'true') where.featured = true;

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.venue = { city: { contains: city as string, mode: 'insensitive' } };
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          venue: {
            select: { id: true, name: true, city: true, address: true },
          },
          ticketTypes: {
            select: { id: true, name: true, price: true, available: true, color: true },
          },
          _count: { select: { bookings: true } },
        },
        skip,
        take: limitNum,
        orderBy: { date: 'asc' },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        ticketTypes: {
          orderBy: { price: 'asc' },
        },
        _count: { select: { bookings: true } },
      },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, date, time, venueId, imageUrl, gallery, featured } = req.body;

    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) {
      throw new ApiError(404, 'Venue not found.');
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        venueId,
        imageUrl,
        gallery: gallery || [],
        featured: featured || false,
      },
      include: { venue: true },
    });

    res.status(201).json({ success: true, message: 'Event created successfully.', data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, date, time, venueId, imageUrl, gallery, status, featured } = req.body;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Event not found.');
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(time !== undefined && { time }),
        ...(venueId !== undefined && { venueId }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(gallery !== undefined && { gallery }),
        ...(status !== undefined && { status }),
        ...(featured !== undefined && { featured }),
      },
      include: { venue: true },
    });

    res.json({ success: true, message: 'Event updated successfully.', data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Event not found.');
    }

    await prisma.event.delete({ where: { id } });

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      where: { featured: true, status: 'PUBLISHED', date: { gte: new Date() } },
      include: {
        venue: { select: { id: true, name: true, city: true } },
        ticketTypes: { select: { id: true, name: true, price: true, available: true } },
      },
      orderBy: { date: 'asc' },
      take: 6,
    });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED', date: { gte: new Date() } },
      include: {
        venue: { select: { id: true, name: true, city: true } },
        ticketTypes: { select: { id: true, name: true, price: true, available: true } },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};
