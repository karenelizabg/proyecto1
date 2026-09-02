import type { Category } from "@/api/schemas";
import type { SearchFilters } from "@/lib/searchFilters";
import { FiltersPanel } from "./FiltersPanel";

const NAV_ITEMS = [
  { label: "Search", active: true },
  { label: "Dashboard", active: false },
  { label: "Reports", active: false },
];

interface SidebarProps {
  filters: SearchFilters;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  onRetryCategories: () => void;
  onChangeFilters: (next: Partial<SearchFilters>) => void;
}

export function Sidebar({
  filters,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  onChangeFilters,
}: SidebarProps): JSX.Element {
  return (
    <aside className="flex w-full shrink-0 flex-col overflow-y-auto border-b border-border bg-sidebar px-5 py-6 sm:h-screen sm:w-64 sm:border-b-0 sm:border-r">
      <div className="mb-6 flex items-center gap-2 px-1">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-lilac" />
        <span className="text-sm font-semibold text-ink">Annotation Portal</span>
      </div>

      <nav className="mb-8 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={!item.active}
            className={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
              item.active
                ? "bg-accent-lilac-soft font-medium text-accent-lilac"
                : "cursor-not-allowed text-ink-faint"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-border pt-5">
        <FiltersPanel
          filters={filters}
          categories={categories}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
          onRetryCategories={onRetryCategories}
          onChange={onChangeFilters}
        />
      </div>
    </aside>
  );
}
