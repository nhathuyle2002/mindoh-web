import { useState } from 'react';
import { ArrowUpward, ArrowDownward, UnfoldMore } from '@mui/icons-material';

export type SortDir = 'asc' | 'desc' | null;

/**
 * Manages 3-state column sort (first click → desc, second → asc, third → none).
 *
 * The hook owns the state and provides:
 *  - `sortCol` / `sortDir` — current active sort
 *  - `sortBy(col)` — cycles the sort for a column and returns the new values;
 *     call your fetch callback with those values after this
 *  - `SortIcon` — column header icon that reflects current sort state
 */
export function useTableSort<T extends string>(
  initial?: { col: T; dir: 'asc' | 'desc' },
) {
  const [sortCol, setSortCol] = useState<T | null>(initial?.col ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(initial?.dir ?? null);

  const sortBy = (col: T): { sortCol: T | null; sortDir: SortDir } => {
    let newCol: T | null;
    let newDir: SortDir;
    if (sortCol !== col) {
      newCol = col; newDir = 'desc';
    } else if (sortDir === 'desc') {
      newCol = col; newDir = 'asc';
    } else {
      newCol = null; newDir = null;
    }
    setSortCol(newCol);
    setSortDir(newDir);
    return { sortCol: newCol, sortDir: newDir };
  };

  const SortIcon = ({ col }: { col: T }) => {
    if (sortCol !== col) return <UnfoldMore fontSize="small" sx={{ opacity: 0.3, ml: 0.5, verticalAlign: 'middle' }} />;
    if (sortDir === 'desc') return <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />;
    return <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />;
  };

  return { sortCol, sortDir, sortBy, SortIcon };
}
