import type { NextRequest } from 'next/server';
import { getOrCreateSessionUser } from '@/lib/auth';
import { getRepository } from '@/lib/repository';
import { getClientIp, handleApiError, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateSessionUser(getClientIp(request));
    const rawLimit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '8', 10);
    const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 8, 1), 24);

    const page = await getRepository().listImages(user.id, {
      scope: 'mine',
      favoritesOnly: false,
      sortBy: 'newest',
      limit,
      offset: 0,
    });

    return ok({ data: page.images });
  } catch (error) {
    return handleApiError(error);
  }
}
