import { hasDatabase, isVercel } from '../config';
import { ApiError } from '../api-error';
import type {
  GalleryFilters,
  GalleryImage,
  GalleryPage,
  NewImageRecord,
  PublicUser,
  UserRecord,
  UserStats,
} from '../types';

export interface Repository {
  getUserById(id: string): Promise<PublicUser | null>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  createGuestUser(): Promise<PublicUser>;
  createRegisteredUser(input: {
    email: string;
    name: string | null;
    passwordHash: string;
  }): Promise<PublicUser>;
  upgradeGuestUser(
    id: string,
    input: { email: string; name: string | null; passwordHash: string }
  ): Promise<PublicUser>;
  mergeGuestIntoUser(guestId: string, userId: string): Promise<void>;
  updateUserName(id: string, name: string): Promise<PublicUser>;
  createImages(records: NewImageRecord[]): Promise<GalleryImage[]>;
  listImages(userId: string, filters: GalleryFilters): Promise<GalleryPage>;
  getImage(userId: string, id: string): Promise<GalleryImage | null>;
  deleteOwnImage(userId: string, id: string): Promise<GalleryImage | null>;
  toggleFavorite(userId: string, imageId: string): Promise<{ isFavorite: boolean } | null>;
  getRecent(userId: string, limit: number): Promise<GalleryImage[]>;
  countImagesSince(userId: string, since: Date): Promise<number>;
  getStats(userId: string): Promise<Omit<UserStats, 'hourlyLimit'>>;
}

let cached: Repository | null = null;

export function getRepository(): Repository {
  if (cached) return cached;

  if (hasDatabase) {
    // Lazy require keeps the Postgres client out of the local-fallback path.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const postgresRepository = require('./postgres').repository as Repository;
    cached = postgresRepository;
    return cached;
  }

  if (isVercel) {
    throw new ApiError(
      503,
      'DATABASE_NOT_CONFIGURED',
      'The database is not configured. Connect a Postgres database and set DATABASE_URL.'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const localRepository = require('./local').repository as Repository;
  cached = localRepository;
  return cached;
}
