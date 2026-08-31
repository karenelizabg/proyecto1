/**
 * Punto de entrada de la capa DATA.
 *
 * Maneja el acceso a MariaDB y al almacenamiento de archivos en MinIO.
 * Solo la capa Logic debe importar desde aquí.
 */
export { db, pool } from './db/client.js';
export * as schema from './db/schema.js';

// Funciones de almacenamiento en MinIO.
export { ensureMinioBucket } from './storage/minio.storage.js';
