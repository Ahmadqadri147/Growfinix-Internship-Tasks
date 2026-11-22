import { getOrCreateSessionUser } from '@/lib/auth';
import { getRepository } from '@/lib/repository';
import { deleteStoredImage } from '@/lib/storage';
import {
  assertSameOrigin,
  fail,
  getClientIp,
  handleApiError,
  ok,
} from '@/lib/http';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,80}$/.test(id);
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidId(id)) {
      return fail(400, 'INVALID_ID', 'Invalid image id.');
    }

    const user = await getOrCreateSessionUser(getClientIp(request));
    const image = await getRepository().getImage(user.id, id);

    if (!image) {
      return fail(404, 'NOT_FOUND', 'Image not found.');
    }

    return ok({ data: image });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    if (!isValidId(id)) {
      return fail(400, 'INVALID_ID', 'Invalid image id.');
    }

    const user = await getOrCreateSessionUser(getClientIp(request));
    const result = await getRepository().toggleFavorite(user.id, id);

    if (!result) {
      return fail(404, 'NOT_FOUND', 'Image not found.');
    }

    return ok({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const { id } = await context.params;
    if (!isValidId(id)) {
      return fail(400, 'INVALID_ID', 'Invalid image id.');
    }

    const user = await getOrCreateSessionUser(getClientIp(request));
    const repo = getRepository();
    const image = await repo.getImage(user.id, id);

    if (!image) {
      return fail(404, 'NOT_FOUND', 'Image not found.');
    }

    if (!image.isOwner) {
      return fail(403, 'FORBIDDEN', 'Archive images cannot be deleted.');
    }

    const deleted = await repo.deleteOwnImage(user.id, id);
    if (!deleted) {
      return fail(404, 'NOT_FOUND', 'Image not found.');
    }

    await deleteStoredImage(deleted);

    return ok({ data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
