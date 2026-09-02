import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { BoundingBox, type Corner } from "./BoundingBox";
import { CategoryPopover } from "./CategoryPopover";
import { clampBBox, clientToImageCoords, MIN_BOX_SIZE_PX } from "../../lib/geometry";
import type { Annotation, BBox, Category } from "../../types/schemas";

interface DrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface PendingBox {
  bbox: BBox;
}

interface DragStateMove {
  mode: "move";
  annotationId: number;
  original: BBox;
  pointerStartX: number;
  pointerStartY: number;
}

interface DragStateResize {
  mode: "resize";
  annotationId: number;
  corner: Corner;
  original: BBox;
  pointerStartX: number;
  pointerStartY: number;
}

type DragState = DragStateMove | DragStateResize;

interface AnnotationCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  annotations: Annotation[];
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  displayScale: number;
  onWheelZoom: (deltaY: number) => void;
  onCreateBox: (categoryId: number, bbox: BBox) => Promise<Annotation | null>;
  onCommitChange: (annotationId: number, before: BBox, after: BBox) => Promise<void>;
  onDelete: (annotationId: number) => Promise<void>;
}

function applyMove(original: BBox, dx: number, dy: number, imgW: number, imgH: number): BBox {
  return clampBBox(
    { ...original, bboxX: original.bboxX + dx, bboxY: original.bboxY + dy },
    imgW,
    imgH
  );
}

function applyResize(
  original: BBox,
  corner: Corner,
  dx: number,
  dy: number,
  imgW: number,
  imgH: number
): BBox {
  let { bboxX: x, bboxY: y, bboxWidth: w, bboxHeight: h } = original;

  if (corner === "se") {
    w = original.bboxWidth + dx;
    h = original.bboxHeight + dy;
  } else if (corner === "sw") {
    x = original.bboxX + dx;
    w = original.bboxWidth - dx;
    h = original.bboxHeight + dy;
  } else if (corner === "ne") {
    y = original.bboxY + dy;
    w = original.bboxWidth + dx;
    h = original.bboxHeight - dy;
  } else {
    x = original.bboxX + dx;
    y = original.bboxY + dy;
    w = original.bboxWidth - dx;
    h = original.bboxHeight - dy;
  }

  if (w < MIN_BOX_SIZE_PX) {
    if (corner === "sw" || corner === "nw") x = original.bboxX + original.bboxWidth - MIN_BOX_SIZE_PX;
    w = MIN_BOX_SIZE_PX;
  }
  if (h < MIN_BOX_SIZE_PX) {
    if (corner === "nw" || corner === "ne") y = original.bboxY + original.bboxHeight - MIN_BOX_SIZE_PX;
    h = MIN_BOX_SIZE_PX;
  }

  return clampBBox({ bboxX: x, bboxY: y, bboxWidth: w, bboxHeight: h }, imgW, imgH);
}

