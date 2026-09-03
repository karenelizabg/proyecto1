import { findImageById, updateImageStatus, type Image } from '../data/index.js';

const ALLOWED_TRANSITIONS: ReadonlyArray<Image['status']> = ['in_progress', 'completed'];

/**
 * Cambia el status de una imagen (pending -> in_progress -> completed).
 */
export async function setImageStatus(imageId: number, status: Image['status']): Promise<void> {
  if (!ALLOWED_TRANSITIONS.includes(status)) {
    throw new Error('Status inválido.');
  }

  const image = await findImageById(imageId);
  if (!image) {
    throw new Error('La imagen no existe.');
  }

  await updateImageStatus(imageId, status);
}
