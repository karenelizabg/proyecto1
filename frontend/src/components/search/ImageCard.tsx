import { useNavigate } from "react-router-dom";
import type { ImageSearchItem } from "@/api/schemas";
import { resolveBackendUrl } from "@/lib/api/images";
import { StatusBadge } from "./StatusBadge";
import type { AnnotateNavigationState } from "../../types/navigation";

interface ImageCardProps {
  image: ImageSearchItem;
}

export function ImageCard({ image }: ImageCardProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        const state: AnnotateNavigationState = { from: "search" };
        navigate(`/annotate/${image.id}`, { state });
      }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-card transition-shadow hover:shadow-popover"
    >
      <div className="aspect-square w-full overflow-hidden bg-sidebar">
        {/* thumbnailUrl viene del backend como ruta canónica; el frontend la
            resuelve contra la base del API (proxy /api en desarrollo). */}
        <img
          src={resolveBackendUrl(image.thumbnailUrl)}
          alt={image.filename}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <StatusBadge status={image.status} />
        <span className="text-xs text-ink-muted">{image.annotationsCount} anot.</span>
      </div>
    </button>
  );
}
