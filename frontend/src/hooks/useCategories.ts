import { useEffect, useState } from "react";
import { getJson } from "@/api/client";
import { categoriesResponseSchema, type Category } from "@/api/schemas";

interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    getJson("/categories", categoriesResponseSchema, { signal: controller.signal })
      .then((data) => {
        setCategories(data);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  return {
    categories,
    isLoading,
    error,
    retry: () => setAttempt((n) => n + 1),
  };
}
