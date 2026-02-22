import { subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export type DatePreset = 'all' | 'last_7d' | 'this_month' | 'last_3m' | 'last_6m' | 'last_12m' | 'custom';

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'last_7d',    label: 'Last 7d' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_3m',    label: 'Last 3M' },
  { value: 'last_6m',    label: 'Last 6M' },
  { value: 'last_12m',   label: 'Last 12M' },
  { value: 'custom',     label: 'Custom' },
];

/** Returns date range for a preset, or null for 'all' / 'custom'. */
export const getPresetDates = (preset: DatePreset): { from: Date; to: Date } | null => {
  const now = new Date();
  switch (preset) {
    case 'last_7d':    return { from: subDays(now, 6), to: now };
    case 'this_month': return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'last_3m':    return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
    case 'last_6m':    return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
    case 'last_12m':   return { from: startOfMonth(subMonths(now, 11)), to: endOfMonth(now) };
    default:           return null;
  }
};
