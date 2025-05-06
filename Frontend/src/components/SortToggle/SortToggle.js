import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function SortToggle({ value, onChange }) {
  return (
    <ButtonGroup variant="contained" aria-label="price sort toggle">
      <Button
        onClick={() => onChange('asc')}
        startIcon={<ArrowUpwardIcon />}
        sx={{
          bgcolor: value === 'asc' ? '#1976d2' : 'white',
          color: value === 'asc' ? 'white' : 'text.primary',
          '&:hover': {
            bgcolor: value === 'asc' ? '#1565c0' : '#f5f5f5',
          },
          textTransform: 'none',
          minWidth: 120
        }}
      >
        Low to High $
      </Button>
      <Button
        onClick={() => onChange('desc')}
        startIcon={<ArrowDownwardIcon />}
        sx={{
          bgcolor: value === 'desc' ? '#1976d2' : 'white',
          color: value === 'desc' ? 'white' : 'text.primary',
          '&:hover': {
            bgcolor: value === 'desc' ? '#1565c0' : '#f5f5f5',
          },
          textTransform: 'none',
          minWidth: 120
        }}
      >
        High to Low $
      </Button>
    </ButtonGroup>
  );
}

export default SortToggle; 