import { getSessionUser } from '@/lib/auth';
import { hourlyGenerationLimit } from '@/lib/config';
import { getRepository } from '@/lib/repository';
import { handleApiError, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return ok({ data: { user: null, stats: null } });
    }

    const stats = await getRepository().getStats(user.id);
    return ok({
      data: {
        user,
        stats: { ...stats, hourlyLimit: hourlyGenerationLimit },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
