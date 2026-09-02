import { useNavigate } from "react-router-dom";
import { Dropzone } from "./Dropzone";
import { UploadFeedbackList } from "./UploadFeedbackList";
import { PendingImageList } from "./PendingImageList";
import { useUploadQueue } from "../../hooks/useUploadQueue";
import { useToasts } from "../../hooks/useToasts";
import { ToastStack } from "../shared/ToastStack";
import type { AnnotateNavigationState } from "../../types/navigation";

export function UploadScreen() {
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToasts();
  const {
    uploadItems,
    pendingEntries,
    isLoadingPending,
    pendingError,
    selectedIds,
    addFiles,
    retryUpload,
    toggleSelect,
    reloadPending,
  } = useUploadQueue(showToast);

  const selectedList = Array.from(selectedIds);

  const handleAnnotateSelected = () => {
    if (selectedList.length === 0) return;

    // Todas las entradas listadas aquí vienen de status=pending (recién
    // subidas o ya existentes en esa lista), así que su status real es
    // 'pending' — se pasa por estado de navegación para que el Canvas no
    // tenga que adivinarlo ni depender de un endpoint adicional.
    const filenames: Record<number, string> = {};
    const statuses: Record<number, "pending"> = {};
    for (const entry of pendingEntries) {
      if (selectedIds.has(entry.id)) {
        filenames[entry.id] = entry.filename;
        statuses[entry.id] = "pending";
      }
    }
    const state: AnnotateNavigationState = { filenames, statuses };

    const [first, ...rest] = selectedList;
    if (rest.length === 0) {
      navigate(`/annotate/${first}`, { state });
    } else {
      navigate(`/annotate/${first}?queue=${selectedList.join(",")}`, { state });
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900">Subir imágenes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Arrastra imágenes o selecciónalas desde tu equipo para agregarlas a la cola de
          anotación.
        </p>
      </header>

      <Dropzone onFiles={addFiles} />

      <UploadFeedbackList items={uploadItems} onRetry={retryUpload} />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Pendientes por anotar</h2>
          <span className="text-xs text-neutral-400">
            {selectedList.length > 0 ? `${selectedList.length} seleccionada(s)` : ""}
          </span>
        </div>
        <PendingImageList
          entries={pendingEntries}
          isLoading={isLoadingPending}
          error={pendingError}
          selectedIds={selectedIds}
          onToggle={toggleSelect}
          onRetry={reloadPending}
        />
      </section>

      <div className="sticky bottom-6 flex justify-end">
        <button
          type="button"
          disabled={selectedList.length === 0}
          onClick={handleAnnotateSelected}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Anotar seleccionadas
        </button>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
