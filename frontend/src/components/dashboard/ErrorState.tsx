type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-100">
      <p className="text-sm text-slate-500">No se pudo cargar el dashboard.</p>
      <p className="max-w-sm text-xs text-slate-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Reintentar
      </button>
    </div>
  );
}
