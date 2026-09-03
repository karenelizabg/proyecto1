import { db } from '../db/client.js';
import { categories, type Category } from '../db/schema.js';

/**
 * Lista todas las categorías disponibles.
 */
export async function listCategories(): Promise<Category[]> {
  return db.select().from(categories);
}
