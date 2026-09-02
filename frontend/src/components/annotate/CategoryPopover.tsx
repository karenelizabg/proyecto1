import { useState, type CSSProperties } from "react";
import type { Category } from "../../types/schemas";

interface CategoryPopoverProps {
  categories: Category[];
  /** Posición en píxeles de pantalla (ya calculada por el caller) */
  style: CSSProperties;
  onConfirm: (categoryId: number) => void;
  onCancel: () => void;
}

export function CategoryPopover({ categories, style, onConfirm, onCancel }: CategoryPopoverProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div
      style={style}
      className="absolute z-30 w-56 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg"
    >
      <p className="mb-2 text-xs font-medium text-neutral-500">Elige una categoría</p>
      {categories.length === 0 ? (
        <p className="text-xs text-neutral-400">No hay categorías disponibles.</p>
      ) : (
        <ul className="mb-3 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => setSelectedId(category.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                  selectedId === category.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-neutral-50"
                }`}
              >
                <span
                  aria-hidden
                  className="h-3 w-3 flex-shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: category.color }}
                />
                <span className="truncate">{category.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={selectedId === null}
          onClick={() => selectedId !== null && onConfirm(selectedId)}
          className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
