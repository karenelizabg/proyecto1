import type { RecentUpload } from '../../types/dashboard';

type RecentUploadsProps = {
  uploads: RecentUpload[];
};

const statusConfig: Record<RecentUpload['status'], { label: string; dotClassName: string }> = {
  completed: { label: 'Completed', dotClassName: 'bg-emerald-500' },
  in_progress: { label: 'In progress', dotClassName: 'bg-amber-400' },
  pending: { label: 'Pending', dotClassName: 'bg-slate-300' },
};

export function RecentUploads({ uploads }: RecentUploadsProps) {
  if (uploads.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-white text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
        Aún no hay imágenes subidas.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="text-sm font-medium text-slate-700">Recent uploads</h3>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
        {uploads.map((upload) => {
          const config = statusConfig[upload.status];
          return (
            <div key={upload.id} className="relative shrink-0">
              <img
                src={upload.thumbnailUrl}
                alt={`Upload ${upload.id} — ${config.label.toLowerCase()}`}
                className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-100"
              />
              <span
                title={config.label}
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${config.dotClassName}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
