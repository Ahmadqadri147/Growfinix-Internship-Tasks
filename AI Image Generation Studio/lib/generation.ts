import { randomUUID } from 'node:crypto';
import { ApiError, GenerationError } from './api-error';
import { huggingFaceModel, hasHuggingFace } from './config';
import { DEFAULT_SIZE_BY_RATIO, RATIO_BY_SIZE } from './constants';
import { getRepository } from './repository';
import { saveImageBytes, deleteStoredImage } from './storage';
import type { GeneratedImageResult, NewImageRecord } from './types';
import type { GenerationInput } from './validation';

const HF_BASE_URL = 'https://router.huggingface.co/hf-inference/models';
const TOTAL_BUDGET_MS = 52_000;
const MAX_REQUEST_MS = 45_000;

const STEPS_BY_QUALITY: Record<string, number> = {
  standard: 4,
  hd: 6,
  ultra: 8,
};

export function buildPrompt(
  originalPrompt: string,
  options: Pick<
    GenerationInput,
    'style' | 'lighting' | 'texture' | 'colorPalette' | 'background' | 'cameraAngle'
  >
): string {
  let combined = originalPrompt;

  if (options.style) combined = `${options.style}, ${combined}`;
  if (options.lighting) combined = `${combined}, ${options.lighting} lighting`;
  if (options.texture) combined = `${combined}, ${options.texture} texture`;
  if (options.colorPalette) combined = `${combined}, ${options.colorPalette} color palette`;
  if (options.background) combined = `${combined}, ${options.background} background`;
  if (options.cameraAngle) combined = `${combined}, ${options.cameraAngle} camera angle`;

  return combined;
}

export function resolveImageSize(input: GenerationInput): {
  label: string;
  width: number;
  height: number;
} {
  const label =
    input.imageSize ??
    (input.aspectRatio ? DEFAULT_SIZE_BY_RATIO[input.aspectRatio] : undefined) ??
    '1024x1024';
  const [width, height] = label.split('x').map(Number);
  return {
    label,
    width: Number.isFinite(width) ? width : 1024,
    height: Number.isFinite(height) ? height : 1024,
  };
}

