import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getLocationSuggestions } from '../../services/realtyApi';
import Loader from '../Loader/Loader';
import debounce from 'lodash.debounce';

const SearchBar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (value) => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getLocationSuggestions(value);
        setSuggestions(results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setAnchorEl(e.currentTarget);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    const locationString = `${suggestion.city}, ${suggestion.state_code}`;
    setSearchTerm(locationString);
    setSuggestions([]);
    onSearch(locationString);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter a city and state (e.g., Manchester, NH)"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        />
        <IconButton
          onClick={handleSearch}
          sx={{
            backgroundColor: '#c82021',
            color: 'white',
            '&:hover': {
              backgroundColor: '#a51a1b'
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {isLoading && <Loader text="Loading suggestions..." />}

      {!isLoading && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            zIndex: 10,
            width: anchorEl?.offsetWidth || '100%',
            mt: -1,
            bgcolor: '#ffffff',
            color: '#000000',
            maxHeight: 250,
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <List dense>
            {suggestions.map((suggestion) => (
              <ListItem
                key={suggestion._id}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  '&:hover': { backgroundColor: '#f2f2f2' },
                }}
              >
                <ListItemText
                  primary={`${suggestion.city}, ${suggestion.state_code}`}
                  secondary={suggestion.counties?.[0]?.name || ''}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;