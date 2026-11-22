import { getOrCreateSessionUser } from '@/lib/auth';
import { canGenerate, hourlyGenerationLimit } from '@/lib/config';
import { generateImages } from '@/lib/generation';
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
import { generationSchema, zodDetails } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);

    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`generate-ip:${ip}`, 12, 5 * 60 * 1000);
    if (!ipLimit.allowed) {
      return fail(
        429,
        'RATE_LIMITED',
        'Too many generation requests from this network. Please wait a moment.'
      );
    }

    const user = await getOrCreateSessionUser(ip);
    const userLimit = checkRateLimit(`generate-user:${user.id}`, 6, 60 * 1000);
    if (!userLimit.allowed) {
      return fail(429, 'RATE_LIMITED', 'Please wait a minute before generating again.');
    }

    const parsed = generationSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail(
        400,
        'VALIDATION_ERROR',
        'Please check the generation settings.',
        zodDetails(parsed.error)
      );
    }

    const availability = canGenerate();
    if (!availability.ok) {
      return fail(
        503,
        'GENERATION_UNAVAILABLE',
        'Image generation is not available on this deployment.',
        availability.reasons
      );
    }

    const requested = parsed.data.n ?? 1;
    const repo = getRepository();
    const used = await repo.countImagesSince(user.id, new Date(Date.now() - 60 * 60 * 1000));

    if (used + requested > hourlyGenerationLimit) {
      return fail(
        429,
        'QUOTA_EXCEEDED',
        `This workspace can generate ${hourlyGenerationLimit} images per hour. ${Math.max(
          0,
          hourlyGenerationLimit - used
        )} remaining.`,
        { used, limit: hourlyGenerationLimit, requested }
      );
    }

    const result = await generateImages(user.id, parsed.data);
    const message =
      result.failures.length > 0
        ? `${result.images.length} image${
            result.images.length === 1 ? '' : 's'
          } generated. ${result.failures.length} could not be completed.`
        : 'Image generated successfully.';

    return ok({
      data: {
        images: result.images,
        failures: result.failures,
        generationTime: result.generationTime,
        model: result.model,
      },
      message,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
