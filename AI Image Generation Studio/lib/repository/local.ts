import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ARCHIVE_USER_ID } from '../constants';
import { LEGACY_IMAGES } from '../legacy-data';
import { ApiError } from '../api-error';
import type {
  GalleryFilters,
  GalleryImage,
  NewImageRecord,
  PublicUser,
  UserRecord,
} from '../types';
import type { Repository } from './index';

type StoredImage = Omit<GalleryImage, 'isFavorite' | 'isOwner'> & { userId: string };

interface LocalFavorite {
  userId: string;
  imageId: string;
}

interface LocalDb {
  version: 1;
  users: UserRecord[];
  images: StoredImage[];
  favorites: LocalFavorite[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'studio-db.json');

let state: LocalDb | null = null;
let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function archiveUser(): UserRecord {
  return {
    id: ARCHIVE_USER_ID,
    email: null,
    name: 'Studio Archive',
    passwordHash: null,
    isGuest: false,
    createdAt: '2026-07-15T14:31:06.897Z',
  };
}

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isGuest: user.isGuest,
    createdAt: user.createdAt,
  };
}

function toStoredImage(record: NewImageRecord): StoredImage {
  return {
    id: record.id,
    userId: record.userId,
    prompt: record.prompt,
    subject: record.subject ?? null,
    style: record.style ?? null,
    lighting: record.lighting ?? null,
    texture: record.texture ?? null,
    colorPalette: record.colorPalette ?? null,
    background: record.background ?? null,
    cameraAngle: record.cameraAngle ?? null,
    negativePrompt: record.negativePrompt ?? null,
    imageType: record.imageType ?? null,
    imageSize: record.imageSize ?? null,
    aspectRatio: record.aspectRatio ?? null,
    quality: record.quality ?? null,
    seed: record.seed ?? null,
    creativity: record.creativity ?? null,
    n: record.n ?? null,
    imageUrl: record.imageUrl,
    blobPathname: record.blobPathname ?? null,
    resolution: record.resolution ?? null,
    generationTime: record.generationTime ?? null,
    createdAt: record.createdAt,
  };
}

function mapImage(
  image: StoredImage,
  userId: string,
  favoriteIds: Set<string>
): GalleryImage {
  const { userId: ownerId, ...rest } = image;
  return {
    ...rest,
    isFavorite: favoriteIds.has(image.id),
    isOwner: ownerId === userId,
  };
}

