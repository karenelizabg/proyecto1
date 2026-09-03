import { describe, expect, it } from 'vitest';

import {
  createAnnotationSchema,
  idParamSchema,
  imageStatusSchema,
  updateAnnotationSchema,
} from '../src/logic/annotation.validation.js';

/**
 * Pruebas asociadas a SPEC-VALID-001.
 * Trazabilidad: features/http-validation.feature ÔåÆ src/logic/annotation.validation.ts
 *
 * Estos esquemas cierran la frontera HTTP: validan el dato externo antes de
 * que llegue a la capa de datos.
 */
describe('SPEC-VALID-001 - validaci├│n de la frontera HTTP', () => {
  // -------------------------------------------------------------------------
  // Body de POST /annotations
  // -------------------------------------------------------------------------

  describe('createAnnotationSchema', () => {
    const validBody = {
      imageId: 1,
      categoryId: 2,
      bboxX: 10,
      bboxY: 20,
      bboxWidth: 100,
      bboxHeight: 50,
    };

    it('acepta un body completo y v├ílido', () => {
      const result = createAnnotationSchema.safeParse(validBody);

      expect(result.success).toBe(true);
    });

    it('rechaza imageId nulo', () => {
      const result = createAnnotationSchema.safeParse({ ...validBody, imageId: null });

      expect(result.success).toBe(false);
    });

    it('rechaza imageId que no es n├║mero', () => {
      const result = createAnnotationSchema.safeParse({
        ...validBody,
        imageId: 'no-soy-un-numero',
      });

      expect(result.success).toBe(false);
    });

    it('rechaza imageId ausente', () => {
      const result = createAnnotationSchema.safeParse({
        categoryId: 2,
        bboxX: 10,
        bboxY: 20,
        bboxWidth: 100,
        bboxHeight: 50,
      });

      expect(result.success).toBe(false);
    });

    it('rechaza un body vac├¡o', () => {
      const result = createAnnotationSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('rechaza imageId igual a cero', () => {
      const result = createAnnotationSchema.safeParse({ ...validBody, imageId: 0 });

      expect(result.success).toBe(false);
    });

    it('rechaza imageId negativo', () => {
      const result = createAnnotationSchema.safeParse({ ...validBody, imageId: -4 });

      expect(result.success).toBe(false);
    });

    it('rechaza imageId decimal', () => {
      const result = createAnnotationSchema.safeParse({ ...validBody, imageId: 1.5 });

      expect(result.success).toBe(false);
    });

    it('el mensaje de error se├▒ala el campo imageId', () => {
      const result = createAnnotationSchema.safeParse({ ...validBody, imageId: null });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        expect(issue?.path).toContain('imageId');
      }
    });

    it('rechaza bboxWidth igual a cero', () => {
      const result = createAnnotationSchema.safeParse({ ...validBody, bboxWidth: 0 });

      expect(result.success).toBe(false);
    });

    it('rechaza bboxX negativo', () => {
      const result = createAnnotationSchema.safeParse({ ...validBody, bboxX: -1 });

      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Body de PATCH /annotations/:id
  // -------------------------------------------------------------------------

  describe('updateAnnotationSchema', () => {
    const validBody = {
      categoryId: 2,
      bboxX: 10,
      bboxY: 20,
      bboxWidth: 100,
      bboxHeight: 50,
    };

    it('acepta un body de actualizaci├│n v├ílido', () => {
      const result = updateAnnotationSchema.safeParse(validBody);

      expect(result.success).toBe(true);
    });

    it('rechaza un body de actualizaci├│n vac├¡o', () => {
      const result = updateAnnotationSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('rechaza categoryId no num├®rico', () => {
      const result = updateAnnotationSchema.safeParse({ ...validBody, categoryId: 'car' });

      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Body de PATCH /images/:id/status
  // -------------------------------------------------------------------------

  describe('imageStatusSchema', () => {
    it('acepta status "completed"', () => {
      const result = imageStatusSchema.safeParse({ status: 'completed' });

      expect(result.success).toBe(true);
    });

    it('acepta status "pending"', () => {
      const result = imageStatusSchema.safeParse({ status: 'pending' });

      expect(result.success).toBe(true);
    });

    it('acepta status "in_progress"', () => {
      const result = imageStatusSchema.safeParse({ status: 'in_progress' });

      expect(result.success).toBe(true);
    });

    it('rechaza un status num├®rico', () => {
      const result = imageStatusSchema.safeParse({ status: 12345 });

      expect(result.success).toBe(false);
    });

    it('rechaza un status con texto arbitrario', () => {
      const result = imageStatusSchema.safeParse({ status: 'borrado' });

      expect(result.success).toBe(false);
    });

    it('rechaza un body sin status', () => {
      const result = imageStatusSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Route param :id
  // -------------------------------------------------------------------------

  describe('idParamSchema', () => {
    it('acepta y convierte un id num├®rico en string', () => {
      const result = idParamSchema.safeParse('7');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(7);
      }
    });

    it('acepta un id num├®rico', () => {
      const result = idParamSchema.safeParse(3);

      expect(result.success).toBe(true);
    });

    it('rechaza un id no num├®rico', () => {
      const result = idParamSchema.safeParse('abc');

      expect(result.success).toBe(false);
    });

    it('rechaza el id cero', () => {
      const result = idParamSchema.safeParse('0');

      expect(result.success).toBe(false);
    });

    it('rechaza un id negativo', () => {
      const result = idParamSchema.safeParse('-5');

      expect(result.success).toBe(false);
    });

    it('rechaza un id decimal', () => {
      const result = idParamSchema.safeParse('2.7');

      expect(result.success).toBe(false);
    });

    it('rechaza una cadena vac├¡a', () => {
      const result = idParamSchema.safeParse('');

      expect(result.success).toBe(false);
    });
  });
});
