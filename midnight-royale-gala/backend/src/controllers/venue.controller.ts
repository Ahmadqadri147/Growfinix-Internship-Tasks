import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getVenues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', city } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (city) {
      where.city = { contains: city as string, mode: 'insensitive' };
    }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
      }),
      prisma.venue.count({ where }),
    ]);

    res.json({
      success: true,
      data: venues,
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

export const getVenueByEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId as string;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { venue: true },
    });
    if (!event || !event.venue) {
      throw new ApiError(404, 'Venue not found for this event.');
    }
    res.json({ success: true, data: event.venue });
  } catch (error) {
    next(error);
  }
};

export const getVenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        events: {
          where: { status: 'PUBLISHED' },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!venue) {
      throw new ApiError(404, 'Venue not found.');
    }

    res.json({ success: true, data: venue });
  } catch (error) {
    next(error);
  }
};

export const createVenue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, address, city, capacity, description, images, amenities, mapUrl } = req.body;

    const venue = await prisma.venue.create({
      data: {
        name,
        address,
        city,
        capacity,
        description,
        images: images || [],
        amenities: amenities || [],
        mapUrl,
      },
    });

    res.status(201).json({ success: true, message: 'Venue created successfully.', data: venue });
  } catch (error) {
    next(error);
  }
};

export const updateVenue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Venue not found.');
    }

    const { name, address, city, capacity, amenities, images } = req.body;
    const venue = await prisma.venue.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(capacity !== undefined && { capacity }),
        ...(amenities !== undefined && { amenities }),
        ...(images !== undefined && { images }),
      },
    });

    res.json({ success: true, message: 'Venue updated successfully.', data: venue });
  } catch (error) {
    next(error);
  }
};

export const deleteVenue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.venue.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Venue not found.');
    }

    await prisma.venue.delete({ where: { id } });

    res.json({ success: true, message: 'Venue deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
