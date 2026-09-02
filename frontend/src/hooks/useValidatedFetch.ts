import { useCallback, useEffect, useState } from 'react';
import type { ZodSchema } from 'zod';

type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

/**
 * Wraps native fetch + Zod validation so no component ever trusts an
 * unvalidated backend payload. On a schema mismatch we surface a generic
 * error instead of silently rendering `undefined`/`NaN` in the UI.
 */
export function useValidatedFetch<T>(url: string, schema: ZodSchema<T>) {
  const [state, setState] = useState<FetchState<T>>({ status: 'loading' });

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`El servidor respondió con estado ${res.status}.`);
        }
        const json: unknown = await res.json();
        const parsed = schema.safeParse(json);
        if (!parsed.success) {
          throw new Error('La respuesta del servidor no tiene el formato esperado.');
        }
        if (!cancelled) {
          setState({ status: 'success', data: parsed.data });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Error desconocido al cargar los datos.';
        setState({ status: 'error', message });
      });

    return () => {
      cancelled = true;
    };
  }, [url, schema]);

  useEffect(() => load(), [load]);

  return { ...state, reload: load };
}
