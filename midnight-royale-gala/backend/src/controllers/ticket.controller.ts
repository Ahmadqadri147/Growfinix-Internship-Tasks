import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getTicketTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId as string;

    const tickets = await prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    });

    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicketType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const ticket = await prisma.ticketType.findUnique({
      where: { id },
      include: { event: { select: { id: true, title: true, date: true } } },
    });

    if (!ticket) {
      throw new ApiError(404, 'Ticket type not found.');
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const createTicketType = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId, name, description, price, quantity, benefits, color } = req.body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }

    const ticket = await prisma.ticketType.create({
      data: {
        eventId,
        name,
        description,
        price,
        quantity,
        available: quantity,
        benefits: benefits || [],
        color,
      },
    });

    res.status(201).json({ success: true, message: 'Ticket type created successfully.', data: ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicketType = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.ticketType.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Ticket type not found.');
    }

    const { name, description, price, quantity, benefits, color } = req.body;
    const ticket = await prisma.ticketType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(quantity !== undefined && { quantity, available: quantity }),
        ...(benefits !== undefined && { benefits }),
        ...(color !== undefined && { color }),
      },
    });

    res.json({ success: true, message: 'Ticket type updated successfully.', data: ticket });
  } catch (error) {
    next(error);
  }
};

export const deleteTicketType = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.ticketType.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Ticket type not found.');
    }

    await prisma.ticketType.delete({ where: { id } });

    res.json({ success: true, message: 'Ticket type deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getAvailableTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId as string;

    const tickets = await prisma.ticketType.findMany({
      where: { eventId, available: { gt: 0 } },
      orderBy: { price: 'asc' },
    });

    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};
