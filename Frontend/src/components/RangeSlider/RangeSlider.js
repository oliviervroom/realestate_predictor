import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

const RangeSlider = ({ value, onChange, min, max, step, formatLabel, label }) => {
  return (
    <Box sx={{ width: 300, px: 2 }}>
      <Typography gutterBottom sx={{ color: 'white' }}>
        {label}: {formatLabel(value)}
      </Typography>
      <Slider
        value={value}
        onChange={onChange}
        valueLabelDisplay="auto"
        valueLabelFormat={formatLabel}
        min={min}
        max={max}
        step={step}
        sx={{
          color: 'white',
          '& .MuiSlider-thumb': {
            backgroundColor: 'white',
            '&:hover, &.Mui-active': {
              boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: 'white',
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
          '& .MuiSlider-valueLabel': {
            backgroundColor: 'rgba(34, 34, 34, 0.9)',
          },
        }}
      />
    </Box>
  );
};

export default RangeSlider;