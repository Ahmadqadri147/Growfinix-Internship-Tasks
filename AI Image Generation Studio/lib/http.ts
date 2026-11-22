import { NextResponse } from 'next/server';
import { ApiError } from './api-error';
import { getSiteUrl } from './site';

export function ok(data: Record<string, unknown>, init?: ResponseInit): NextResponse {
  return NextResponse.json({ success: true, ...data }, init);
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return fail(error.status, error.code, error.message, error.details);
  }

  console.error('[api] Unhandled error:', error);
  return fail(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (!origin) return;

  const host = request.headers.get('host');
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, 'INVALID_ORIGIN', 'Request origin is not allowed.');
  }

  const allowedHosts = new Set<string>();
  if (host) allowedHosts.add(host);
  try {
    allowedHosts.add(new URL(getSiteUrl()).host);
  } catch {
    // ignore malformed configured site url
  }

  if (!allowedHosts.has(originHost)) {
    throw new ApiError(403, 'INVALID_ORIGIN', 'Request origin is not allowed.');
  }
}

export function assertJsonRequest(request: Request): void {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Expected an application/json request.');
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
