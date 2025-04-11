import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const FilterDropdown = ({ label, value, onChange, options, minWidth = 200 }) => {
  return (
    <FormControl sx={{ minWidth }}>
      <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
        {label}
      </InputLabel>
      <Select
        value={value}
        onChange={onChange}
        label={label}
        sx={{
          color: 'white',
          '.MuiSelect-icon': { color: 'white' },
          backgroundColor: 'transparent',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: '#222222',
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
              '& .MuiMenuItem-root': {
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterDropdown;