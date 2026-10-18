import { useCallback, useMemo, useState } from "react";

/**
 * Page-local selection for bulk actions.
 *
 * Selection is intentionally not persisted across pages: the server applies a
 * bulk action atomically per request, and keeping the set in the URL would let
 * a stale tab submit records the user can no longer see.
 */
export const useBulkSelection = () => {
  const [selected, setSelected] = useState(() => new Set());

  const toggle = useCallback((id) => {
    if (id === null || id === undefined) return;
    const key = String(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const selectAll = useCallback((ids = []) => {
    setSelected(new Set(ids.filter(Boolean).map(String)));
  }, []);

  const isSelected = useCallback((id) => selected.has(String(id)), [selected]);

  const selectedIds = useMemo(() => [...selected], [selected]);
  const count = selected.length;

  return { selectedIds, count, toggle, clear, selectAll, isSelected };
};
