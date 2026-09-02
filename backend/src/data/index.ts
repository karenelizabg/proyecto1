/**
 * Punto de entrada de la capa DATA.
 *
 * Maneja el acceso a MariaDB y al almacenamiento de archivos en MinIO.
 * Solo la capa Logic debe importar desde aquí.
 */
export { db, pool } from './db/client.js';
export * as schema from './db/schema.js';
export type { Category, Image } from './db/schema.js';
export {
  createImageMetadata,
  deleteImageRow,
  findImageById,
  findImages,
  updateImageStatus,
} from './repositories/image.repository.js';
export { listCategories } from './repositories/category.repository.js';
export type { AnnotationWithCategory } from './repositories/annotation.repository.js';
export {
  createAnnotationRow,
  deleteAnnotationRow,
  findAnnotationById,
  listAnnotationsByImage,
  updateAnnotationRow,
} from './repositories/annotation.repository.js';
// Funciones de almacenamiento en MinIO.
export {
  deleteImageObject,
  ensureMinioBucket,
  getImageObjectStream,
  uploadImageObject,
} from './storage/minio.storage.js';
