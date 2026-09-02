import { db } from '../db/client.js';
import { images, type NewImage } from '../db/schema.js';

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
