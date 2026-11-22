import { clearSessionCookie } from '@/lib/auth';
import { assertSameOrigin, handleApiError, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await clearSessionCookie();
    return ok({ data: { signedOut: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
