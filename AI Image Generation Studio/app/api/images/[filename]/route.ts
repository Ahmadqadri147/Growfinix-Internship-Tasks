import { readLocalUpload } from '@/lib/storage';
import { fail, handleApiError } from '@/lib/http';
import { toArrayBuffer } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ filename: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { filename } = await context.params;
    const file = await readLocalUpload(filename);

    if (!file) {
      return fail(404, 'NOT_FOUND', 'Image not found.');
    }

    return new Response(toArrayBuffer(file.bytes), {
      headers: {
        'Content-Type': file.contentType,
        'Content-Length': String(file.bytes.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
