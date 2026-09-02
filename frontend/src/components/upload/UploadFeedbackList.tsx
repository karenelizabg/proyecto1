import type { UploadItem } from "../../hooks/useUploadQueue";

function statusLabel(item: UploadItem): string {
  switch (item.status) {
    case "invalid":
      return item.errorMessage ?? "Archivo inválido";
    case "uploading":
      return `Subiendo… ${item.progress}%`;
    case "success":
      return "Subida completa";
    case "error":
      return item.errorMessage ?? "Error al subir";
  }
}

export function UploadFeedbackList({
  items,
  onRetry,
}: {
  items: UploadItem[];
  onRetry: (clientId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.clientId}
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm"
        >
          <img
            src={item.previewUrl}
            alt=""
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-800">{item.file.name}</p>
            <div className="mt-1 flex items-center gap-2">
              {item.status === "uploading" && (
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              <span
                className={`text-xs ${
                  item.status === "error" || item.status === "invalid"
                    ? "text-red-600"
                    : item.status === "success"
                      ? "text-emerald-600"
                      : "text-neutral-400"
                }`}
              >
                {statusLabel(item)}
              </span>
            </div>
          </div>
          {item.status === "error" && (
            <button
              type="button"
              onClick={() => onRetry(item.clientId)}
              className="flex-shrink-0 rounded-lg border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Reintentar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
