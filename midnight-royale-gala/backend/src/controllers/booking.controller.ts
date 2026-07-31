import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../services/qr.service';
import { sendBookingConfirmation } from '../services/email.service';

const generateBookingRef = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'MRG-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId, tickets, seatIds, couponCode } = req.body;
    const userId = req.user!.userId;

    const event = await prisma.event.findUnique({
      where: { id: eventId as string },
      include: { ticketTypes: true },
    });

    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }

    if (event.status !== 'PUBLISHED') {
      throw new ApiError(400, 'This event is not available for booking.');
    }

    let totalAmount = 0;
    let discountAmount = 0;

    const bookingTicketsData: Array<{
      ticketTypeId: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const ticket of tickets) {
      const ticketType = event.ticketTypes.find((t) => t.id === ticket.ticketTypeId);
      if (!ticketType) {
        throw new ApiError(404, `Ticket type ${ticket.ticketTypeId} not found.`);
      }

      if (ticketType.available < ticket.quantity) {
        throw new ApiError(400, `Not enough ${ticketType.name} tickets available. Only ${ticketType.available} left.`);
      }

      bookingTicketsData.push({
        ticketTypeId: ticket.ticketTypeId,
        quantity: ticket.quantity,
        unitPrice: ticketType.price,
      });

      totalAmount += ticketType.price * ticket.quantity;
    }

    if (seatIds && seatIds.length > 0) {
      const seats = await prisma.seat.findMany({
        where: { id: { in: seatIds as string[] }, eventId: eventId as string },
      });

      if (seats.length !== seatIds.length) {
        throw new ApiError(400, 'Some seats were not found.');
      }

      for (const seat of seats) {
        if (seat.status !== 'AVAILABLE' && seat.status !== 'RESERVED') {
          throw new ApiError(400, `Seat ${seat.section}${seat.row}-${seat.number} is not available.`);
        }
        totalAmount += seat.price;
      }
    }

    let couponToApply: any = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: (couponCode as string).toUpperCase() } });
      if (!coupon || !coupon.isActive) {
        throw new ApiError(400, 'Invalid or expired coupon code.');
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new ApiError(400, 'This coupon has expired.');
      }

      if (coupon.usedCount >= coupon.maxUses) {
        throw new ApiError(400, 'This coupon has reached its usage limit.');
      }

      if (totalAmount < coupon.minAmount) {
        throw new ApiError(400, `Minimum order amount of $${coupon.minAmount.toFixed(2)} required for this coupon.`);
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
      }

      couponToApply = coupon;
    }

    const finalAmount = totalAmount - discountAmount;
    const bookingRef = generateBookingRef();

    const booking = await prisma.$transaction(async (tx) => {
      if (couponToApply) {
        await tx.coupon.update({
          where: { id: couponToApply.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const createdBooking = await tx.booking.create({
        data: {
          userId,
          eventId: eventId as string,
          bookingRef,
          totalAmount: finalAmount,
          discountAmount,
          couponCode: couponCode || null,
          status: 'PENDING',
          bookingTickets: {
            create: bookingTicketsData,
          },
          ...(seatIds && seatIds.length > 0
            ? {
                bookingSeats: {
                  create: seatIds.map((seatId: string) => ({ seatId })),
                },
              }
            : {}),
        },
        include: {
          bookingTickets: {
            include: { ticketType: true },
          },
          bookingSeats: {
            include: { seat: true },
          },
          event: {
            select: { id: true, title: true, date: true, time: true },
          },
        },
      });

      if (seatIds && seatIds.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: seatIds as string[] } },
          data: { status: 'RESERVED' },
        });
      }

      for (const ticket of bookingTicketsData) {
        await tx.ticketType.update({
          where: { id: ticket.ticketTypeId },
          data: { available: { decrement: ticket.quantity } },
        });
      }

      return createdBooking;
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Proceed to payment.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { paymentIntentId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        event: { select: { id: true, title: true, date: true } },
        bookingSeats: { include: { seat: true } },
      },
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (booking.status !== 'PENDING') {
      throw new ApiError(400, 'Booking is not in pending state.');
    }

    const qrData = JSON.stringify({
      bookingRef: booking.bookingRef,
      eventId: booking.eventId,
      userId: booking.userId,
      seats: booking.bookingSeats.map((bs) => `${bs.seat.section}${bs.seat.row}-${bs.seat.number}`),
    });

    const qrCode = await generateQRCode(qrData);

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'completed',
          paymentId: paymentIntentId,
          qrCode,
        },
        include: {
          bookingTickets: { include: { ticketType: true } },
          bookingSeats: { include: { seat: true } },
          event: { select: { id: true, title: true, date: true, time: true } },
        },
      });

      if (booking.bookingSeats.length > 0) {
        await tx.seat.updateMany({
          where: {
            id: { in: booking.bookingSeats.map((bs) => bs.seatId) },
          },
          data: { status: 'BOOKED' },
        });
      }

      return b;
    });

    try {
      await sendBookingConfirmation(
        booking.user.email,
        booking.user.name,
        booking.bookingRef,
        booking.event.title,
        booking.event.date.toISOString().split('T')[0],
        booking.totalAmount,
        qrCode
      );
    } catch {
      // Email failure should not block confirmation
    }

    res.json({
      success: true,
      message: 'Booking confirmed successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { bookingSeats: true, bookingTickets: true },
    });

    if (!existingBooking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (existingBooking.userId !== userId && req.user!.role !== 'ADMIN') {
      throw new ApiError(403, 'You can only cancel your own bookings.');
    }

    if (existingBooking.status === 'CANCELLED' || existingBooking.status === 'REFUNDED') {
      throw new ApiError(400, 'Booking is already cancelled or refunded.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      if (existingBooking.bookingSeats.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: existingBooking.bookingSeats.map((bs) => bs.seatId) } },
          data: { status: 'AVAILABLE' },
        });
      }

      for (const bt of existingBooking.bookingTickets) {
        await tx.ticketType.update({
          where: { id: bt.ticketTypeId },
          data: { available: { increment: bt.quantity } },
        });
      }
    });

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '10', status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: where as any,
        include: {
          event: { select: { id: true, title: true, date: true, time: true, imageUrl: true } },
          bookingTickets: { include: { ticketType: true } },
          bookingSeats: { include: { seat: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where: where as any }),
    ]);

    res.json({
      success: true,
      data: bookings,
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

export const getBookingByRef = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ref = req.params.ref as string;

    const booking = await prisma.booking.findUnique({
      where: { bookingRef: ref },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, date: true, time: true } },
        bookingTickets: { include: { ticketType: true } },
        bookingSeats: { include: { seat: true } },
      },
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: {
          include: {
            venue: { select: { id: true, name: true, address: true, city: true } },
          },
        },
        bookingTickets: { include: { ticketType: true } },
        bookingSeats: { include: { seat: true } },
        payments: true,
      },
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (booking.userId !== userId && req.user!.role !== 'ADMIN') {
      throw new ApiError(403, 'Access denied.');
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
