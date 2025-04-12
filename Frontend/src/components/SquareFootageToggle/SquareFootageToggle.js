import React, { useState, useEffect } from 'react';
import { Box, Button, Popover, Slider, TextField, Typography, InputAdornment } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const MIN_SQFT = 0;
const MAX_SQFT = 4000;
const STEP = 5;

function formatSqft(value) {
  if (value >= MAX_SQFT) return '4,000+ sqft';
  return `${value.toLocaleString()} sqft`;
}

function SquareFootageToggle({ value, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempValue, setTempValue] = useState(value || { min: MIN_SQFT, max: MAX_SQFT });
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
    // If both inputs are empty, reset to null (Any sqft)
    if (inputValues.min === '' && inputValues.max === '') {
      onChange(null);
    } else {
      onChange(tempValue);
    }
    handleClose();
  };

  const handleReset = () => {
    setTempValue({ min: MIN_SQFT, max: MAX_SQFT });
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
    if (!value) return 'Any sqft';
    if (value.min === MIN_SQFT && !value.max) return 'Any sqft';
    if (!value.max) return `${value.min.toLocaleString()}+ sqft`;
    if (value.min === MIN_SQFT) return `Up to ${value.max.toLocaleString()} sqft`;
    if (value.max >= MAX_SQFT) return `${value.min.toLocaleString()}+ sqft`;
    if (value.min && value.max) return `${value.min.toLocaleString()}-${value.max.toLocaleString()} sqft`;
    return 'Any sqft';
  };

  const open = Boolean(anchorEl);
  const id = open ? 'sqft-popover' : undefined;

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
            mt: 0.5
          }
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Square Footage
        </Typography>
        <Box sx={{ px: 2, mb: 4 }}>
          <Slider
            value={[
              tempValue.min || MIN_SQFT,
              tempValue.max || (tempValue.min || MIN_SQFT)
            ]}
            onChange={handleSliderChange}
            min={MIN_SQFT}
            max={MAX_SQFT}
            step={STEP}
            valueLabelDisplay="auto"
            valueLabelFormat={formatSqft}
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
            label="Min Sqft"
            value={inputValues.min}
            onChange={handleInputChange('min')}
            placeholder="No min"
            fullWidth
          />
          <TextField
            label="Max Sqft"
            value={inputValues.max}
            onChange={handleInputChange('max')}
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

export default SquareFootageToggle; 