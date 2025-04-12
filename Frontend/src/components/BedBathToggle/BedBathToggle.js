import React, { useState } from 'react';
import { Box, Button, Paper, Typography, ToggleButton, ToggleButtonGroup, Popover } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const BedBathToggle = ({ onBedsChange, onBathsChange, bedsValue, bathsValue }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // 'beds' or 'baths'

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setRangeStart(null);
  };

  const handleDone = () => {
    handleClose();
  };

  const handleReset = () => {
    onBedsChange(null);
    onBathsChange(null);
    handleClose();
  };

  const handleValueClick = (type, newValue) => {
    const onChange = type === 'beds' ? onBedsChange : onBathsChange;
    const currentValue = type === 'beds' ? bedsValue : bathsValue;
    
    if (rangeStart !== null) {
      if (newValue !== null) {
        const range = {
          min: Math.min(rangeStart, newValue),
          max: Math.max(rangeStart, newValue)
        };
        onChange(range);
      }
      setRangeStart(null);
    } else {
      if (newValue !== null) {
        if (type === 'beds' && newValue === 5) {
          onChange({ min: 5, max: null }); // 5+ beds
        } else {
          onChange({ min: newValue, max: newValue }); // Single value
        }
        setRangeStart(newValue);
      }
    }
  };

  const isInRange = (value, type) => {
    const currentValue = type === 'beds' ? bedsValue : bathsValue;
    if (!currentValue || !currentValue.min) return false;
    if (!currentValue.max) return value >= currentValue.min; // For 5+ beds
    return value >= currentValue.min && value <= currentValue.max;
  };

  const getCurrentValue = (type) => {
    const value = type === 'beds' ? bedsValue : bathsValue;
    if (!value) return '';
    if (value.min !== undefined) {
      return Array.from({ length: value.max - value.min + 1 }, (_, i) => value.min + i);
    }
    return value;
  };

  const formatValue = (value, type) => {
    if (!value) return type === 'beds' ? 'Any beds' : 'Any baths';
    if (value === 'studio') return 'Studio';
    if (value.min !== undefined) {
      if (!value.max) return `${value.min}+ ${type}`; // For 5+ beds
      if (value.min === value.max) return `${value.min} ${type}`;
      return `${value.min}-${value.max} ${type}`;
    }
    return `${value} ${type}`;
  };

  const getButtonLabel = () => {
    const bedsLabel = formatValue(bedsValue, 'beds');
    const bathsLabel = formatValue(bathsValue, 'baths');

    if (bedsLabel === 'Any beds' && bathsLabel === 'Any baths') {
      return 'Beds/Baths';
    }
    return `${bedsLabel}, ${bathsLabel}`;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'bed-bath-popover' : undefined;

  return (
    <>
      <Button
        aria-describedby={id}
        onClick={handleClick}
        variant="outlined"
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          color: 'black',
          borderColor: '#ccc',
          bgcolor: 'white',
          textTransform: 'none',
          '&:hover': {
            borderColor: '#666',
            bgcolor: '#f5f5f5'
          }
        }}
      >
        {getButtonLabel()}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { width: 400, p: 2 }
        }}
      >
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Beds {rangeStart !== null && '(Select second number for range)'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant={!bedsValue ? 'contained' : 'outlined'}
                onClick={() => onBedsChange(null)}
                sx={{
                  borderColor: '#ccc',
                  bgcolor: !bedsValue ? '#e6f3ff' : 'transparent',
                  color: !bedsValue ? '#0066cc' : '#333',
                  '&:hover': {
                    bgcolor: !bedsValue ? '#e6f3ff' : '#f5f5f5',
                  }
                }}
              >
                ANY
              </Button>
              <Button
                variant={bedsValue === 'studio' ? 'contained' : 'outlined'}
                onClick={() => onBedsChange('studio')}
                sx={{
                  borderColor: '#ccc',
                  bgcolor: bedsValue === 'studio' ? '#e6f3ff' : 'transparent',
                  color: bedsValue === 'studio' ? '#0066cc' : '#333',
                  '&:hover': {
                    bgcolor: bedsValue === 'studio' ? '#e6f3ff' : '#f5f5f5',
                  }
                }}
              >
                STUDIO
              </Button>
              {[1, 2, 3, 4].map((num) => (
                <Button
                  key={num}
                  variant={isInRange(num, 'beds') || (bedsValue === num) ? 'contained' : 'outlined'}
                  onClick={() => handleValueClick('beds', num)}
                  sx={{
                    borderColor: '#ccc',
                    bgcolor: isInRange(num, 'beds') || (bedsValue === num) ? '#e6f3ff' : 'transparent',
                    color: isInRange(num, 'beds') || (bedsValue === num) ? '#0066cc' : '#333',
                    '&:hover': {
                      bgcolor: isInRange(num, 'beds') || (bedsValue === num) ? '#e6f3ff' : '#f5f5f5',
                    }
                  }}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant={bedsValue === 5 ? 'contained' : 'outlined'}
                onClick={() => onBedsChange(5)}
                sx={{
                  borderColor: '#ccc',
                  bgcolor: bedsValue === 5 ? '#e6f3ff' : 'transparent',
                  color: bedsValue === 5 ? '#0066cc' : '#333',
                  '&:hover': {
                    bgcolor: bedsValue === 5 ? '#e6f3ff' : '#f5f5f5',
                  }
                }}
              >
                5+
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Baths {rangeStart !== null && '(Select second number for range)'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant={!bathsValue ? 'contained' : 'outlined'}
                onClick={() => onBathsChange(null)}
                sx={{
                  borderColor: '#ccc',
                  bgcolor: !bathsValue ? '#e6f3ff' : 'transparent',
                  color: !bathsValue ? '#0066cc' : '#333',
                  '&:hover': {
                    bgcolor: !bathsValue ? '#e6f3ff' : '#f5f5f5',
                  }
                }}
              >
                ANY
              </Button>
              {['1', '1.5', '2', '2.5', '3'].map((num) => (
                <Button
                  key={num}
                  variant={isInRange(parseFloat(num), 'baths') || (bathsValue === parseFloat(num)) ? 'contained' : 'outlined'}
                  onClick={() => handleValueClick('baths', parseFloat(num))}
                  sx={{
                    borderColor: '#ccc',
                    bgcolor: isInRange(parseFloat(num), 'baths') || (bathsValue === parseFloat(num)) ? '#e6f3ff' : 'transparent',
                    color: isInRange(parseFloat(num), 'baths') || (bathsValue === parseFloat(num)) ? '#0066cc' : '#333',
                    '&:hover': {
                      bgcolor: isInRange(parseFloat(num), 'baths') || (bathsValue === parseFloat(num)) ? '#e6f3ff' : '#f5f5f5',
                    }
                  }}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant={bathsValue === 4 ? 'contained' : 'outlined'}
                onClick={() => handleValueClick('baths', 4)}
                sx={{
                  borderColor: '#ccc',
                  bgcolor: bathsValue === 4 ? '#e6f3ff' : 'transparent',
                  color: bathsValue === 4 ? '#0066cc' : '#333',
                  '&:hover': {
                    bgcolor: bathsValue === 4 ? '#e6f3ff' : '#f5f5f5',
                  }
                }}
              >
                4+
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              onClick={handleReset}
              sx={{ color: '#0066cc' }}
            >
              Reset
            </Button>
            <Button
              onClick={handleDone}
              variant="contained"
              sx={{
                bgcolor: '#c82021',
                '&:hover': {
                  bgcolor: '#a51a1b'
                }
              }}
            >
              Done
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default BedBathToggle; 