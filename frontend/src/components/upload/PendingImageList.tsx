import { getImageFileUrl } from "../../lib/api/images";
import type { PendingEntry } from "../../hooks/useUploadQueue";

export function PendingImageList({
  entries,
  isLoading,
  error,
  selectedIds,
  onToggle,
  onRetry,
}: {
  entries: PendingEntry[];
  isLoading: boolean;
  error: string | null;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  onRetry: () => void;
}) {
  if (isLoading && entries.length === 0) {
    return <p className="text-sm text-neutral-400">Cargando imágenes pendientes…</p>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <span className="flex-1">{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium hover:bg-red-100"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-sm text-neutral-400">No hay imágenes pendientes por anotar.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {entries.map((entry) => {
        const checked = selectedIds.has(entry.id);
        return (
          <label
            key={entry.id}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-colors ${
              checked ? "border-indigo-400 ring-2 ring-indigo-100" : "border-neutral-200"
            }`}
          >
            <input
              type="checkbox"
              className="absolute left-2 top-2 z-10 h-4 w-4 rounded border-neutral-300 accent-indigo-600"
              checked={checked}
              onChange={() => onToggle(entry.id)}
            />
            <img
              src={entry.previewUrl ?? getImageFileUrl(entry.id)}
              alt={entry.filename}
              className="aspect-square w-full object-cover"
            />
            <span className="truncate px-2 py-1.5 text-xs text-neutral-600">{entry.filename}</span>
          </label>
        );
      })}
    </div>
  );
}
