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
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      setShowSuggestions(false);
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
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getLocationSuggestions(value);
        // Only update if the component is still mounted and the search term hasn't changed
        if (Array.isArray(results)) {
          const formattedSuggestions = results
            .filter(item => item.city || item.state)
            .map(item => ({
              city: item.city || '',
              state: item.state || '',
              state_code: item.state_code || '',
              _id: item._id || `${item.city}-${item.state_code}`
            }))
            .slice(0, 5);
          
          setSuggestions(formattedSuggestions);
          setShowSuggestions(formattedSuggestions.length > 0);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    const locationString = `${suggestion.city}, ${suggestion.state_code}`;
    setSearchTerm(locationString);
    setSuggestions([]);
    setShowSuggestions(false);
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
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {isLoading && <Loader />}

      {showSuggestions && suggestions.length > 0 && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <List>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={suggestion._id || index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <ListItemText 
                  primary={`${suggestion.city}, ${suggestion.state_code}`}
                  sx={{ color: 'white' }}
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