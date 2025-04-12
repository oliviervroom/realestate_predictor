import React, { useState } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

const BedBathFilter = ({ type, value, onChange }) => {
  const [rangeStart, setRangeStart] = useState(null);

  const handleClick = (event, newValue) => {
    // If we're already in range selection mode and have a start value
    if (rangeStart !== null) {
      if (newValue !== null) {
        // Create range
        const range = {
          min: Math.min(rangeStart, newValue),
          max: Math.max(rangeStart, newValue)
        };
        onChange(range);
      }
      setRangeStart(null);
    } else {
      // If clicking the same value, treat it as a single selection
      if (value === newValue) {
        onChange(newValue);
      } else {
        // Start range selection
        setRangeStart(newValue);
      }
    }
  };

  const isInRange = (num) => {
    if (!value || !value.min || !value.max) return false;
    return num >= value.min && num <= value.max;
  };

  const isSelected = (num) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return value === num;
    return isInRange(num);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {type === 'beds' ? 'Beds' : 'Baths'}
        {rangeStart !== null && ' (Select second number for range)'}
      </Typography>
      <ToggleButtonGroup
        value={rangeStart !== null ? rangeStart : value}
        exclusive={rangeStart === null}
        onChange={handleClick}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          '& .MuiToggleButton-root': {
            border: '1px solid #ccc',
            borderRadius: '4px !important',
            px: 2,
            py: 0.5,
            color: '#333',
            '&.Mui-selected': {
              bgcolor: '#e6f3ff',
              borderColor: '#0066cc',
              color: '#0066cc',
            },
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
          },
        }}
      >
        <ToggleButton value={null}>Any</ToggleButton>
        {type === 'beds' && <ToggleButton value="studio">Studio</ToggleButton>}
        {[1, 2, 3, 4].map((num) => (
          <ToggleButton
            key={num}
            value={num}
            sx={{
              bgcolor: isInRange(num) ? '#e6f3ff !important' : undefined,
              borderColor: isInRange(num) ? '#0066cc !important' : undefined,
              color: isInRange(num) ? '#0066cc !important' : undefined,
            }}
          >
            {num}
          </ToggleButton>
        ))}
        <ToggleButton value={5}>5+</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default BedBathFilter; 