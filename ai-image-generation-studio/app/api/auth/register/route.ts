import { getSessionUser, hashPassword, setSessionCookie } from '@/lib/auth';
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
import { registerSchema, zodDetails } from '@/lib/validation';
import { ApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);

    const ip = getClientIp(request);
    const limit = checkRateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return fail(
        429,
        'RATE_LIMITED',
        'Too many account attempts. Please try again in a few minutes.'
      );
    }

    const parsed = registerSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail(
        400,
        'VALIDATION_ERROR',
        'Please check the highlighted fields.',
        zodDetails(parsed.error)
      );
    }

    const current = await getSessionUser();
    if (current && !current.isGuest) {
      throw new ApiError(409, 'ALREADY_REGISTERED', 'You are already signed in.');
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const repo = getRepository();

    const user =
      current && current.isGuest
        ? await repo.upgradeGuestUser(current.id, {
            email: parsed.data.email,
            name: parsed.data.name ?? null,
            passwordHash,
          })
        : await repo.createRegisteredUser({
            email: parsed.data.email,
            name: parsed.data.name ?? null,
            passwordHash,
          });

    await setSessionCookie(user.id);

    return ok({ data: { user } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
