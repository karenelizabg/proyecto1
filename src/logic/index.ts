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
export { initializeApplication } from './startup.service.js';
