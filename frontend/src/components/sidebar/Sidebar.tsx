import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { Database, LayoutDashboard, PenSquare, Search, Settings } from 'lucide-react';

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

// "Annotate" points at /upload, the entry point of the upload + canvas flow,
// since /annotate/:imageId requires an image id we don't have from the sidebar.
// Adjust `to` here if the real app exposes a different jump-in route.
const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Annotate', to: '/upload', icon: PenSquare },
  { label: 'Search', to: '/search', icon: Search },
  { label: 'Datasets', to: '/datasets', icon: Database, disabled: true },
  { label: 'Settings', to: '/settings', icon: Settings, disabled: true },
];

export function Sidebar() {
  return (
    <nav className="flex h-full w-56 shrink-0 flex-col border-r border-slate-100 bg-white px-3 py-6">
      <div className="px-3 pb-6 text-sm font-semibold text-slate-900">Annotation Portal</div>
      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <li key={item.label}>
                <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </span>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
