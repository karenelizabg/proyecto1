/**
 * Punto de entrada de la capa DATA.
 *
 * Responsabilidad: acceso a MariaDB a través de Drizzle ORM
 * (conexión, schema y, en fases posteriores, repositorios/queries).
 *
 * Regla de arquitectura: solo `logic` debe importar desde aquí.
 * `ui` nunca debe acceder directamente a este módulo.
 */
export { db, pool } from './db/client.js';
export * as schema from './db/schema.js';
