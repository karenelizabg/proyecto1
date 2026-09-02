import { count, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { images, type Image, type NewImage } from '../db/schema.js';

type ImageStatusValue = Image['status'];

/**
 * Guarda en MariaDB los metadatos de una imagen.
 */
export async function createImageMetadata(image: NewImage): Promise<number> {
  const result = await db.insert(images).values(image).$returningId();

  const createdImage = result[0];

  if (!createdImage) {
    throw new Error('No se pudo guardar la imagen en MariaDB.');
  }

  return createdImage.id;
}

export interface FindImagesOptions {
  /** Uno o varios status a incluir. Sin filtro si se omite. */
  status?: ImageStatusValue | ImageStatusValue[];
  page: number;
  pageSize: number;
}

export interface FindImagesResult {
  data: Image[];
  total: number;
}

/**
 * Busca imágenes en MariaDB, opcionalmente filtradas por uno o varios
 * status, con paginación y ordenadas de más reciente a más antigua.
 */
export async function findImages(options: FindImagesOptions): Promise<FindImagesResult> {
  const statuses = options.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : null;
  const firstStatus = statuses?.[0];
  const where = !statuses
    ? undefined
    : statuses.length === 1 && firstStatus
      ? eq(images.status, firstStatus)
      : inArray(images.status, statuses);
  const offset = (options.page - 1) * options.pageSize;

  const [data, totalRows] = await Promise.all([
    db
      .select()
      .from(images)
      .where(where)
      .orderBy(desc(images.createdAt))
      .limit(options.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(images).where(where),
  ]);

  return {
    data,
    total: totalRows[0]?.value ?? 0,
  };
}

/**
 * Busca una imagen por id. Devuelve null si no existe.
 */
export async function findImageById(id: number): Promise<Image | null> {
  const rows = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Actualiza el status de una imagen.
 */
export async function updateImageStatus(id: number, status: ImageStatusValue): Promise<void> {
  await db.update(images).set({ status }).where(eq(images.id, id));
}

/**
 * Elimina el registro de una imagen. Sus anotaciones se borran en cascada
 * (ver `onDelete: 'cascade'` en el schema).
 */
export async function deleteImageRow(id: number): Promise<void> {
  await db.delete(images).where(eq(images.id, id));
}
