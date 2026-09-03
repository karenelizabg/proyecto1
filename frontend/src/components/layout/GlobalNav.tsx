import { LayoutDashboard, Search, Upload } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tablero", to: "/dashboard", icon: LayoutDashboard },
  { label: "Buscar", to: "/search", icon: Search },
  { label: "Subir fotografías", to: "/upload", icon: Upload },
];

/**
 * Navegación global de la app: única fuente de verdad para el sidebar/header
 * de Tablero, Buscar y Subir fotografías. Annotate (pantalla de anotación)
 * NO la usa a propósito — es un modo de enfoque de pantalla completa, con su
 * propio botón "Volver" hacia la pantalla de origen (mismo patrón que
 * Figma/Canva al editar).
 */
export function GlobalNav() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-sidebar lg:h-screen lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-lilac" aria-hidden />
        <span className="truncate text-sm font-semibold text-ink">Portal de Anotación</span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-lilac-soft text-accent-lilac"
                    : "text-ink-muted hover:bg-surface hover:text-ink"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
