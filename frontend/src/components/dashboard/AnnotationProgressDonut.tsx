import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { AnnotationProgress } from '../../types/dashboard';

type AnnotationProgressDonutProps = {
  progress: AnnotationProgress;
};

const COLORS = {
  annotated: '#34d399', // mint, matches the pastel accent palette
  pending: '#e2e8f0', // neutral slate
} as const;

const segments = [
  { key: 'annotated', label: 'Annotated' },
  { key: 'pending', label: 'Pending' },
] as const;

export function AnnotationProgressDonut({ progress }: AnnotationProgressDonutProps) {
  const total = progress.annotated + progress.pending;

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-white text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
        Aún no hay imágenes para anotar.
      </div>
    );
  }

  const data = segments.map((segment) => ({ ...segment, value: progress[segment.key] }));
  const annotatedPct = Math.round((progress.annotated / total) * 100);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="text-sm font-medium text-slate-700">Annotation progress</h3>
      <div className="mt-3 flex items-center gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-slate-900">{annotatedPct}%</span>
            <span className="text-xs text-slate-400">annotated</span>
          </div>
        </div>
        <ul className="space-y-3 text-sm">
          {data.map((entry) => (
            <li key={entry.key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[entry.key] }}
                aria-hidden="true"
              />
              <span className="text-slate-600">{entry.label}</span>
              <span className="ml-auto font-medium text-slate-900">{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
