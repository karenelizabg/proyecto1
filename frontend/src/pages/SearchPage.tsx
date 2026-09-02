import { useSearchParams } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useImageSearch } from "@/hooks/useImageSearch";
import { filtersFromSearchParams, filtersToSearchParams, hasActiveFilters, type SearchFilters } from "@/lib/searchFilters";
import { Sidebar } from "@/components/search/Sidebar";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterChips } from "@/components/search/FilterChips";
import { ResultsGrid } from "@/components/search/ResultsGrid";
import { Pagination } from "@/components/search/Pagination";

export function SearchPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);

  const { categories, isLoading: categoriesLoading, error: categoriesError, retry: retryCategories } =
    useCategories();
  const { images, pagination, isLoading, error, retry } = useImageSearch(filters);

  function applyFilters(next: Partial<SearchFilters>): void {
    const merged: SearchFilters = { ...filters, ...next };
    setSearchParams(filtersToSearchParams(merged));
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas sm:flex-row">
      <Sidebar
        filters={filters}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={retryCategories}
        onChangeFilters={applyFilters}
      />

      <main className="flex-1 px-8 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5">
          <header className="flex flex-col gap-3">
            <h1 className="text-lg font-semibold text-ink">Buscar imágenes</h1>
            <SearchBar initialValue={filters.q} onSearch={(q) => applyFilters({ q, page: 1 })} />
            <FilterChips filters={filters} categories={categories} onChange={applyFilters} />
          </header>

          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              {pagination ? `${pagination.total} resultados` : isLoading ? "Buscando…" : ""}
            </p>
          </div>

          <ResultsGrid
            images={images}
            isLoading={isLoading}
            error={error}
            hasActiveFilters={hasActiveFilters(filters)}
            onRetry={retry}
          />

          {pagination && pagination.total > 0 && (
            <Pagination pagination={pagination} onPageChange={(page) => applyFilters({ page })} />
          )}
        </div>
      </main>
    </div>
  );
}
