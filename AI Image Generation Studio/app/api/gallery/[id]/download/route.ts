import { getSessionUser } from '@/lib/auth';
import { getRepository } from '@/lib/repository';
import { readStoredImage } from '@/lib/storage';
import { fail, handleApiError } from '@/lib/http';
import { toArrayBuffer } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) {
      return fail(400, 'INVALID_ID', 'Invalid image id.');
    }

    const user = await getSessionUser();
    if (!user) {
      return fail(401, 'UNAUTHENTICATED', 'Start a session before downloading images.');
    }

    const image = await getRepository().getImage(user.id, id);
    if (!image) {
      return fail(404, 'NOT_FOUND', 'Image not found.');
    }

    const file = await readStoredImage(image.imageUrl);
    const filename = `image-studio-${id.slice(0, 10)}.png`;

    return new Response(toArrayBuffer(file.bytes), {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(file.bytes.byteLength),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
