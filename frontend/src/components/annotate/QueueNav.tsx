interface QueueNavProps {
  queue: number[];
  currentIndex: number;
  onGoTo: (index: number) => void;
  onFinishQueue: () => void;
}

export function QueueNav({ queue, currentIndex, onGoTo, onFinishQueue }: QueueNavProps) {
  if (queue.length === 0) return null;

  const isLast = currentIndex === queue.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 shadow-sm">
      <p className="text-xs text-neutral-500">
        Imagen {currentIndex + 1} de {queue.length} en la cola
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onGoTo(currentIndex - 1)}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-300"
        >
          ← Anterior
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={onFinishQueue}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Terminar cola
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onGoTo(currentIndex + 1)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Guardar y siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
