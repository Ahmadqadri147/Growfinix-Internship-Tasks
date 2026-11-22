import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getRepository } from './repository';
import { getAuthSecret, isVercel } from './config';
import { SESSION_COOKIE } from './constants';
import { ApiError } from './api-error';
import { checkRateLimit } from './rate-limit';
import type { PublicUser } from './types';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const ISSUER = 'ai-image-studio';

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getAuthSecret());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ v: 1 })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey());
}

async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  return getRepository().getUserById(userId);
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isVercel,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Returns the current session user, creating a guest workspace when needed.
 * Only call this from Route Handlers or Server Actions, where cookies are mutable.
 */
export async function getOrCreateSessionUser(ip = 'unknown'): Promise<PublicUser> {
  const existing = await getSessionUser();
  if (existing) return existing;

  const limit = checkRateLimit(`guest-create:${ip}`, 30, 60 * 60 * 1000);
  if (!limit.allowed) {
    throw new ApiError(
      429,
      'RATE_LIMITED',
      'Too many guest workspaces were created from this network. Please try again later.'
    );
  }

  const user = await getRepository().createGuestUser();
  await setSessionCookie(user.id);
  return user;
}
