type Accent = 'lilac' | 'mint' | 'peach' | 'blue';

type StatCardProps = {
  label: string;
  value: number;
  accent: Accent;
};

const dotColor: Record<Accent, string> = {
  lilac: 'bg-violet-400',
  mint: 'bg-emerald-400',
  peach: 'bg-orange-400',
  blue: 'bg-sky-400',
};

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotColor[accent]}`} aria-hidden="true" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value.toLocaleString('en-US')}
      </p>
    </div>
  );
}
