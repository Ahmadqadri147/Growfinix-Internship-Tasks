import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
import { databaseUrl } from '../config';
import { ARCHIVE_USER_ID } from '../constants';
import { LEGACY_IMAGES } from '../legacy-data';
import { ApiError } from '../api-error';
import type {
  GalleryFilters,
  GalleryImage,
  PublicUser,
  UserRecord,
} from '../types';
import type { Repository } from './index';

type Sql = ReturnType<typeof postgres>;

interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  password_hash: string | null;
  is_guest: boolean;
  created_at: Date | string;
}

interface ImageRow {
  id: string;
  user_id: string;
  prompt: string;
  subject: string | null;
  style: string | null;
  lighting: string | null;
  texture: string | null;
  color_palette: string | null;
  background: string | null;
  camera_angle: string | null;
  negative_prompt: string | null;
  image_type: string | null;
  image_size: string | null;
  aspect_ratio: string | null;
  quality: string | null;
  seed: number | string | null;
  creativity: number | null;
  n: number | null;
  image_url: string;
  blob_pathname: string | null;
  resolution: string | null;
  generation_time: number | null;
  created_at: Date | string;
  is_favorite?: boolean | null;
}

const globalForDb = globalThis as unknown as {
  __studioSql?: Sql;
  __studioSchema?: Promise<void>;
};

