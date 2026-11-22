import { getSessionUser, setSessionCookie, verifyPassword } from '@/lib/auth';
import { getRepository } from '@/lib/repository';
import {
  assertJsonRequest,
  assertSameOrigin,
  fail,
  getClientIp,
  handleApiError,
  ok,
  readJson,
} from '@/lib/http';
import { checkRateLimit } from '@/lib/rate-limit';
import { loginSchema, zodDetails } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);

    const ip = getClientIp(request);
    const limit = checkRateLimit(`login:${ip}`, 15, 15 * 60 * 1000);
    if (!limit.allowed) {
      return fail(
        429,
        'RATE_LIMITED',
        'Too many sign-in attempts. Please try again in a few minutes.'
      );
    }

    const parsed = loginSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail(
        400,
        'VALIDATION_ERROR',
        'Please check the highlighted fields.',
        zodDetails(parsed.error)
      );
    }

    const repo = getRepository();
    const account = await repo.getUserByEmail(parsed.data.email);

    if (!account || !account.passwordHash) {
      return fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    const valid = await verifyPassword(parsed.data.password, account.passwordHash);
    if (!valid) {
      return fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    const current = await getSessionUser();
    if (current && current.isGuest && current.id !== account.id) {
      await repo.mergeGuestIntoUser(current.id, account.id);
    }

    await setSessionCookie(account.id);

    return ok({
      data: {
        user: {
          id: account.id,
          email: account.email,
          name: account.name,
          isGuest: account.isGuest,
          createdAt: account.createdAt,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
