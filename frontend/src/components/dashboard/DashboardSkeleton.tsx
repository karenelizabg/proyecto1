function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Pulse className="h-80" />
        <Pulse className="h-80" />
      </div>
      <Pulse className="h-36" />
    </div>
  );
}