async function persist(db: LocalDb): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
  const tempPath = `${DB_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tempPath, DB_PATH);
}

async function load(): Promise<LocalDb> {
  if (state) return state;

  await fs.mkdir(DB_DIR, { recursive: true });

  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    state = {
      version: 1,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      images: Array.isArray(parsed.images) ? parsed.images : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch {
    state = { version: 1, users: [], images: [], favorites: [] };
  }

  let changed = false;

  if (!state.users.some((user) => user.id === ARCHIVE_USER_ID)) {
    state.users.push(archiveUser());
    changed = true;
  }

  for (const legacy of LEGACY_IMAGES) {
    if (!state.images.some((image) => image.id === legacy.id)) {
      state.images.push({
        id: legacy.id,
        userId: ARCHIVE_USER_ID,
        prompt: legacy.prompt,
        subject: legacy.subject,
        style: legacy.style,
        lighting: legacy.lighting,
        texture: legacy.texture,
        colorPalette: legacy.colorPalette,
        background: legacy.background,
        cameraAngle: legacy.cameraAngle,
        negativePrompt: legacy.negativePrompt,
        imageType: legacy.imageType,
        imageSize: legacy.imageSize,
        aspectRatio: legacy.aspectRatio,
        quality: legacy.quality,
        seed: legacy.seed,
        creativity: legacy.creativity,
        n: legacy.n,
        imageUrl: legacy.imageUrl,
        blobPathname: null,
        resolution: legacy.resolution,
        generationTime: legacy.generationTime,
        createdAt: legacy.createdAt,
      });
      changed = true;
    }
  }

  if (changed) await persist(state);

  return state;
}

function favoriteSet(db: LocalDb, userId: string): Set<string> {
  return new Set(
    db.favorites.filter((favorite) => favorite.userId === userId).map((favorite) => favorite.imageId)
  );
}

function isVisible(image: StoredImage, userId: string, scope: GalleryFilters['scope']): boolean {
  if (scope === 'mine') return image.userId === userId;
  if (scope === 'archive') return image.userId === ARCHIVE_USER_ID;
  return image.userId === userId || image.userId === ARCHIVE_USER_ID;
}

function matchesFilters(image: StoredImage, filters: GalleryFilters): boolean {
  if (filters.style && image.style !== filters.style) return false;
  if (filters.lighting && image.lighting !== filters.lighting) return false;
  if (filters.texture && image.texture !== filters.texture) return false;
  if (filters.aspectRatio && image.aspectRatio !== filters.aspectRatio) return false;
  if (filters.resolution && image.resolution !== filters.resolution) return false;

  if (filters.search) {
    const term = filters.search.toLowerCase();
    const haystack = [image.prompt, image.subject, image.style]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(term)) return false;
  }

  return true;
}

export const repository: Repository = {
  async getUserById(id) {
    return withLock(async () => {
      const db = await load();
      const user = db.users.find((candidate) => candidate.id === id);
      return user ? toPublicUser(user) : null;
    });
  },

  async getUserByEmail(email) {
    return withLock(async () => {
      const db = await load();
      const user = db.users.find(
        (candidate) => candidate.email?.toLowerCase() === email.toLowerCase()
      );
      return user ?? null;
    });
  },

  async createGuestUser() {
    return withLock(async () => {
      const db = await load();
      const user: UserRecord = {
        id: randomUUID(),
        email: null,
        name: null,
        passwordHash: null,
        isGuest: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      await persist(db);
      return toPublicUser(user);
    });
  },

  async createRegisteredUser(input) {
    return withLock(async () => {
      const db = await load();
      if (db.users.some((user) => user.email?.toLowerCase() === input.email.toLowerCase())) {
        throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
      }
      const user: UserRecord = {
        id: randomUUID(),
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      await persist(db);
      return toPublicUser(user);
    });
  },

  async upgradeGuestUser(id, input) {
    return withLock(async () => {
      const db = await load();
      const user = db.users.find((candidate) => candidate.id === id);
      if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Session not found.');

      const emailTaken = db.users.some(
        (candidate) =>
          candidate.id !== id &&
          candidate.email?.toLowerCase() === input.email.toLowerCase()
      );
      if (emailTaken) {
        throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
      }

      user.email = input.email;
      user.name = input.name;
      user.passwordHash = input.passwordHash;
      user.isGuest = false;
      await persist(db);
      return toPublicUser(user);
    });
  },

  async mergeGuestIntoUser(guestId, userId) {
    if (guestId === userId) return;
    return withLock(async () => {
      const db = await load();
      const guest = db.users.find((user) => user.id === guestId);
      if (!guest || !guest.isGuest) return;

      for (const image of db.images) {
        if (image.userId === guestId) image.userId = userId;
      }

      const existing = new Set(
        db.favorites
          .filter((favorite) => favorite.userId === userId)
          .map((favorite) => favorite.imageId)
      );
      for (const favorite of db.favorites) {
        if (favorite.userId !== guestId) continue;
        if (!existing.has(favorite.imageId)) {
          db.favorites.push({ userId, imageId: favorite.imageId });
          existing.add(favorite.imageId);
        }
      }

      db.favorites = db.favorites.filter((favorite) => favorite.userId !== guestId);
      db.users = db.users.filter((user) => user.id !== guestId);
      await persist(db);
    });
  },

  async updateUserName(id, name) {
    return withLock(async () => {
      const db = await load();
      const user = db.users.find((candidate) => candidate.id === id);
      if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Session not found.');
      user.name = name;
      await persist(db);
      return toPublicUser(user);
    });
  },

  async createImages(records) {
    return withLock(async () => {
      const db = await load();
      const stored = records.map(toStoredImage);
      db.images.unshift(...stored);
      await persist(db);
      const favorites = favoriteSet(db, records[0]?.userId ?? '');
      return stored.map((image) => mapImage(image, records[0]?.userId ?? '', favorites));
    });
  },

  async listImages(userId, filters) {
    return withLock(async () => {
      const db = await load();
      const favorites = favoriteSet(db, userId);

      let items = db.images.filter(
        (image) => isVisible(image, userId, filters.scope) && matchesFilters(image, filters)
      );

      if (filters.favoritesOnly) {
        items = items.filter((image) => favorites.has(image.id));
      }

      items.sort((a, b) => {
        if (filters.sortBy === 'favorites') {
          const favoriteDelta = Number(favorites.has(b.id)) - Number(favorites.has(a.id));
          if (favoriteDelta !== 0) return favoriteDelta;
        }
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return filters.sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
      });

      const total = items.length;
      const page = items
        .slice(filters.offset, filters.offset + filters.limit)
        .map((image) => mapImage(image, userId, favorites));

      return {
        images: page,
        total,
        hasMore: filters.offset + page.length < total,
      };
    });
  },

  async getImage(userId, id) {
    return withLock(async () => {
      const db = await load();
      const image = db.images.find(
        (candidate) =>
          candidate.id === id && isVisible(candidate, userId, 'all')
      );
      if (!image) return null;
      return mapImage(image, userId, favoriteSet(db, userId));
    });
  },

  async deleteOwnImage(userId, id) {
    return withLock(async () => {
      const db = await load();
      const index = db.images.findIndex((image) => image.id === id);
      if (index === -1) return null;
      const image = db.images[index];
      if (image.userId !== userId) return null;

      db.images.splice(index, 1);
      db.favorites = db.favorites.filter((favorite) => favorite.imageId !== id);
      await persist(db);

      return {
        ...mapImage(image, userId, new Set()),
        isFavorite: false,
        isOwner: true,
      };
    });
  },

  async toggleFavorite(userId, imageId) {
    return withLock(async () => {
      const db = await load();
      const image = db.images.find(
        (candidate) =>
          candidate.id === imageId && isVisible(candidate, userId, 'all')
      );
      if (!image) return null;

      const index = db.favorites.findIndex(
        (favorite) => favorite.userId === userId && favorite.imageId === imageId
      );

      let isFavorite: boolean;
      if (index === -1) {
        db.favorites.push({ userId, imageId });
        isFavorite = true;
      } else {
        db.favorites.splice(index, 1);
        isFavorite = false;
      }

      await persist(db);
      return { isFavorite };
    });
  },

  async getRecent(userId, limit) {
    return withLock(async () => {
      const db = await load();
      const favorites = favoriteSet(db, userId);
      return db.images
        .filter((image) => isVisible(image, userId, 'all'))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit)
        .map((image) => mapImage(image, userId, favorites));
    });
  },

  async countImagesSince(userId, since) {
    return withLock(async () => {
      const db = await load();
      const cutoff = since.getTime();
      return db.images.filter(
        (image) =>
          image.userId === userId && new Date(image.createdAt).getTime() >= cutoff
      ).length;
    });
  },

  async getStats(userId) {
    return withLock(async () => {
      const db = await load();
      const cutoff = Date.now() - 60 * 60 * 1000;
      const favorites = favoriteSet(db, userId);
      const visibleIds = new Set(
        db.images
          .filter((image) => isVisible(image, userId, 'all'))
          .map((image) => image.id)
      );

      return {
        imageCount: db.images.filter((image) => image.userId === userId).length,
        favoriteCount: [...favorites].filter((id) => visibleIds.has(id)).length,
        hourlyUsed: db.images.filter(
          (image) =>
            image.userId === userId && new Date(image.createdAt).getTime() >= cutoff
        ).length,
      };
    });
  },
};
