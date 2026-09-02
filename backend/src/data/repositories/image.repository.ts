import { count, desc, eq } from 'drizzle-orm';
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
  status?: ImageStatusValue;
  page: number;
  pageSize: number;
}

export interface FindImagesResult {
  data: Image[];
  total: number;
}

/**
 * Busca imágenes en MariaDB, opcionalmente filtradas por status, con
 * paginación y ordenadas de más reciente a más antigua.
 */
export async function findImages(options: FindImagesOptions): Promise<FindImagesResult> {
  const where = options.status ? eq(images.status, options.status) : undefined;
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