function getSql(): Sql {
  if (!globalForDb.__studioSql) {
    globalForDb.__studioSql = postgres(databaseUrl, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }
  return globalForDb.__studioSql;
}

function isoDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    isGuest: Boolean(row.is_guest),
    createdAt: isoDate(row.created_at),
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

function mapImage(row: ImageRow, userId: string): GalleryImage {
  return {
    id: row.id,
    prompt: row.prompt,
    subject: row.subject,
    style: row.style,
    lighting: row.lighting,
    texture: row.texture,
    colorPalette: row.color_palette,
    background: row.background,
    cameraAngle: row.camera_angle,
    negativePrompt: row.negative_prompt,
    imageType: row.image_type,
    imageSize: row.image_size,
    aspectRatio: row.aspect_ratio,
    quality: row.quality,
    seed: row.seed === null ? null : Number(row.seed),
    creativity: row.creativity,
    n: row.n,
    imageUrl: row.image_url,
    blobPathname: row.blob_pathname,
    resolution: row.resolution,
    generationTime: row.generation_time,
    createdAt: isoDate(row.created_at),
    isFavorite: Boolean(row.is_favorite),
    isOwner: row.user_id === userId,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

async function ensureSchema(): Promise<void> {
  if (!globalForDb.__studioSchema) {
    globalForDb.__studioSchema = (async () => {
      const sql = getSql();

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          name TEXT,
          password_hash TEXT,
          is_guest BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS images (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          prompt TEXT NOT NULL,
          subject TEXT,
          style TEXT,
          lighting TEXT,
          texture TEXT,
          color_palette TEXT,
          background TEXT,
          camera_angle TEXT,
          negative_prompt TEXT,
          image_type TEXT,
          image_size TEXT,
          aspect_ratio TEXT,
          quality TEXT,
          seed BIGINT,
          creativity INTEGER,
          n INTEGER,
          image_url TEXT NOT NULL,
          blob_pathname TEXT,
          resolution TEXT,
          generation_time INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS images_user_created_idx
        ON images (user_id, created_at DESC)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS favorites (
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          image_id TEXT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, image_id)
        )
      `;

      await sql`
        INSERT INTO users (id, email, name, password_hash, is_guest, created_at)
        VALUES (${ARCHIVE_USER_ID}, NULL, 'Studio Archive', NULL, FALSE, ${LEGACY_IMAGES[0]?.createdAt ?? new Date().toISOString()})
        ON CONFLICT (id) DO NOTHING
      `;

      for (const image of LEGACY_IMAGES) {
        await sql`
          INSERT INTO images (
            id, user_id, prompt, subject, style, lighting, texture, color_palette,
            background, camera_angle, negative_prompt, image_type, image_size,
            aspect_ratio, quality, seed, creativity, n, image_url, blob_pathname,
            resolution, generation_time, created_at
          ) VALUES (
            ${image.id}, ${ARCHIVE_USER_ID}, ${image.prompt}, ${image.subject},
            ${image.style}, ${image.lighting}, ${image.texture}, ${image.colorPalette},
            ${image.background}, ${image.cameraAngle}, ${image.negativePrompt},
            ${image.imageType}, ${image.imageSize}, ${image.aspectRatio}, ${image.quality},
            ${image.seed}, ${image.creativity}, ${image.n}, ${image.imageUrl}, NULL,
            ${image.resolution}, ${image.generationTime}, ${image.createdAt}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }
    })().catch((error) => {
      globalForDb.__studioSchema = undefined;
      throw error;
    });
  }

  return globalForDb.__studioSchema;
}

function buildWhere(userId: string, filters: GalleryFilters) {
  const sql = getSql();
  const conditions = [
    filters.scope === 'mine'
      ? sql`i.user_id = ${userId}`
      : filters.scope === 'archive'
        ? sql`i.user_id = ${ARCHIVE_USER_ID}`
        : sql`(i.user_id = ${userId} OR i.user_id = ${ARCHIVE_USER_ID})`,
  ];

  if (filters.style) conditions.push(sql`i.style = ${filters.style}`);
  if (filters.lighting) conditions.push(sql`i.lighting = ${filters.lighting}`);
  if (filters.texture) conditions.push(sql`i.texture = ${filters.texture}`);
  if (filters.aspectRatio) conditions.push(sql`i.aspect_ratio = ${filters.aspectRatio}`);
  if (filters.resolution) conditions.push(sql`i.resolution = ${filters.resolution}`);

  if (filters.search) {
    const escaped = filters.search.replace(/[\\%_]/g, (character) => `\\${character}`);
    const pattern = `%${escaped}%`;
    conditions.push(
      sql`(i.prompt ILIKE ${pattern} OR COALESCE(i.subject, '') ILIKE ${pattern} OR COALESCE(i.style, '') ILIKE ${pattern})`
    );
  }

  if (filters.favoritesOnly) conditions.push(sql`f.user_id IS NOT NULL`);

  return conditions.reduce((accumulator, condition) => sql`${accumulator} AND ${condition}`);
}

function buildOrder(filters: GalleryFilters) {
  const sql = getSql();
  if (filters.sortBy === 'oldest') return sql`i.created_at ASC`;
  if (filters.sortBy === 'favorites') return sql`(f.user_id IS NOT NULL) DESC, i.created_at DESC`;
  return sql`i.created_at DESC`;
}

export const repository: Repository = {
  async getUserById(id) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<UserRow[]>`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    return rows[0] ? toPublicUser(mapUser(rows[0])) : null;
  },

  async getUserByEmail(email) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<UserRow[]>`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async createGuestUser() {
    await ensureSchema();
    const sql = getSql();
    const id = randomUUID();
    const rows = await sql<UserRow[]>`
      INSERT INTO users (id, is_guest)
      VALUES (${id}, TRUE)
      RETURNING *
    `;
    return toPublicUser(mapUser(rows[0]));
  },

  async createRegisteredUser(input) {
    await ensureSchema();
    const sql = getSql();
    const id = randomUUID();
    try {
      const rows = await sql<UserRow[]>`
        INSERT INTO users (id, email, name, password_hash, is_guest)
        VALUES (${id}, ${input.email}, ${input.name}, ${input.passwordHash}, FALSE)
        RETURNING *
      `;
      return toPublicUser(mapUser(rows[0]));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
      }
      throw error;
    }
  },

  async upgradeGuestUser(id, input) {
    await ensureSchema();
    const sql = getSql();

    const existing = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE email = ${input.email} AND id <> ${id} LIMIT 1
    `;
    if (existing[0]) {
      throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
    }

    try {
      const rows = await sql<UserRow[]>`
        UPDATE users
        SET email = ${input.email},
            name = ${input.name},
            password_hash = ${input.passwordHash},
            is_guest = FALSE
        WHERE id = ${id}
        RETURNING *
      `;
      if (!rows[0]) throw new ApiError(404, 'USER_NOT_FOUND', 'Session not found.');
      return toPublicUser(mapUser(rows[0]));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
      }
      throw error;
    }
  },

  async mergeGuestIntoUser(guestId, userId) {
    if (guestId === userId) return;
    await ensureSchema();
    const sql = getSql();

    await sql.begin(async (tx) => {
      const guests = await tx<{ id: string; is_guest: boolean }[]>`
        SELECT id, is_guest FROM users WHERE id = ${guestId} LIMIT 1
      `;
      const guest = guests[0];
      if (!guest || !guest.is_guest) return;

      await tx`UPDATE images SET user_id = ${userId} WHERE user_id = ${guestId}`;
      await tx`
        INSERT INTO favorites (user_id, image_id)
        SELECT ${userId}, image_id FROM favorites WHERE user_id = ${guestId}
        ON CONFLICT DO NOTHING
      `;
      await tx`DELETE FROM favorites WHERE user_id = ${guestId}`;
      await tx`DELETE FROM users WHERE id = ${guestId} AND is_guest = TRUE`;
    });
  },

  async updateUserName(id, name) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<UserRow[]>`
      UPDATE users SET name = ${name} WHERE id = ${id} RETURNING *
    `;
    if (!rows[0]) throw new ApiError(404, 'USER_NOT_FOUND', 'Session not found.');
    return toPublicUser(mapUser(rows[0]));
  },

  async createImages(records) {
    await ensureSchema();
    const sql = getSql();
    const inserted: ImageRow[] = [];

    await sql.begin(async (tx) => {
      for (const record of records) {
        const rows = await tx<ImageRow[]>`
          INSERT INTO images (
            id, user_id, prompt, subject, style, lighting, texture, color_palette,
            background, camera_angle, negative_prompt, image_type, image_size,
            aspect_ratio, quality, seed, creativity, n, image_url, blob_pathname,
            resolution, generation_time, created_at
          ) VALUES (
            ${record.id}, ${record.userId}, ${record.prompt}, ${record.subject ?? null},
            ${record.style ?? null}, ${record.lighting ?? null}, ${record.texture ?? null},
            ${record.colorPalette ?? null}, ${record.background ?? null},
            ${record.cameraAngle ?? null}, ${record.negativePrompt ?? null},
            ${record.imageType ?? null}, ${record.imageSize ?? null},
            ${record.aspectRatio ?? null}, ${record.quality ?? null}, ${record.seed ?? null},
            ${record.creativity ?? null}, ${record.n ?? null}, ${record.imageUrl},
            ${record.blobPathname ?? null}, ${record.resolution ?? null},
            ${record.generationTime ?? null}, ${record.createdAt}
          )
          RETURNING *, FALSE AS is_favorite
        `;
        inserted.push(rows[0]);
      }
    });

    const userId = records[0]?.userId ?? '';
    return inserted.map((row) => mapImage(row, userId));
  },

  async listImages(userId, filters) {
    await ensureSchema();
    const sql = getSql();

    const where = buildWhere(userId, filters);
    const order = buildOrder(filters);

    const rows = await sql<ImageRow[]>`
      SELECT i.*, (f.user_id IS NOT NULL) AS is_favorite
      FROM images i
      LEFT JOIN favorites f ON f.image_id = i.id AND f.user_id = ${userId}
      WHERE ${where}
      ORDER BY ${order}
      LIMIT ${filters.limit} OFFSET ${filters.offset}
    `;

    const countRows = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM images i
      LEFT JOIN favorites f ON f.image_id = i.id AND f.user_id = ${userId}
      WHERE ${buildWhere(userId, filters)}
    `;

    const total = countRows[0]?.count ?? 0;
    return {
      images: rows.map((row) => mapImage(row, userId)),
      total,
      hasMore: filters.offset + rows.length < total,
    };
  },

  async getImage(userId, id) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<ImageRow[]>`
      SELECT i.*, (f.user_id IS NOT NULL) AS is_favorite
      FROM images i
      LEFT JOIN favorites f ON f.image_id = i.id AND f.user_id = ${userId}
      WHERE i.id = ${id}
        AND (i.user_id = ${userId} OR i.user_id = ${ARCHIVE_USER_ID})
      LIMIT 1
    `;
    return rows[0] ? mapImage(rows[0], userId) : null;
  },

  async deleteOwnImage(userId, id) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<ImageRow[]>`
      DELETE FROM images
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!rows[0]) return null;
    return mapImage({ ...rows[0], is_favorite: false }, userId);
  },

  async toggleFavorite(userId, imageId) {
    await ensureSchema();
    const sql = getSql();

    const visible = await sql<{ id: string }[]>`
      SELECT id FROM images
      WHERE id = ${imageId}
        AND (user_id = ${userId} OR user_id = ${ARCHIVE_USER_ID})
      LIMIT 1
    `;
    if (!visible[0]) return null;

    const existing = await sql<{ image_id: string }[]>`
      SELECT image_id FROM favorites
      WHERE user_id = ${userId} AND image_id = ${imageId}
      LIMIT 1
    `;

    if (existing[0]) {
      await sql`DELETE FROM favorites WHERE user_id = ${userId} AND image_id = ${imageId}`;
      return { isFavorite: false };
    }

    await sql`
      INSERT INTO favorites (user_id, image_id)
      VALUES (${userId}, ${imageId})
      ON CONFLICT DO NOTHING
    `;
    return { isFavorite: true };
  },

  async getRecent(userId, limit) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<ImageRow[]>`
      SELECT i.*, (f.user_id IS NOT NULL) AS is_favorite
      FROM images i
      LEFT JOIN favorites f ON f.image_id = i.id AND f.user_id = ${userId}
      WHERE i.user_id = ${userId} OR i.user_id = ${ARCHIVE_USER_ID}
      ORDER BY i.created_at DESC
      LIMIT ${limit}
    `;
    return rows.map((row) => mapImage(row, userId));
  },

  async countImagesSince(userId, since) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM images
      WHERE user_id = ${userId} AND created_at >= ${since}
    `;
    return rows[0]?.count ?? 0;
  },

  async getStats(userId) {
    await ensureSchema();
    const sql = getSql();
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);

    const imageRows = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM images WHERE user_id = ${userId}
    `;
    const favoriteRows = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM favorites f
      JOIN images i ON i.id = f.image_id
      WHERE f.user_id = ${userId}
        AND (i.user_id = ${userId} OR i.user_id = ${ARCHIVE_USER_ID})
    `;
    const hourlyRows = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM images
      WHERE user_id = ${userId} AND created_at >= ${cutoff}
    `;

    return {
      imageCount: imageRows[0]?.count ?? 0,
      favoriteCount: favoriteRows[0]?.count ?? 0,
      hourlyUsed: hourlyRows[0]?.count ?? 0,
    };
  },
};
