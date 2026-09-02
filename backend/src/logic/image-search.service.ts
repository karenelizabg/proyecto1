import { findImages } from '../data/index.js';
import type { Image } from '../data/index.js';

export interface SearchImagesInput {
  status?: Image['status'] | Image['status'][];
  page: number;
  pageSize: number;
}

export interface SearchImagesResult {
  data: Image[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Busca imágenes paginadas, opcionalmente filtradas por status.
 */
export async function searchImages(input: SearchImagesInput): Promise<SearchImagesResult> {
  const { data, total } = await findImages(input);

  return {
    data,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}
