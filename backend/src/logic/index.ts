/**
 * Punto de entrada de la capa LOGIC.
 *
 * Responsabilidad: reglas de negocio, validaciones y (en fases
 * posteriores) procesamiento de imágenes/anotaciones.
 *
 * Regla de arquitectura: es la única capa que puede importar de `data`.
 * No debe contener código específico de UI (Express, HTTP, etc.).
 */

export type { HealthStatus } from './health.service.js';
export { checkHealth } from './health.service.js';

export { deleteImage, uploadImage } from './image-upload.service.js';
export type { SearchImagesInput, SearchImagesResult } from './image-search.service.js';
export { searchImages } from './image-search.service.js';
export { initializeApplication } from './startup.service.js';
export { getCategories } from './category.service.js';
export type { AnnotationBoxInput } from './annotation.service.js';
export {
  createAnnotationForImage,
  deleteAnnotation,
  getAnnotationsForImage,
  updateAnnotation,
} from './annotation.service.js';
export type { ImageFile } from './image-file.service.js';
export { getImageFile } from './image-file.service.js';
export { setImageStatus } from './image-status.service.js';

