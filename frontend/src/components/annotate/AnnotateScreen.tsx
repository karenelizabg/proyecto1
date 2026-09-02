import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnnotationCanvas } from "./AnnotationCanvas";
import { Toolbar } from "./Toolbar";
import { QueueNav } from "./QueueNav";
import { useCategories } from "../../hooks/useCategories";
import { useImageAnnotations } from "../../hooks/useImageAnnotations";
import { useToasts } from "../../hooks/useToasts";
import { ToastStack } from "../shared/ToastStack";
import { getImageFileUrl } from "../../lib/api/images";
import type { AnnotateNavigationState } from "../../types/navigation";

const MAX_DISPLAY_WIDTH = 900;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const SEARCH_SCREEN_PATH = "/search";

function parseQueue(param: string | null, currentId: number): number[] {
  if (!param) return [];
  const ids = param
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  return ids.includes(currentId) ? ids : ids.length > 0 ? [currentId, ...ids] : [];
}

export function AnnotateScreen() {
  const params = useParams<{ imageId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado opcional pasado por Upload/Search: ver types/navigation.ts. Nunca
  // es requerido — si viene vacío, se usan valores por defecto.
  const navState = (location.state as AnnotateNavigationState | null) ?? null;

  const imageId = Number(params.imageId);
  const queue = useMemo(
    () => parseQueue(searchParams.get("queue"), imageId),
    [searchParams, imageId]
  );
  const currentIndex = queue.indexOf(imageId);

  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [queueDone, setQueueDone] = useState(false);

  const { toasts, showToast, dismissToast } = useToasts();
  const { categories, isLoading: categoriesLoading, error: categoriesError, retry: retryCategories } =
    useCategories();
  const {
    annotations,
    imageMeta,
    isLoading,
    loadError,
    reload,
    selectedId,
    setSelectedId,
    createBox,
    commitBoxChange,
    removeBox,
    finalize,
    undo,
    canUndo,
  } = useImageAnnotations(imageId, showToast, {
    initialFilename: navState?.filenames?.[imageId],
    initialStatus: navState?.statuses?.[imageId],
  });

  const baseFitScale = imageMeta ? Math.min(1, MAX_DISPLAY_WIDTH / imageMeta.width) : 1;
  const displayScale = baseFitScale * zoomMultiplier;

  const handleZoomIn = useCallback(
    () => setZoomMultiplier((z) => Math.min(MAX_ZOOM, +(z * 1.2).toFixed(2))),
    []
  );
  const handleZoomOut = useCallback(
    () => setZoomMultiplier((z) => Math.max(MIN_ZOOM, +(z / 1.2).toFixed(2))),
    []
  );
  const handleZoomReset = useCallback(() => setZoomMultiplier(1), []);
  const handleWheelZoom = useCallback((deltaY: number) => {
    setZoomMultiplier((z) => {
      const next = deltaY > 0 ? z / 1.08 : z * 1.08;
      return +Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)).toFixed(2);
    });
  }, []);

  const handleUndoKey = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        void undo();
      }
    },
    [undo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleUndoKey);
    return () => window.removeEventListener("keydown", handleUndoKey);
  }, [handleUndoKey]);

  const goToQueueIndex = useCallback(
    (index: number) => {
      const targetId = queue[index];
      if (targetId === undefined) return;
      navigate(`/annotate/${targetId}?queue=${queue.join(",")}`, { state: navState ?? undefined });
    },
    [navigate, navState, queue]
  );

  const handleFinalize = useCallback(async () => {
    setIsFinalizing(true);
    await finalize();
    setIsFinalizing(false);
  }, [finalize]);

  const handleFinishQueue = useCallback(() => {
    setQueueDone(true);
  }, []);

  if (Number.isNaN(imageId)) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center text-sm text-neutral-500">
        La URL no incluye un ID de imagen válido.
      </div>
    );
  }

  if (queueDone) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-lg font-semibold text-neutral-900">Cola completada</h1>
        <p className="text-sm text-neutral-500">
          Anotaste todas las imágenes seleccionadas. Puedes volver a la búsqueda para elegir más.
        </p>
        <button
          type="button"
          onClick={() => navigate(SEARCH_SCREEN_PATH)}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Volver a Search
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8">
      {queue.length > 0 && (
        <QueueNav
          queue={queue}
          currentIndex={Math.max(currentIndex, 0)}
          onGoTo={goToQueueIndex}
          onFinishQueue={handleFinishQueue}
        />
      )}

      {isLoading && (
        <div className="flex h-96 items-center justify-center text-sm text-neutral-400">
          Cargando imagen y anotaciones…
        </div>
      )}

      {!isLoading && loadError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-10 text-center">
          <p className="text-sm text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={reload}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !loadError && imageMeta && (
        <>
          <Toolbar
            filename={imageMeta.filename}
            status={imageMeta.status}
            zoom={displayScale / baseFitScale}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            canUndo={canUndo}
            onUndo={undo}
            onFinalize={handleFinalize}
            isFinalizing={isFinalizing}
          />

          {categoriesError ? (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="flex-1">{categoriesError}</span>
              <button
                type="button"
                onClick={retryCategories}
                className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium hover:bg-red-100"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-6">
              <AnnotationCanvas
                imageUrl={getImageFileUrl(imageId)}
                imageWidth={imageMeta.width}
                imageHeight={imageMeta.height}
                annotations={annotations}
                categories={categoriesLoading ? [] : categories}
                selectedId={selectedId}
                onSelect={setSelectedId}
                displayScale={displayScale}
                onWheelZoom={handleWheelZoom}
                onCreateBox={createBox}
                onCommitChange={commitBoxChange}
                onDelete={removeBox}
              />
            </div>
          )}
        </>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
