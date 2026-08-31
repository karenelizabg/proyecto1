/**
 * Datos mínimos necesarios para validar una imagen antes de subirla.
 */
export interface ImageUploadInput {
  mimeType: string;
  sizeBytes: number;
}

export interface ImageUploadValidationResult {
  success: boolean;
}

/**
 * Implementación temporal para iniciar el ciclo TDD en RED.
 */
export function validateImageUpload(
  _input: ImageUploadInput,
  _maxSizeBytes: number,
): ImageUploadValidationResult {
  return { success: false };
}