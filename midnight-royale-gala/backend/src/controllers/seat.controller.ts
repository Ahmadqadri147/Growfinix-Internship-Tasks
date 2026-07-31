import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { lockSeat, releaseSeat, getUserLocks } from '../services/seat.service';

export const getSeatsByEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId as string;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }

    const seats = await prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ section: 'asc' }, { row: 'asc' }, { number: 'asc' }],
    });

    res.json({ success: true, data: seats });
  } catch (error) {
    next(error);
  }
};

export const getSeat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const seat = await prisma.seat.findUnique({
      where: { id },
      include: { event: { select: { id: true, title: true } } },
    });

    if (!seat) {
      throw new ApiError(404, 'Seat not found.');
    }

    res.json({ success: true, data: seat });
  } catch (error) {
    next(error);
  }
};

export const lockSeatHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { seatId } = req.body;
    const userId = req.user!.userId;

    const result = await lockSeat(seatId, userId);

    res.json({
      success: true,
      message: 'Seat locked successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const releaseSeatHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { seatId, sessionId } = req.body;
    const userId = req.user!.userId;

    await releaseSeat(seatId, userId, sessionId);

    res.json({ success: true, message: 'Seat released successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getUserLockedSeats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const seatIds = await getUserLocks(userId);

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
      include: { event: { select: { id: true, title: true } } },
    });

    res.json({ success: true, data: seats });
  } catch (error) {
    next(error);
  }
};

export const generateSeatsForEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId as string;
    const { sections = 1, rows = 10, seatsPerRow = 20, basePrice = 200 } = req.body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }

    const existingSeats = await prisma.seat.count({ where: { eventId } });
    if (existingSeats > 0) {
      throw new ApiError(409, 'Seats have already been generated for this event.');
    }

    const seatsData: Array<{
      eventId: string;
      section: string;
      row: string;
      number: number;
      tier: string;
      price: number;
    }> = [];

    const tierConfig = [
      { rowStart: 0, rowEnd: 2, tier: 'VIP', priceMultiplier: 3 },
      { rowStart: 2, rowEnd: 4, tier: 'DIAMOND', priceMultiplier: 2 },
      { rowStart: 4, rowEnd: 6, tier: 'GOLD', priceMultiplier: 1.5 },
    ];

    for (let s = 1; s <= sections; s++) {
      const section = String.fromCharCode(64 + s);
      for (let r = 1; r <= rows; r++) {
        const row = r.toString().padStart(2, '0');
        for (let n = 1; n <= seatsPerRow; n++) {
          let tier = 'SILVER';
          let price = basePrice;

          for (const t of tierConfig) {
            if (r > t.rowStart && r <= t.rowEnd) {
              tier = t.tier;
              price = basePrice * t.priceMultiplier;
              break;
            }
          }

          seatsData.push({
            eventId,
            section,
            row,
            number: n,
            tier,
            price,
          });
        }
      }
    }

    await prisma.seat.createMany({ data: seatsData });

    const totalSeats = seatsData.length;

    res.status(201).json({
      success: true,
      message: `Generated ${totalSeats} seats successfully.`,
      data: { totalSeats },
    });
  } catch (error) {
    next(error);
  }
};
