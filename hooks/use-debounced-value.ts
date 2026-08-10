"use client";

/** hooks/use-debounced-value.ts — Hook genérico (não é de nenhuma área específica), usado nos campos de busca. */
import { useEffect, useState } from "react";

/** Retorna `value` com atraso de `delayMs`, útil para não disparar busca a cada tecla digitada. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
