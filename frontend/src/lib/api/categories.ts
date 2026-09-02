import { categoriesResponseSchema, type Category } from "../../types/schemas";
import { apiRequest } from "./client";

export function getCategories(): Promise<Category[]> {
  return apiRequest("/categories", categoriesResponseSchema);
}
