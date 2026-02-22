import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DATE_PRESETS, type DatePreset } from './utils/datePresets';

interface DatePresetBarProps {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
}

const DatePresetBar: React.FC<DatePresetBarProps> = ({ value, onChange }) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    onChange={(_, v: DatePreset | null) => { if (v) onChange(v); }}
    size="small"
    sx={{ flexWrap: 'wrap', gap: 0.5 }}
  >
    {DATE_PRESETS.map(({ value: v, label }) => (
      <ToggleButton
        key={v}
        value={v}
        sx={{ minWidth: { xs: 64, sm: 80 }, fontSize: { xs: '0.72rem', sm: '0.8rem' }, px: { xs: 1, sm: 1.5 } }}
      >
        {label}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

export default DatePresetBar;
