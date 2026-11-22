import type { NextRequest } from 'next/server';
import { getOrCreateSessionUser } from '@/lib/auth';
import { getRepository } from '@/lib/repository';
import { fail, getClientIp, handleApiError, ok } from '@/lib/http';
import { galleryQuerySchema, parseSearchParams, zodDetails } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateSessionUser(getClientIp(request));

    const parsed = galleryQuerySchema.safeParse(
      parseSearchParams(request.nextUrl.searchParams)
    );
    if (!parsed.success) {
      return fail(
        400,
        'VALIDATION_ERROR',
        'Some gallery filters are invalid.',
        zodDetails(parsed.error)
      );
    }

    const page = await getRepository().listImages(user.id, parsed.data);

    return ok({
      data: page.images,
      total: page.total,
      hasMore: page.hasMore,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
