import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  double,
  index,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

/**
 * images
 *
 * Metadata de cada imagen del repositorio.
 * `storageKey` guarda la referencia al objeto en el storage (fase 2, MinIO),
 * pero en esta fase no se implementa ninguna subida real: la columna solo
 * deja el schema preparado para no requerir una migration adicional después.
 */
export const images = mysqlTable('images', {
  id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 512 }),
  mimeType: varchar('mime_type', { length: 100 }),
  width: int('width'),
  height: int('height'),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * categories
 *
 * Categorías/clases usadas para anotar imágenes (equivalente a
 * `categories` en el formato COCO).
 */
export const categories = mysqlTable(
  'categories',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [uniqueIndex('categories_name_unique').on(table.name)],
);

/**
 * annotations
 *
 * Bounding box asociado a una imagen y una categoría. Los campos de bbox
 * siguen la convención de COCO (x, y = esquina superior izquierda;
 * width/height = dimensiones de la caja) para que la futura fase de
 * exportación a COCO JSON no requiera cambios de schema.
 */
export const annotations = mysqlTable(
  'annotations',
  {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    imageId: bigint('image_id', { mode: 'number' })
      .notNull()
      .references(() => images.id, { onDelete: 'cascade' }),
    categoryId: bigint('category_id', { mode: 'number' })
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    bboxX: double('bbox_x').notNull(),
    bboxY: double('bbox_y').notNull(),
    bboxWidth: double('bbox_width').notNull(),
    bboxHeight: double('bbox_height').notNull(),
    area: double('area'),
    isCrowd: boolean('iscrowd').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('annotations_image_id_idx').on(table.imageId),
    index('annotations_category_id_idx').on(table.categoryId),
  ],
);

export const imagesRelations = relations(images, ({ many }) => ({
  annotations: many(annotations),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  annotations: many(annotations),
}));

export const annotationsRelations = relations(annotations, ({ one }) => ({
  image: one(images, {
    fields: [annotations.imageId],
    references: [images.id],
  }),
  category: one(categories, {
    fields: [annotations.categoryId],
    references: [categories.id],
  }),
}));

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Annotation = typeof annotations.$inferSelect;
export type NewAnnotation = typeof annotations.$inferInsert;
