import { getRedis, isRedisAvailable } from '../config/redis';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const SEAT_LOCK_PREFIX = 'seat:lock:';
const SEAT_LOCK_TTL_MS = 600_000; // 10 minutes in milliseconds

interface SeatLock {
  sessionId: string;
  userId: string;
  seatId: string;
  lockedAt: number;
}

// In-memory fallback when Redis is unavailable
const memoryLocks = new Map<string, SeatLock>();

const getLockFromRedis = async (seatId: string): Promise<SeatLock | null> => {
  const redis = getRedis();
  if (!redis) return memoryLocks.get(seatId) ?? null;
  const raw = await redis.get(`${SEAT_LOCK_PREFIX}${seatId}`);
  return raw ? JSON.parse(raw) : null;
};

const setLockInRedis = async (seatId: string, lock: SeatLock): Promise<void> => {
  const redis = getRedis();
  if (!redis) {
    memoryLocks.set(seatId, lock);
    return;
  }
  await redis.setex(`${SEAT_LOCK_PREFIX}${seatId}`, 600, JSON.stringify(lock));
};

const delLockFromRedis = async (seatId: string): Promise<void> => {
  const redis = getRedis();
  if (!redis) {
    memoryLocks.delete(seatId);
    return;
  }
  await redis.del(`${SEAT_LOCK_PREFIX}${seatId}`);
};

const getAllLocksFromRedis = async (): Promise<Map<string, SeatLock>> => {
  const redis = getRedis();
  if (!redis) return memoryLocks;
  const keys = await redis.keys(`${SEAT_LOCK_PREFIX}*`);
  const locks = new Map<string, SeatLock>();
  for (const key of keys) {
    const raw = await redis.get(key);
    if (raw) {
      const seatId = key.replace(SEAT_LOCK_PREFIX, '');
      locks.set(seatId, JSON.parse(raw));
    }
  }
  return locks;
};

export const lockSeat = async (seatId: string, userId: string): Promise<{ success: boolean; sessionId: string }> => {
  const sessionId = uuidv4();
  const existing = await getLockFromRedis(seatId);

  if (existing) {
    if (existing.userId !== userId) {
      if (Date.now() - existing.lockedAt > SEAT_LOCK_TTL_MS) {
        await delLockFromRedis(seatId);
      } else {
        throw new ApiError(409, 'This seat is already locked by another user.');
      }
    } else {
      // Extend the lock
      const updatedLock: SeatLock = { ...existing, lockedAt: Date.now() };
      await setLockInRedis(seatId, updatedLock);
      return { success: true, sessionId: existing.sessionId };
    }
  }

  const lockData: SeatLock = { sessionId, userId, seatId, lockedAt: Date.now() };
  await setLockInRedis(seatId, lockData);

  await prisma.seat.update({
    where: { id: seatId },
    data: { status: 'RESERVED', lockedBy: sessionId, lockedAt: new Date() },
  });

  return { success: true, sessionId };
};

export const releaseSeat = async (seatId: string, userId: string, sessionId: string): Promise<void> => {
  const lockData = await getLockFromRedis(seatId);

  if (lockData) {
    if (lockData.userId !== userId || lockData.sessionId !== sessionId) {
      throw new ApiError(403, 'You do not own this lock.');
    }
    await delLockFromRedis(seatId);
  }

  const seat = await prisma.seat.findUnique({ where: { id: seatId } });
  if (seat && seat.lockedBy === sessionId) {
    await prisma.seat.update({
      where: { id: seatId },
      data: { status: 'AVAILABLE', lockedBy: null, lockedAt: null },
    });
  }
};

export const checkSeatAvailable = async (seatId: string): Promise<boolean> => {
  const seat = await prisma.seat.findUnique({ where: { id: seatId } });
  if (!seat) return false;
  return seat.status === 'AVAILABLE';
};

export const releaseExpiredLocks = async (): Promise<number> => {
  const locks = await getAllLocksFromRedis();
  const now = Date.now();
  let released = 0;

  for (const [seatId, lockData] of locks) {
    if (now - lockData.lockedAt > SEAT_LOCK_TTL_MS) {
      await delLockFromRedis(seatId);
      await prisma.seat.updateMany({
        where: { id: lockData.seatId, lockedBy: lockData.sessionId, status: 'RESERVED' },
        data: { status: 'AVAILABLE', lockedBy: null, lockedAt: null },
      });
      released++;
    }
  }
  return released;
};

export const getUserLocks = async (userId: string): Promise<string[]> => {
  const locks = await getAllLocksFromRedis();
  const userSeatIds: string[] = [];
  for (const [seatId, lockData] of locks) {
    if (lockData.userId === userId) {
      userSeatIds.push(seatId);
    }
  }
  return userSeatIds;
};

export const checkLockValid = async (seatId: string, sessionId: string): Promise<boolean> => {
  const lockData = await getLockFromRedis(seatId);
  if (!lockData) return false;
  return lockData.sessionId === sessionId;
};