function extractSubject(prompt: string): string {
  const firstPeriod = prompt.indexOf('.');
  const firstComma = prompt.indexOf(',');

  if (firstPeriod !== -1 && (firstComma === -1 || firstComma > firstPeriod)) {
    return prompt.slice(0, firstPeriod).trim();
  }
  if (firstComma !== -1 && (firstPeriod === -1 || firstPeriod > firstComma)) {
    return prompt.slice(0, firstComma).trim();
  }
  return prompt.slice(0, 50);
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function mapHuggingFaceError(status: number, payload: Record<string, unknown> | null): GenerationError {
  const rawMessage =
    typeof payload?.error === 'string'
      ? payload.error
      : typeof payload?.message === 'string'
        ? payload.message
        : '';

  if (status === 401) {
    return new GenerationError(
      503,
      'GENERATION_AUTH',
      'The image service rejected the configured API token.'
    );
  }
  if (status === 403) {
    return new GenerationError(
      503,
      'GENERATION_FORBIDDEN',
      'The configured Hugging Face token does not have access to this model.'
    );
  }
  if (status === 402) {
    return new GenerationError(
      503,
      'GENERATION_CREDITS',
      'The Hugging Face account needs credits to run this model.'
    );
  }
  if (status === 429) {
    return new GenerationError(
      429,
      'GENERATION_RATE_LIMITED',
      'The image service is rate limiting requests. Please try again shortly.'
    );
  }
  if (status === 404) {
    return new GenerationError(
      503,
      'MODEL_NOT_FOUND',
      'The configured image model is not available.'
    );
  }
  if (status === 422 || status === 400) {
    return new GenerationError(
      422,
      'INVALID_GENERATION_PARAMETERS',
      rawMessage || 'The image service rejected these generation parameters.'
    );
  }
  if (status >= 500) {
    return new GenerationError(
      502,
      'GENERATION_UNAVAILABLE',
      'The image service is temporarily unavailable. Please try again.'
    );
  }

  return new GenerationError(
    502,
    'GENERATION_FAILED',
    rawMessage || `Image generation failed (HTTP ${status}).`
  );
}

interface RequestOptions {
  attempt?: number;
  minimal?: boolean;
}

async function requestImage(
  prompt: string,
  parameters: Record<string, unknown>,
  deadline: number,
  options: RequestOptions = {}
): Promise<Uint8Array> {
  if (!hasHuggingFace) {
    throw new GenerationError(
      503,
      'GENERATION_NOT_CONFIGURED',
      'Image generation is not configured. Set HUGGINGFACE_API_TOKEN.'
    );
  }

  const attempt = options.attempt ?? 0;
  const remaining = deadline - Date.now();
  if (remaining < 3_000) {
    throw new GenerationError(
      504,
      'GENERATION_TIMEOUT',
      'Generation took too long. Try a smaller size or fewer images.'
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(MAX_REQUEST_MS, remaining));

  let response: Response;
  try {
    response = await fetch(`${HF_BASE_URL}/${huggingFaceModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'image/png',
      },
      body: JSON.stringify(
        options.minimal ? { inputs: prompt } : { inputs: prompt, parameters }
      ),
      signal: controller.signal,
      cache: 'no-store',
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new GenerationError(
        504,
        'GENERATION_TIMEOUT',
        'The image service did not respond in time. Try again with fewer images.'
      );
    }
    console.error('[generation] Network error:', error);
    throw new GenerationError(
      502,
      'GENERATION_NETWORK',
      'Could not reach the image service. Please try again.'
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = parseJson(await response.text());
      if (payload?.error) {
        throw new GenerationError(
          502,
          'GENERATION_FAILED',
          typeof payload.error === 'string'
            ? payload.error
            : 'The image service returned an unexpected response.'
        );
      }
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  const errorText = await response.text().catch(() => '');
  const payload = parseJson(errorText);

  if (response.status === 503 && attempt < 2) {
    const estimated =
      typeof payload?.estimated_time === 'number' ? payload.estimated_time * 1000 : 4_000;
    const wait = Math.min(Math.max(estimated, 2_000), 8_000);
    if (Date.now() + wait + 5_000 < deadline) {
      await new Promise((resolve) => setTimeout(resolve, wait));
      return requestImage(prompt, parameters, deadline, { attempt: attempt + 1, minimal: options.minimal });
    }
  }

  if ((response.status === 422 || response.status === 400) && !options.minimal) {
    return requestImage(prompt, parameters, deadline, { attempt: attempt + 1, minimal: true });
  }

  throw mapHuggingFaceError(response.status, payload);
}

export async function generateImages(
  userId: string,
  input: GenerationInput
): Promise<GeneratedImageResult> {
  if (!hasHuggingFace) {
    throw new ApiError(
      503,
      'GENERATION_NOT_CONFIGURED',
      'Image generation is not configured. Set HUGGINGFACE_API_TOKEN.'
    );
  }

  const count = input.n ?? 1;
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const optimizedPrompt = buildPrompt(input.prompt, input);
  const size = resolveImageSize(input);
  const steps = STEPS_BY_QUALITY[input.quality ?? 'standard'] ?? 4;
  const guidance = Math.max(1, input.creativity ?? 7);

  const baseParameters: Record<string, unknown> = {
    width: size.width,
    height: size.height,
    num_inference_steps: steps,
    guidance_scale: guidance,
  };
  if (input.negativePrompt) baseParameters.negative_prompt = input.negativePrompt;

  const startedAt = Date.now();

  const settled = await Promise.allSettled(
    Array.from({ length: count }, async (_, index) => {
      const seed = input.seed ? input.seed + index : Math.floor(Math.random() * 2_147_483_647);
      const parameters = { ...baseParameters, seed };
      const requestStarted = Date.now();
      const bytes = await requestImage(optimizedPrompt, parameters, deadline);
      return { bytes, seed, duration: Date.now() - requestStarted };
    })
  );

  const successes: { bytes: Uint8Array; seed: number; duration: number; index: number }[] = [];
  const failures: { index: number; message: string }[] = [];

  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successes.push({ ...result.value, index });
    } else {
      const reason = result.reason;
      failures.push({
        index,
        message:
          reason instanceof ApiError
            ? reason.message
            : 'Image generation failed for this image.',
      });
    }
  });

  if (successes.length === 0) {
    const firstFailure = settled.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );
    if (firstFailure?.reason instanceof ApiError) throw firstFailure.reason;
    throw new GenerationError(
      502,
      'GENERATION_FAILED',
      'Image generation failed. Please try again.'
    );
  }

  const repo = getRepository();
  const createdAt = new Date().toISOString();
  const records: NewImageRecord[] = [];
  const storedForCleanup: { url: string; pathname: string | null }[] = [];

  try {
    for (const success of successes) {
      const id = randomUUID();
      const stored = await saveImageBytes(success.bytes, userId, id);
      storedForCleanup.push(stored);

      records.push({
        id,
        userId,
        prompt: optimizedPrompt,
        subject: input.subject ?? extractSubject(input.prompt),
        style: input.style ?? null,
        lighting: input.lighting ?? null,
        texture: input.texture ?? null,
        colorPalette: input.colorPalette ?? null,
        background: input.background ?? null,
        cameraAngle: input.cameraAngle ?? null,
        negativePrompt: input.negativePrompt ?? null,
        imageType: `huggingface:${huggingFaceModel}`,
        imageSize: size.label,
        aspectRatio: input.aspectRatio ?? RATIO_BY_SIZE[size.label] ?? null,
        quality: input.quality ?? 'standard',
        seed: success.seed,
        creativity: input.creativity ?? null,
        n: count,
        imageUrl: stored.url,
        blobPathname: stored.pathname,
        resolution: size.label,
        generationTime: success.duration,
        createdAt,
      });
    }

    const images = await repo.createImages(records);

    return {
      images,
      failures,
      model: huggingFaceModel,
      generationTime: Date.now() - startedAt,
    };
  } catch (error) {
    await Promise.all(
      storedForCleanup.map((image) =>
        deleteStoredImage({ imageUrl: image.url, blobPathname: image.pathname })
      )
    );
    if (error instanceof ApiError) throw error;
    console.error('[generation] Failed to persist generated images:', error);
    throw new GenerationError(
      500,
      'GENERATION_PERSISTENCE_FAILED',
      'The images were generated but could not be saved. Please try again.'
    );
  }
}
