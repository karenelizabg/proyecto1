import type { ImageStatus } from "../../types/schemas";

const STATUS_LABELS: Record<ImageStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
};

const STATUS_STYLES: Record<ImageStatus, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export function Toolbar({
  filename,
  status,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  canUndo,
  onUndo,
  onFinalize,
  isFinalizing,
}: {
  filename: string;
  status: ImageStatus;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onFinalize: () => void;
  isFinalizing: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <p className="truncate text-sm font-medium text-neutral-800">{filename}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 px-1">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Alejar"
            className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            −
          </button>
          <button
            type="button"
            onClick={onZoomReset}
            className="min-w-[3.5rem] rounded-md px-1 py-1 text-xs text-neutral-500 hover:bg-neutral-50"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Acercar"
            className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-300"
        >
          Deshacer
          <span className="ml-1 text-xs text-neutral-400">⌘Z</span>
        </button>

        <button
          type="button"
          disabled={status === "completed" || isFinalizing}
          onClick={onFinalize}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {status === "completed" ? "Finalizada" : isFinalizing ? "Finalizando…" : "Finalizar"}
        </button>
      </div>
    </div>
  );
}
