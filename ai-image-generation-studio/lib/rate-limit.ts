interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

function prune(now: number, windowMs: number, bucket: Bucket): void {
  const cutoff = now - windowMs;
  while (bucket.timestamps.length > 0 && bucket.timestamps[0] <= cutoff) {
    bucket.timestamps.shift();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Best-effort, per-instance rate limiting. Durable quotas (image generation)
 * are enforced against the database instead.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  prune(now, windowMs, bucket);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.timestamps.push(now);

  if (buckets.size > 5000) {
    for (const [bucketKey, value] of buckets) {
      prune(now, windowMs, value);
      if (value.timestamps.length === 0) buckets.delete(bucketKey);
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}
