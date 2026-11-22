export type Style = (typeof import('./constants').STYLES)[number];
export type Lighting = (typeof import('./constants').LIGHTING)[number];
export type Texture = (typeof import('./constants').TEXTURES)[number];
export type Background = (typeof import('./constants').BACKGROUNDS)[number];
export type CameraAngle = (typeof import('./constants').CAMERA_ANGLES)[number];
export type AspectRatio = (typeof import('./constants').ASPECT_RATIOS)[number];
export type ImageSize = (typeof import('./constants').IMAGE_SIZES)[number];
export type Quality = (typeof import('./constants').QUALITIES)[number];
export type SortOption = (typeof import('./constants').SORT_OPTIONS)[number];
export type Scope = (typeof import('./constants').SCOPES)[number];

export interface PublicUser {
  id: string;
  email: string | null;
  name: string | null;
  isGuest: boolean;
  createdAt: string;
}

export interface UserRecord extends PublicUser {
  passwordHash: string | null;
}

export interface GalleryImage {
  id: string;
  prompt: string;
  subject: string | null;
  style: string | null;
  lighting: string | null;
  texture: string | null;
  colorPalette: string | null;
  background: string | null;
  cameraAngle: string | null;
  negativePrompt: string | null;
  imageType: string | null;
  imageSize: string | null;
  aspectRatio: string | null;
  quality: string | null;
  seed: number | null;
  creativity: number | null;
  n: number | null;
  imageUrl: string;
  blobPathname: string | null;
  resolution: string | null;
  generationTime: number | null;
  createdAt: string;
  isFavorite: boolean;
  isOwner: boolean;
}

export interface NewImageRecord {
  id: string;
  userId: string;
  prompt: string;
  subject?: string | null;
  style?: string | null;
  lighting?: string | null;
  texture?: string | null;
  colorPalette?: string | null;
  background?: string | null;
  cameraAngle?: string | null;
  negativePrompt?: string | null;
  imageType?: string | null;
  imageSize?: string | null;
  aspectRatio?: string | null;
  quality?: string | null;
  seed?: number | null;
  creativity?: number | null;
  n?: number | null;
  imageUrl: string;
  blobPathname?: string | null;
  resolution?: string | null;
  generationTime?: number | null;
  createdAt: string;
}

export interface GalleryFilters {
  search?: string;
  style?: string;
  lighting?: string;
  texture?: string;
  aspectRatio?: string;
  resolution?: string;
  scope: Scope;
  favoritesOnly: boolean;
  sortBy: SortOption;
  limit: number;
  offset: number;
}

export interface GalleryPage {
  images: GalleryImage[];
  total: number;
  hasMore: boolean;
}

export interface UserStats {
  imageCount: number;
  favoriteCount: number;
  hourlyUsed: number;
  hourlyLimit: number;
}

export interface UserSession {
  user: PublicUser | null;
  stats: UserStats | null;
}

export interface HealthReport {
  status: 'ok' | 'degraded';
  version: string;
  canGenerate: boolean;
  reasons: string[];
  services: {
    database: { mode: string; configured: boolean };
    storage: { mode: string; configured: boolean };
    generation: { mode: string; configured: boolean; model: string | null };
  };
}

export interface GeneratedImageResult {
  images: GalleryImage[];
  failures: { index: number; message: string }[];
  model: string;
  generationTime: number;
}

export interface GenerationRequest {
  prompt: string;
  subject?: string;
  style?: string;
  lighting?: string;
  texture?: string;
  colorPalette?: string;
  background?: string;
  cameraAngle?: string;
  negativePrompt?: string;
  imageSize?: string;
  aspectRatio?: string;
  quality?: string;
  seed?: number;
  creativity?: number;
  n?: number;
}

export interface ProfileState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

export interface GalleryQuery {
  search?: string;
  style?: string;
  lighting?: string;
  texture?: string;
  aspectRatio?: string;
  resolution?: string;
  scope?: string;
  favoritesOnly?: boolean;
  sortBy?: string;
  limit?: number;
  offset?: number;
}
