import React from 'react';
import { Chip } from '@mui/material';
import { COLORS, BOX_SHADOWS } from '../constants/colors';

interface FilterChipProps {
  label: string;
  onDelete?: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onDelete }) => {
  return (
    <Chip
      label={label}
      size="small"
      onDelete={onDelete}
      sx={{
        bgcolor: COLORS.income.light,
        color: COLORS.text.primary,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: '24px',
        borderRadius: '12px',
        boxShadow: BOX_SHADOWS.small,
        border: `1px solid ${COLORS.income.main}`,
        '&:hover': {
          bgcolor: COLORS.income.main,
          color: COLORS.background.paper,
        },
      }}
    />
  );
};

export default FilterChip;
