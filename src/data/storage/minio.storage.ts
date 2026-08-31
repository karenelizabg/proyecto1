import { minioBucket, minioClient } from './minio.client.js';

/**
 * Verifica que el bucket exista.
 * Si no existe, lo crea automáticamente.
 */
export async function ensureMinioBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(minioBucket);

  if (!exists) {
    await minioClient.makeBucket(minioBucket);
  }
}
