import type { Category } from "@/api/schemas";
import type { SearchFilters } from "@/lib/searchFilters";
import { FiltersPanel } from "./FiltersPanel";

interface FiltersSidebarProps {
  filters: SearchFilters;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  onRetryCategories: () => void;
  onChangeFilters: (next: Partial<SearchFilters>) => void;
}

/**
 * Panel de filtros de Búsqueda. Es específico de esta página (no es
 * navegación global — esa vive en GlobalNav/AppLayout).
 */
export function FiltersSidebar({
  filters,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  onChangeFilters,
}: FiltersSidebarProps): JSX.Element {
  return (
    <aside className="w-full shrink-0 border-b border-border bg-surface px-5 py-6 lg:h-screen lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <h2 className="mb-4 text-sm font-semibold text-ink">Filtros</h2>
      <FiltersPanel
        filters={filters}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={onRetryCategories}
        onChange={onChangeFilters}
      />
    </aside>
  );
}
