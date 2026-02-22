import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close, FilterAlt, FilterAltOff } from '@mui/icons-material';
import { COLORS } from '../constants/colors';
import type { ExpenseKind } from '../types/api';

interface ExtendedExpenseFilter {
  kind?: ExpenseKind;
  types?: string[];
  currencies?: string[];
  original_currency?: string;
  from?: string;
  to?: string;
  group_by?: string;
}

interface FilterSectionProps {
  filters: ExtendedExpenseFilter;
  fromDate: Date | null;
  toDate: Date | null;
  availableTypes?: string[];
  availableCurrencies?: string[];
  onFilterChange: (field: keyof ExtendedExpenseFilter | 'from_date' | 'to_date', value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onClose?: () => void;
  hasActiveFilters: boolean;
  showKind?: boolean;
  showType?: boolean;
  showCurrencies?: boolean;
  showGroupBy?: boolean;
  showOriginalCurrency?: boolean;
}

const selectSx = { fontSize: '0.875rem', height: 40 };
const fcSx = { minWidth: 130, flex: '1 1 130px' };

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  fromDate,
  toDate,
  availableTypes = [],
  availableCurrencies = ['VND', 'USD'],
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onClose,
  hasActiveFilters,
  showKind = true,
  showType = true,
  showCurrencies = true,
  showGroupBy = true,
  showOriginalCurrency = true,
}) => {
  const activeChips: { label: string; onDelete: () => void }[] = [];
  if (filters.kind) activeChips.push({ label: `Kind: ${filters.kind}`, onDelete: () => onFilterChange('kind', undefined) });
  if (filters.types?.length) activeChips.push({ label: `Types: ${filters.types.join(', ')}`, onDelete: () => onFilterChange('types', []) });
  if (filters.currencies?.length) activeChips.push({ label: `Currencies: ${filters.currencies.join(', ')}`, onDelete: () => onFilterChange('currencies', []) });
  if (filters.group_by) activeChips.push({ label: `Group: ${filters.group_by}`, onDelete: () => onFilterChange('group_by', undefined) });
  if (fromDate) activeChips.push({ label: `From: ${fromDate.toLocaleDateString()}`, onDelete: () => onFilterChange('from_date', null) });
  if (toDate) activeChips.push({ label: `To: ${toDate.toLocaleDateString()}`, onDelete: () => onFilterChange('to_date', null) });

  return (
    <Box sx={{ px: 2.5, pt: 2, pb: activeChips.length > 0 ? 1.5 : 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterAlt fontSize="small" sx={{ color: hasActiveFilters ? COLORS.income.main : COLORS.text.tertiary }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.text.primary, letterSpacing: '0.02em' }}>
            Filters
          </Typography>
          {hasActiveFilters && (
            <Chip label={activeChips.length} size="small"
              sx={{ height: 18, fontSize: '0.7rem', bgcolor: COLORS.income.main, color: '#fff', fontWeight: 700, ml: 0.5 }} />
          )}
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          {hasActiveFilters && (
            <Button size="small" startIcon={<FilterAltOff fontSize="small" />} onClick={onClearFilters}
              sx={{ fontSize: '0.76rem', color: COLORS.text.tertiary, textTransform: 'none', minWidth: 0, px: 1 }}>
              Clear all
            </Button>
          )}
          <Button size="small" variant="contained" onClick={onApplyFilters}
            sx={{
              fontSize: '0.8rem', fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 2.5,
              background: `linear-gradient(135deg, ${COLORS.income.light} 0%, ${COLORS.income.main} 100%)`,
              boxShadow: '0 2px 8px rgba(40,199,111,0.25)',
              '&:hover': { boxShadow: '0 4px 12px rgba(40,199,111,0.35)', transform: 'translateY(-1px)' },
              transition: 'all 0.15s ease',
            }}>
            Apply
          </Button>
          {onClose && (
            <IconButton size="small" onClick={onClose} sx={{ color: COLORS.text.tertiary }}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Controls */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center">
          {showKind && (
            <FormControl size="small" sx={fcSx}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Kind</InputLabel>
              <Select value={filters.kind || ''} label="Kind"
                onChange={(e) => onFilterChange('kind', e.target.value as ExpenseKind || undefined)} sx={selectSx}>
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </Select>
            </FormControl>
          )}

          {showType && availableTypes.length > 0 && (
            <FormControl size="small" sx={{ ...fcSx, minWidth: 160 }}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Types</InputLabel>
              <Select multiple value={filters.types || []}
                onChange={(e) => { const v = e.target.value; onFilterChange('types', typeof v === 'string' ? v.split(',') : v); }}
                input={<OutlinedInput label="Types" />}
                renderValue={(s) => (s as string[]).join(', ')} sx={selectSx}>
                {availableTypes.map((t) => (
                  <MenuItem key={t} value={t} dense>
                    <Checkbox size="small" checked={(filters.types || []).includes(t)} sx={{ py: 0 }} />
                    <ListItemText primary={t} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {showCurrencies && (
            <FormControl size="small" sx={{ ...fcSx, minWidth: 150 }}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Currencies</InputLabel>
              <Select multiple value={filters.currencies || []}
                onChange={(e) => { const v = e.target.value; onFilterChange('currencies', typeof v === 'string' ? v.split(',') : v); }}
                input={<OutlinedInput label="Currencies" />}
                renderValue={(s) => (s as string[]).join(', ')} sx={selectSx}>
                {availableCurrencies.map((c) => (
                  <MenuItem key={c} value={c} dense>
                    <Checkbox size="small" checked={(filters.currencies || []).includes(c)} sx={{ py: 0 }} />
                    <ListItemText primary={c} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {showOriginalCurrency && (
            <FormControl size="small" sx={fcSx}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Currency</InputLabel>
              <Select value={filters.original_currency || 'VND'} label="Currency"
                onChange={(e) => onFilterChange('original_currency', e.target.value)} sx={selectSx}>
                {availableCurrencies.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          {showGroupBy && (
            <FormControl size="small" sx={fcSx}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Group By</InputLabel>
              <Select value={filters.group_by || ''} label="Group By"
                onChange={(e) => onFilterChange('group_by', e.target.value || undefined)} sx={selectSx}>
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="DAY">Day</MenuItem>
                <MenuItem value="MONTH">Month</MenuItem>
                <MenuItem value="YEAR">Year</MenuItem>
              </Select>
            </FormControl>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            <DatePicker label="From" value={fromDate} onChange={(v) => onFilterChange('from_date', v)}
              slotProps={{ textField: { size: 'small', sx: { width: 148, '& .MuiInputBase-root': { height: 40, fontSize: '0.875rem' } } } }} />
            <Typography variant="body2" sx={{ color: COLORS.text.tertiary }}>→</Typography>
            <DatePicker label="To" value={toDate} onChange={(v) => onFilterChange('to_date', v)}
              slotProps={{ textField: { size: 'small', sx: { width: 148, '& .MuiInputBase-root': { height: 40, fontSize: '0.875rem' } } } }} />
          </Box>
        </Box>
      </LocalizationProvider>

      {/* Active chips */}
      {activeChips.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={0.75} mt={1.5}>
          {activeChips.map((chip) => (
            <Chip key={chip.label} label={chip.label} size="small" onDelete={chip.onDelete}
              sx={{ fontSize: '0.75rem', height: 24, bgcolor: 'rgba(79,156,254,0.1)', color: COLORS.text.secondary, fontWeight: 500,
                '& .MuiChip-deleteIcon': { fontSize: '0.9rem', color: COLORS.text.tertiary } }} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FilterSection;
