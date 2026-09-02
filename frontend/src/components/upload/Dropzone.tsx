import { useCallback, useRef, useState, type DragEvent as ReactDragEvent } from "react";

interface DropzoneProps {
  onFiles: (files: FileList | File[]) => void;
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragActive(false);
      if (event.dataTransfer.files.length > 0) {
        onFiles(event.dataTransfer.files);
      }
    },
    [onFiles]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        isDragActive
          ? "border-indigo-400 bg-indigo-50"
          : "border-neutral-300 bg-white hover:border-neutral-400"
      }`}
    >
      <svg
        aria-hidden
        className="h-9 w-9 text-neutral-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 16.5V9m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3.75 3.75 0 0 1 4.077 4.855A4.5 4.5 0 0 1 17.25 19.5H6.75Z"
        />
      </svg>
      <p className="text-sm font-medium text-neutral-700">
        Arrastra imágenes aquí o haz clic para elegirlas
      </p>
      <p className="text-xs text-neutral-400">JPEG, PNG o WebP · hasta 5 MiB por archivo</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
