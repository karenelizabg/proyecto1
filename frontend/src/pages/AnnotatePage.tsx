import { Link, useParams } from "react-router-dom";

/**
 * Placeholder de la ruta de anotación. El canvas de bounding boxes es
 * responsabilidad de otra parte de la Fase 3 — esta ruta solo garantiza
 * que la navegación desde el grid de Search no rompa.
 */
export function AnnotatePage(): JSX.Element {
  const { imageId } = useParams<{ imageId: string }>();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
      <p className="text-sm text-ink-muted">Canvas de anotación — imagen #{imageId}</p>
      <p className="max-w-sm text-sm text-ink-faint">
        Esta pantalla todavía no está implementada. El grid de búsqueda ya navega
        correctamente hasta aquí.
      </p>
      <Link to="/search" className="text-sm font-medium text-accent-lilac hover:underline">
        ← Volver a Search
      </Link>
    </div>
  );
}
