import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import config from '../config';
import { verifyToken } from '../utils/jwt';
import { getRedis } from '../config/redis';
import logger from '../utils/logger';
import { releaseExpiredLocks } from '../services/seat.service';

let io: Server;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const decoded = verifyToken(token as string);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
      }
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id}${socket.userId ? ` (user: ${socket.userId})` : ''}`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join event room for seat updates
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      logger.info(`Socket ${socket.id} joined event room: ${eventId}`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    // Seat selection updates
    socket.on('seat:lock', (data: { eventId: string; seatId: string; sessionId: string }) => {
      socket.to(`event:${data.eventId}`).emit('seat:locked', {
        seatId: data.seatId,
        sessionId: data.sessionId,
      });
    });

    socket.on('seat:release', (data: { eventId: string; seatId: string }) => {
      socket.to(`event:${data.eventId}`).emit('seat:released', {
        seatId: data.seatId,
      });
    });

    socket.on('seat:booked', (data: { eventId: string; seatId: string }) => {
      io.to(`event:${data.eventId}`).emit('seat:booked', {
        seatId: data.seatId,
      });
    });

    // Booking notifications
    socket.on('booking:created', (data: { bookingRef: string; userId: string }) => {
      io.to(`user:${data.userId}`).emit('booking:created', {
        bookingRef: data.bookingRef,
        message: 'Your booking has been created. Proceed to payment.',
      });
    });

    socket.on('booking:confirmed', (data: { bookingRef: string; userId: string }) => {
      io.to(`user:${data.userId}`).emit('booking:confirmed', {
        bookingRef: data.bookingRef,
        message: 'Your booking has been confirmed!',
      });
    });

    // Admin notifications
    socket.on('booking:new', (data: { bookingRef: string }) => {
      io.to('admin').emit('booking:new', {
        bookingRef: data.bookingRef,
        message: 'New booking received.',
      });
    });

    if (socket.userRole === 'ADMIN') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // Periodic cleanup of expired locks
  setInterval(async () => {
    try {
      const released = await releaseExpiredLocks();
      if (released > 0) {
        logger.info(`Auto-released ${released} expired seat locks`);
      }
    } catch (error) {
      logger.error('Error releasing expired locks:', error);
    }
  }, 30000); // Check every 30 seconds

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToEvent = (eventId: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`event:${eventId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToAdmin = (event: string, data: unknown): void => {
  if (io) {
    io.to('admin').emit(event, data);
  }
};
