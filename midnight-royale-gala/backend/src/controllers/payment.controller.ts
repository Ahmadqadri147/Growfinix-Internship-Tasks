import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../services/qr.service';
import { sendBookingConfirmation } from '../services/email.service';

export const createPaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (booking.userId !== userId) {
      throw new ApiError(403, 'This booking does not belong to you.');
    }

    if (booking.status !== 'PENDING') {
      throw new ApiError(400, 'Booking is not in pending state.');
    }

    const dummyPaymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const payment = await prisma.payment.create({
      data: {
        userId,
        bookingId,
        amount: booking.totalAmount,
        currency: 'usd',
        status: 'pending',
        stripePaymentIntentId: dummyPaymentIntentId,
        method: 'card',
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentId: dummyPaymentIntentId },
    });

    res.json({
      success: true,
      data: {
        paymentIntentId: dummyPaymentIntentId,
        clientSecret: `${dummyPaymentIntentId}_secret_dummy`,
        amount: booking.totalAmount,
        currency: 'usd',
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        booking: {
          include: {
            user: true,
            event: true,
            bookingSeats: { include: { seat: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError(404, 'Payment not found.');
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'completed' },
    });

    const qrData = JSON.stringify({
      bookingRef: payment.booking.bookingRef,
      eventId: payment.booking.eventId,
      userId: payment.booking.userId,
    });
    const qrCode = await generateQRCode(qrData);

    const updatedBooking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'completed',
        qrCode,
      },
      include: {
        event: { select: { id: true, title: true, date: true, time: true } },
        bookingTickets: { include: { ticketType: true } },
        bookingSeats: { include: { seat: true } },
      },
    });

    if (payment.booking.bookingSeats.length > 0) {
      await prisma.seat.updateMany({
        where: { id: { in: payment.booking.bookingSeats.map((bs) => bs.seatId) } },
        data: { status: 'BOOKED' },
      });
    }

    try {
      await sendBookingConfirmation(
        payment.booking.user.email,
        payment.booking.user.name,
        payment.booking.bookingRef,
        payment.booking.event.title,
        payment.booking.event.date.toISOString().split('T')[0],
        payment.booking.totalAmount,
        qrCode
      );
    } catch {
      // Email failure should not block confirmation
    }

    res.json({
      success: true,
      message: 'Payment confirmed and booking completed successfully.',
      data: { payment: updatedPayment, booking: updatedBooking },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;

    const payments = await prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
