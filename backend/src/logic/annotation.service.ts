import {
  createAnnotationRow,
  deleteAnnotationRow,
  findAnnotationById,
  findImageById,
  listAnnotationsByImage,
  updateAnnotationRow,
  type AnnotationWithCategory,
} from '../data/index.js';

export interface AnnotationBoxInput {
  categoryId: number;
  bboxX: number;
  bboxY: number;
  bboxWidth: number;
  bboxHeight: number;
  iscrowd?: boolean;
}

function validateBox(box: Partial<AnnotationBoxInput>): void {
  if (box.bboxX !== undefined && box.bboxX < 0) {
    throw new Error('bboxX no puede ser negativo.');
  }
  if (box.bboxY !== undefined && box.bboxY < 0) {
    throw new Error('bboxY no puede ser negativo.');
  }
  if (box.bboxWidth !== undefined && box.bboxWidth <= 0) {
    throw new Error('bboxWidth debe ser positivo.');
  }
  if (box.bboxHeight !== undefined && box.bboxHeight <= 0) {
    throw new Error('bboxHeight debe ser positivo.');
  }
}

export async function getAnnotationsForImage(imageId: number): Promise<AnnotationWithCategory[]> {
  return listAnnotationsByImage(imageId);
}

export async function createAnnotationForImage(
  imageId: number,
  input: AnnotationBoxInput,
): Promise<AnnotationWithCategory> {
  validateBox(input);

  const image = await findImageById(imageId);
  if (!image) {
    throw new Error('La imagen no existe.');
  }

  const id = await createAnnotationRow({
    imageId,
    categoryId: input.categoryId,
    bboxX: input.bboxX,
    bboxY: input.bboxY,
    bboxWidth: input.bboxWidth,
    bboxHeight: input.bboxHeight,
    area: input.bboxWidth * input.bboxHeight,
    isCrowd: input.iscrowd ?? false,
  });

  const created = await findAnnotationById(id);
  if (!created) {
    throw new Error('No se pudo leer la anotación recién creada.');
  }

  return created;
}

export async function updateAnnotation(
  id: number,
  changes: Partial<AnnotationBoxInput>,
): Promise<AnnotationWithCategory> {
  validateBox(changes);

  const existing = await findAnnotationById(id);
  if (!existing) {
    throw new Error('La anotación no existe.');
  }

  const nextWidth = changes.bboxWidth ?? existing.bboxWidth;
  const nextHeight = changes.bboxHeight ?? existing.bboxHeight;

  const row: Record<string, number | boolean> = { area: nextWidth * nextHeight };
  if (changes.categoryId !== undefined) row.categoryId = changes.categoryId;
  if (changes.bboxX !== undefined) row.bboxX = changes.bboxX;
  if (changes.bboxY !== undefined) row.bboxY = changes.bboxY;
  if (changes.bboxWidth !== undefined) row.bboxWidth = changes.bboxWidth;
  if (changes.bboxHeight !== undefined) row.bboxHeight = changes.bboxHeight;
  if (changes.iscrowd !== undefined) row.isCrowd = changes.iscrowd;

  await updateAnnotationRow(id, row);

  const updated = await findAnnotationById(id);
  if (!updated) {
    throw new Error('No se pudo leer la anotación actualizada.');
  }

  return updated;
}

export async function deleteAnnotation(id: number): Promise<void> {
  await deleteAnnotationRow(id);
}
