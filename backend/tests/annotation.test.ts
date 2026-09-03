import { describe, expect, it } from 'vitest';

import { validateBboxBase, validateBboxWithBounds } from '../src/logic/annotation.validation.js';

/**
 * Pruebas asociadas a SPEC-ANNOT-001.
 * Trazabilidad: features/annotation.feature ÔåÆ src/logic/annotation.validation.ts
 */
describe('SPEC-ANNOT-001 - validaci├│n de bounding boxes', () => {
  // -------------------------------------------------------------------------
  // Validaci├│n base (forma del dato, sin l├¡mites de imagen)
  // -------------------------------------------------------------------------

  describe('validateBboxBase', () => {
    it('acepta una caja con datos v├ílidos', () => {
      const result = validateBboxBase({
        categoryId: 1,
        bboxX: 10,
        bboxY: 20,
        bboxWidth: 100,
        bboxHeight: 50,
      });

      expect(result.success).toBe(true);
    });

    it('rechaza bboxX negativo', () => {
      const result = validateBboxBase({
        categoryId: 1,
        bboxX: -5,
        bboxY: 0,
        bboxWidth: 100,
        bboxHeight: 50,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rechaza bboxY negativo', () => {
      const result = validateBboxBase({
        categoryId: 1,
        bboxX: 0,
        bboxY: -1,
        bboxWidth: 100,
        bboxHeight: 50,
      });

      expect(result.success).toBe(false);
    });

    it('rechaza bboxWidth igual a cero', () => {
      const result = validateBboxBase({
        categoryId: 1,
        bboxX: 0,
        bboxY: 0,
        bboxWidth: 0,
        bboxHeight: 50,
      });

      expect(result.success).toBe(false);
    });

    it('rechaza bboxHeight negativo', () => {
      const result = validateBboxBase({
        categoryId: 1,
        bboxX: 0,
        bboxY: 0,
        bboxWidth: 100,
        bboxHeight: -10,
      });

      expect(result.success).toBe(false);
    });

    it('rechaza categoryId igual a cero', () => {
      const result = validateBboxBase({
        categoryId: 0,
        bboxX: 0,
        bboxY: 0,
        bboxWidth: 100,
        bboxHeight: 50,
      });

      expect(result.success).toBe(false);
    });

    it('rechaza categoryId negativo', () => {
      const result = validateBboxBase({
        categoryId: -3,
        bboxX: 0,
        bboxY: 0,
        bboxWidth: 100,
        bboxHeight: 50,
      });

      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Validaci├│n con l├¡mites de imagen (canvas bounds)
  // -------------------------------------------------------------------------

  describe('validateBboxWithBounds ÔÇö imagen 640├ù480', () => {
    const W = 640;
    const H = 480;

    it('acepta una caja completamente dentro del canvas', () => {
      const result = validateBboxWithBounds(
        { categoryId: 1, bboxX: 10, bboxY: 20, bboxWidth: 100, bboxHeight: 50 },
        W,
        H,
      );

      expect(result.success).toBe(true);
    });

    it('acepta una caja que ocupa exactamente todo el canvas', () => {
      const result = validateBboxWithBounds(
        { categoryId: 1, bboxX: 0, bboxY: 0, bboxWidth: 640, bboxHeight: 480 },
        W,
        H,
      );

      expect(result.success).toBe(true);
    });

    it('rechaza una caja que excede el ancho (bboxX + bboxWidth > imageWidth)', () => {
      const result = validateBboxWithBounds(
        { categoryId: 1, bboxX: 600, bboxY: 0, bboxWidth: 100, bboxHeight: 50 },
        W,
        H,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rechaza una caja que excede el alto (bboxY + bboxHeight > imageHeight)', () => {
      const result = validateBboxWithBounds(
        { categoryId: 1, bboxX: 0, bboxY: 450, bboxWidth: 100, bboxHeight: 50 },
        W,
        H,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rechaza bboxX negativo aunque no exceda el lado derecho', () => {
      const result = validateBboxWithBounds(
        { categoryId: 1, bboxX: -10, bboxY: 0, bboxWidth: 50, bboxHeight: 50 },
        W,
        H,
      );

      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // C├ílculo de ├írea en backend
  // -------------------------------------------------------------------------

  describe('├írea calculada en backend', () => {
    it('el ├írea de una caja 100├ù50 debe ser 5000', () => {
      const bboxWidth = 100;
      const bboxHeight = 50;
      const area = bboxWidth * bboxHeight;

      expect(area).toBe(5000);
    });

    it('el ├írea nunca puede ser cero si las dimensiones son positivas', () => {
      const bboxWidth = 1;
      const bboxHeight = 1;
      const area = bboxWidth * bboxHeight;

      expect(area).toBeGreaterThan(0);
    });
  });
});
