import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close } from '@mui/icons-material';
import { COLORS } from '../constants/colors';
import type { ExpenseKind } from '../types/api';
import FilterChip from './FilterChip';

// Extended filter interface to match Dashboard usage
interface ExtendedExpenseFilter {
  kind?: ExpenseKind;
  type?: string;
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
  // visibility flags (all default to true)
  showKind?: boolean;
  showType?: boolean;
  showCurrencies?: boolean;
  showGroupBy?: boolean;
  showOriginalCurrency?: boolean;
}

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
  return (
    <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }} elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Filter Expenses</Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        )}
      </Box>
      
      {/* Active Filters */}
      {hasActiveFilters && (
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {filters.kind && (
            <FilterChip
              label={`Kind: ${filters.kind}`}
              onDelete={() => onFilterChange('kind', undefined)}
            />
          )}
          {filters.type && (
            <FilterChip
              label={`Type: ${filters.type}`}
              onDelete={() => onFilterChange('type', undefined)}
            />
          )}
          {filters.currencies && filters.currencies.length > 0 && (
            <FilterChip
              label={`Currencies: ${filters.currencies.join(', ')}`}
              onDelete={() => onFilterChange('currencies', [])}
            />
          )}
          {filters.group_by && (
            <FilterChip
              label={`Group By: ${filters.group_by}`}
              onDelete={() => onFilterChange('group_by', undefined)}
            />
          )}
          {fromDate && (
            <FilterChip
              label={`From: ${fromDate.toLocaleDateString()}`}
              onDelete={() => onFilterChange('from_date', null)}
            />
          )}
          {toDate && (
            <FilterChip
              label={`To: ${toDate.toLocaleDateString()}`}
              onDelete={() => onFilterChange('to_date', null)}
            />
          )}
        </Box>
      )}

      {/* Filter Fields */}
      <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
        <Box flex="1 1 150px" minWidth={{ xs: '100%', sm: '150px' }}>
          {showKind && (
          <TextField
            select
            fullWidth
            label="Kind"
            value={filters.kind || ''}
            onChange={(e) => onFilterChange('kind', e.target.value as ExpenseKind)}
            size="small"
            sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="income">Income</MenuItem>
          </TextField>
          )}
        </Box>
        <Box flex="1 1 150px" minWidth={{ xs: '100%', sm: '150px' }}>
          {showType && (
          <TextField
            select
            fullWidth
            label="Type"
            value={filters.type || ''}
            onChange={(e) => onFilterChange('type', e.target.value)}
            size="small"
            sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
          >
            <MenuItem value="">All</MenuItem>
            {availableTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          )}
        </Box>
        <Box flex="1 1 150px" minWidth={{ xs: '100%', sm: '150px' }}>
          {showCurrencies && (
          <TextField
            select
            fullWidth
            label="Currencies"
            value={filters.currencies || []}
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange('currencies', typeof value === 'string' ? value.split(',') : value);
            }}
            SelectProps={{
              multiple: true,
              renderValue: (selected) => (selected as string[]).join(', '),
            }}
            size="small"
            sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
          >
            {availableCurrencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </TextField>
          )}
        </Box>
        <Box flex="1 1 150px" minWidth={{ xs: '100%', sm: '150px' }}>
          {showOriginalCurrency && (
          <TextField
            select
            fullWidth
            label="Original Currency"
            value={filters.original_currency || 'VND'}
            onChange={(e) => onFilterChange('original_currency', e.target.value)}
            size="small"
            sx={{ 
              '& .MuiInputBase-input': { fontSize: '0.875rem' },
            }}
          >
            {availableCurrencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </TextField>
          )}
        </Box>
        <Box flex="1 1 150px" minWidth={{ xs: '100%', sm: '150px' }}>
          {showGroupBy && (
          <TextField
            select
            fullWidth
            label="Group By"
            value={filters.group_by || ''}
            onChange={(e) => onFilterChange('group_by', e.target.value)}
            size="small"
            sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="DAY">Day</MenuItem>
            <MenuItem value="MONTH">Month</MenuItem>
            <MenuItem value="YEAR">Year</MenuItem>
          </TextField>
          )}
        </Box>
        <Box flex="1 1 150px" minWidth={{ xs: '100%', sm: '150px' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => onFilterChange('from_date', newValue)}
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  size: 'small',
                  sx: { '& .MuiInputBase-input': { fontSize: '0.875rem' } },
                } 
              }}
            />
          </LocalizationProvider>
        </Box>
        <Box flex="1 1 150px" minWidth={{ xs: '100%', sm: '150px' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(newValue) => onFilterChange('to_date', newValue)}
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  size: 'small',
                  sx: { '& .MuiInputBase-input': { fontSize: '0.875rem' } },
                } 
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box display="flex" gap={1} mt={1.5}>
        <Button 
          variant="contained" 
          size="small" 
          onClick={onApplyFilters}
          sx={{ 
            fontSize: '0.875rem',
            bgcolor: COLORS.income.main,
            color: COLORS.background.paper,
            fontWeight: 600,
            '&:hover': {
              bgcolor: COLORS.income.dark,
            },
          }}
        >
          Apply Filters
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onClearFilters}
          sx={{ fontSize: '0.875rem' }}
        >
          Clear All
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterSection;
