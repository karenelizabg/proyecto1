import type { ReactNode } from "react";
import { GlobalNav } from "./GlobalNav";

/**
 * Shell compartido por Tablero, Buscar y Subir fotografías: mismo nav en
 * las tres pantallas, siempre en el mismo lugar. Ver GlobalNav para por qué
 * Annotate queda fuera de este shell.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      <GlobalNav />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