export function AnnotationCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  annotations,
  categories,
  selectedId,
  onSelect,
  displayScale,
  onWheelZoom,
  onCreateBox,
  onCommitChange,
  onDelete,
}: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [pendingBox, setPendingBox] = useState<PendingBox | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [draftOverride, setDraftOverride] = useState<{ id: number; bbox: BBox } | null>(null);

  const getRect = useCallback(() => containerRef.current?.getBoundingClientRect() ?? null, []);

  // --- Dibujar caja nueva -----------------------------------------------
  const handleCanvasPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Las cajas existentes y el popover llaman stopPropagation() en su
      // propio pointerdown, así que si este handler se dispara es porque el
      // click fue sobre el lienzo vacío (la <img> tiene pointer-events: none).
      const rect = getRect();
      if (!rect) return;
      const { x, y } = clientToImageCoords(event.clientX, event.clientY, rect, displayScale);
      onSelect(null);
      setDrawState({ startX: x, startY: y, currentX: x, currentY: y });
    },
    [displayScale, getRect, onSelect]
  );

  useEffect(() => {
    if (!drawState) return;

    const handleMove = (event: PointerEvent) => {
      const rect = getRect();
      if (!rect) return;
      const { x, y } = clientToImageCoords(event.clientX, event.clientY, rect, displayScale);
      setDrawState((prev) => (prev ? { ...prev, currentX: x, currentY: y } : prev));
    };

    const handleUp = () => {
      setDrawState((prev) => {
        if (!prev) return null;
        const x = Math.min(prev.startX, prev.currentX);
        const y = Math.min(prev.startY, prev.currentY);
        const w = Math.abs(prev.currentX - prev.startX);
        const h = Math.abs(prev.currentY - prev.startY);
        if (w >= MIN_BOX_SIZE_PX && h >= MIN_BOX_SIZE_PX) {
          const bbox = clampBBox({ bboxX: x, bboxY: y, bboxWidth: w, bboxHeight: h }, imageWidth, imageHeight);
          setPendingBox({ bbox });
        }
        return null;
      });
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [drawState, displayScale, getRect, imageWidth, imageHeight]);

  // --- Mover / redimensionar caja existente ------------------------------
  const startMove = useCallback(
    (annotation: Annotation, event: ReactPointerEvent<HTMLDivElement>) => {
      setDragState({
        mode: "move",
        annotationId: annotation.id,
        original: {
          bboxX: annotation.bboxX,
          bboxY: annotation.bboxY,
          bboxWidth: annotation.bboxWidth,
          bboxHeight: annotation.bboxHeight,
        },
        pointerStartX: event.clientX,
        pointerStartY: event.clientY,
      });
    },
    []
  );

  const startResize = useCallback(
    (annotation: Annotation, corner: Corner, event: ReactPointerEvent<HTMLDivElement>) => {
      setDragState({
        mode: "resize",
        annotationId: annotation.id,
        corner,
        original: {
          bboxX: annotation.bboxX,
          bboxY: annotation.bboxY,
          bboxWidth: annotation.bboxWidth,
          bboxHeight: annotation.bboxHeight,
        },
        pointerStartX: event.clientX,
        pointerStartY: event.clientY,
      });
    },
    []
  );

  useEffect(() => {
    if (!dragState) return;

    const handleMove = (event: PointerEvent) => {
      const dx = (event.clientX - dragState.pointerStartX) / displayScale;
      const dy = (event.clientY - dragState.pointerStartY) / displayScale;
      const next =
        dragState.mode === "move"
          ? applyMove(dragState.original, dx, dy, imageWidth, imageHeight)
          : applyResize(dragState.original, dragState.corner, dx, dy, imageWidth, imageHeight);
      setDraftOverride({ id: dragState.annotationId, bbox: next });
    };

    const handleUp = (event: PointerEvent) => {
      const dx = (event.clientX - dragState.pointerStartX) / displayScale;
      const dy = (event.clientY - dragState.pointerStartY) / displayScale;
      const final =
        dragState.mode === "move"
          ? applyMove(dragState.original, dx, dy, imageWidth, imageHeight)
          : applyResize(dragState.original, dragState.corner, dx, dy, imageWidth, imageHeight);
      setDragState(null);
      setDraftOverride(null);
      void onCommitChange(dragState.annotationId, dragState.original, final);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState, displayScale, imageWidth, imageHeight, onCommitChange]);

  // --- Borrar con teclado -------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId !== null) {
        const target = document.activeElement;
        const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
        if (!isTyping) {
          event.preventDefault();
          void onDelete(selectedId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDelete, selectedId]);

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        onWheelZoom(event.deltaY);
      }
    },
    [onWheelZoom]
  );

  const drawnRect =
    drawState &&
    (() => {
      const x = Math.min(drawState.startX, drawState.currentX);
      const y = Math.min(drawState.startY, drawState.currentY);
      const w = Math.abs(drawState.currentX - drawState.startX);
      const h = Math.abs(drawState.currentY - drawState.startY);
      return { x, y, w, h };
    })();

  return (
    <div className="relative inline-block select-none" onWheel={handleWheel}>
      <div
        ref={containerRef}
        onPointerDown={handleCanvasPointerDown}
        className="relative touch-none"
        style={{ width: imageWidth * displayScale, height: imageHeight * displayScale }}
      >
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full rounded-lg object-contain"
        />

        {annotations.map((annotation) => {
          const overridden =
            draftOverride && draftOverride.id === annotation.id
              ? { ...annotation, ...draftOverride.bbox }
              : annotation;
          return (
            <BoundingBox
              key={annotation.id}
              annotation={overridden}
              displayScale={displayScale}
              isSelected={selectedId === annotation.id}
              onSelect={() => onSelect(annotation.id)}
              onStartMove={(e) => startMove(annotation, e)}
              onStartResize={(corner, e) => startResize(annotation, corner, e)}
              onDelete={() => void onDelete(annotation.id)}
            />
          );
        })}

        {drawnRect && (
          <div
            className="pointer-events-none absolute border-2 border-indigo-500 bg-indigo-500/10"
            style={{
              left: drawnRect.x * displayScale,
              top: drawnRect.y * displayScale,
              width: drawnRect.w * displayScale,
              height: drawnRect.h * displayScale,
            }}
          />
        )}
      </div>

      {pendingBox && (
        <CategoryPopover
          categories={categories}
          style={{
            left: Math.min(pendingBox.bbox.bboxX * displayScale, Math.max(imageWidth * displayScale - 224, 0)),
            top: Math.min(
              (pendingBox.bbox.bboxY + pendingBox.bbox.bboxHeight) * displayScale + 8,
              imageHeight * displayScale - 8
            ),
          }}
          onCancel={() => setPendingBox(null)}
          onConfirm={(categoryId) => {
            void onCreateBox(categoryId, pendingBox.bbox);
            setPendingBox(null);
          }}
        />
      )}
    </div>
  );
}
