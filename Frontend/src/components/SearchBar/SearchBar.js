import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Paper, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { searchProperties } from '../../services/realtyApi'; // Use real API // your local fallback dataset
import Loader from '../Loader/Loader';
import debounce from 'lodash.debounce';


const SearchBar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);


  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const matches = await performSearch(searchTerm);
      setTimeout(() => {
        setLoading(false);
        if (matches.length === 1) {
          navigate('/property-info', { state: matches[0] });
        } else {
          navigate('/property-listings', { state: matches });
        }
      }, 2000); // Optional delay to make loader visible
    } catch (error) {
      setLoading(false);
      alert("Search failed.");
    }
  };

  const performSearch = async (input) => {
    return await searchProperties(input);
  };

  // const handleChange = async (e) => {
  //   const value = e.target.value;
  //   setSearchTerm(value);
  //   setAnchorEl(e.currentTarget);
  
  //   if (value.length > 2) {
  //     const results = await performSearch(value); // await the async function
  //     setSuggestions(results.slice(0, 5)); // only call slice on actual array
  //   } else {
  //     setSuggestions([]);
  //   }
  // };
  const debouncedSearch = useCallback(
    debounce(async (value) => {
      const results = await performSearch(value);
      setSuggestions(results.slice(0, 5));
    }, 1000), // waits 1000ms after typing stops
    []
  );
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setAnchorEl(e.currentTarget);
  
    if (value.length > 2) {
      debouncedSearch(value); // Debounced API call
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearchTerm(item?.location?.address?.line || '');
    setSuggestions([]);
    navigate('/property-info', { state: item });
  };

  {loading && <Loader text= "Searching..." /> }
  return (
    
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={handleChange}
          placeholder="Enter an address, neighborhood, city, or ZIP code"
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
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{ bgcolor: '#c82021', minWidth: 'auto', px: 2 }}
        >
          <SearchIcon />
        </Button>
      </Box>

      {suggestions.length > 0 && (
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
            {suggestions.map((item, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(item)}
                sx={{
                  '&:hover': { backgroundColor: '#f2f2f2' },
                }}
              >
                <ListItemText
                  primary={item?.location?.address?.line || 'No address'}
                  secondary={`${item?.location?.address?.city}, ${item?.location?.address?.state} ${item?.location?.address?.postal_code}`}
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