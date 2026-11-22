import type {
  GalleryImage,
  GalleryQuery,
  GenerationRequest,
  HealthReport,
  PublicUser,
  UserStats,
} from './types';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code = 'REQUEST_FAILED', details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiBody {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
  details?: unknown;
  total?: number;
  hasMore?: boolean;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    cache: 'no-store',
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  let body: ApiBody | null = null;
  try {
    body = (await response.json()) as ApiBody;
  } catch {
    body = null;
  }

  if (!response.ok || !body?.success) {
    throw new ApiClientError(
      body?.message || `Request failed (${response.status}).`,
      response.status,
      body?.error,
      body?.details
    );
  }

  return body as T;
}

export interface SessionResponse {
  success: true;
  data: { user: PublicUser | null; stats: (UserStats & { hourlyLimit: number }) | null };
}

export interface GalleryResponse {
  success: true;
  data: GalleryImage[];
  total: number;
  hasMore: boolean;
}

export interface GenerateResponse {
  success: true;
  data: {
    images: GalleryImage[];
    failures: { index: number; message: string }[];
    generationTime: number;
    model: string;
  };
  message: string;
}

export interface HealthResponse {
  success: true;
  data: HealthReport;
}

function buildQuery(params: GalleryQuery): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const clientApi = {
  me() {
    return request<SessionResponse>('/api/auth/me');
  },

  login(email: string, password: string) {
    return request<{ success: true; data: { user: PublicUser } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(input: { name?: string; email: string; password: string }) {
    return request<{ success: true; data: { user: PublicUser } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  logout() {
    return request<{ success: true; data: { signedOut: boolean } }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  gallery(params: GalleryQuery = {}) {
    return request<GalleryResponse>(`/api/gallery${buildQuery(params)}`);
  },

  history(limit = 8) {
    return request<{ success: true; data: GalleryImage[] }>(`/api/history?limit=${limit}`);
  },

  toggleFavorite(id: string) {
    return request<{ success: true; data: { isFavorite: boolean } }>(
      `/api/gallery/${encodeURIComponent(id)}`,
      { method: 'PATCH' }
    );
  },

  deleteImage(id: string) {
    return request<{ success: true; data: { deleted: boolean } }>(
      `/api/gallery/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
  },

  generate(input: GenerationRequest) {
    return request<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  health() {
    return request<HealthResponse>('/api/health');
  },
};
