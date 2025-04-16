import React, { useState, useEffect } from 'react';
import { Box, Button, Popover, Slider, TextField, Typography, InputAdornment } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';

const MIN_PRICE = 0;
const MAX_PRICE = 2000000;
const STEP = 10000;

function formatPrice(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value}`;
}

function PriceToggle({ value, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempValue, setTempValue] = useState(value || { min: MIN_PRICE, max: MAX_PRICE });
  const [inputValues, setInputValues] = useState({
    min: value?.min || '',
    max: value?.max || ''
  });

  useEffect(() => {
    if (value) {
      setTempValue(value);
      setInputValues({
        min: value.min || '',
        max: value.max || ''
      });
    }
  }, [value]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    // If both inputs are empty, reset to null (Any price)
    if (inputValues.min === '' && inputValues.max === '') {
      onChange(null);
    } else {
      onChange(tempValue);
    }
    handleClose();
  };

  const handleReset = () => {
    setTempValue({ min: MIN_PRICE, max: MAX_PRICE });
    setInputValues({ min: '', max: '' });
    onChange(null);
    handleClose();
  };

  const handleSliderChange = (event, newValue) => {
    // Only update max value if it's different from min value
    const max = newValue[1] === newValue[0] ? undefined : newValue[1];
    setTempValue({ min: newValue[0], max });
    setInputValues({
      min: newValue[0].toString(),
      max: max?.toString() || ''
    });
  };

  const handleInputChange = (type) => (event) => {
    const newValue = event.target.value === '' ? '' : Number(event.target.value.replace(/[^0-9]/g, ''));
    setInputValues(prev => ({
      ...prev,
      [type]: newValue
    }));

    if (newValue !== '') {
      setTempValue(prev => ({
        ...prev,
        [type]: Number(newValue)
      }));
    }
  };

  const getDisplayText = () => {
    if (!value) return 'Any Price';
    if (value.min === MIN_PRICE && !value.max) return 'Any Price';
    if (!value.max) return `${formatPrice(value.min)}+`;
    if (value.min === MIN_PRICE) return `Up to ${formatPrice(value.max)}`;
    if (value.min && value.max) return `${formatPrice(value.min)} - ${formatPrice(value.max)}`;
    return 'Any Price';
  };

  const open = Boolean(anchorEl);
  const id = open ? 'price-popover' : undefined;

  return (
    <>
      <Button
        aria-describedby={id}
        onClick={handleClick}
        variant="contained"
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          bgcolor: 'white',
          color: value ? '#1976d2' : 'text.primary',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'white',
            boxShadow: 2,
          },
          '&:active': {
            boxShadow: 1,
          },
          textTransform: 'none',
          minWidth: 120
        }}
      >
        {getDisplayText()}
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
          sx: { 
            width: 400, 
            p: 3,
            mt: 0.5 // Add small gap between button and popover
          }
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Price Range
        </Typography>
        <Box sx={{ px: 2, mb: 4 }}>
          <Slider
            value={[
              tempValue.min || MIN_PRICE,
              tempValue.max || (tempValue.min || MIN_PRICE)
            ]}
            onChange={handleSliderChange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={STEP}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
            sx={{
              '& .MuiSlider-valueLabel': {
                '&[data-index="1"]': {
                  display: tempValue.max ? 'block' : 'none'
                }
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Min Price"
            value={inputValues.min}
            onChange={handleInputChange('min')}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            placeholder="No min"
            fullWidth
          />
          <TextField
            label="Max Price"
            value={inputValues.max}
            onChange={handleInputChange('max')}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            placeholder="No max"
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleReset} color="inherit">
            Reset
          </Button>
          <Button onClick={handleApply} variant="contained">
            Done
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default PriceToggle; 