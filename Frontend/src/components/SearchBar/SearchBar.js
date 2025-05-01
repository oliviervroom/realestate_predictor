import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Autocomplete, TextField, InputAdornment, Typography, Paper, Card, CardMedia, CardContent, Select, MenuItem, FormControl, CircularProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { getLocationSuggestions, searchProperties } from '../../services/realtyApi';
import { getMLSLocationSuggestions, searchMLSProperties } from '../../services/mlsApi';
import debounce from 'lodash/debounce';

const SearchBar = ({ onDataSourceChange, dataSource: externalDataSource }) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dataSource, setDataSource] = useState(externalDataSource || 'realtyApi');

  // Update data source when external prop changes
  React.useEffect(() => {
    if (externalDataSource && externalDataSource !== dataSource) {
      setDataSource(externalDataSource);
    }
  }, [externalDataSource]);

  // Handle data source change
  const handleDataSourceChange = (event) => {
    const newDataSource = event.target.value;
    if (newDataSource === 'mls') {
      navigate('/mls');
      return;
    }
    setDataSource(newDataSource);
    if (onDataSourceChange) {
      onDataSourceChange(newDataSource);
    }
    // Clear current suggestions and preview when switching data sources
    setOptions([]);
    setPreview(null);
    setInputValue('');
  };

  // Fetch suggestions using the selected data source
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setOptions([]);
        setPreview(null);
        return;
      }

      setLoading(true);
      try {
        const suggestions = dataSource === 'realtyApi' 
          ? await getLocationSuggestions(query)
          : await getMLSLocationSuggestions(query);
        
        setOptions(suggestions || []);

        // If we have a full address, try to get a preview
        if (suggestions && suggestions.length > 0) {
          const firstSuggestion = suggestions[0];
          if (firstSuggestion.line && firstSuggestion.city && firstSuggestion.state_code) {
            const searchFunction = dataSource === 'realtyApi' ? searchProperties : searchMLSProperties;
            const previewResult = await searchFunction({
              address: firstSuggestion.line,
              city: firstSuggestion.city,
              state_code: firstSuggestion.state_code,
              limit: 1
            });
            if (previewResult.success && previewResult.processedData.length > 0) {
              setPreview(previewResult.processedData[0]);
            } else {
              setPreview(null);
            }
          } else {
            setPreview(null);
          }
        } else {
          setPreview(null);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setOptions([]);
        setPreview(null);
      } finally {
        setLoading(false);
      }
    }, 300),
    [dataSource]
  );

  // Handle location selection and navigation
  const handleLocationSelect = (event, value) => {
    if (!value) return;

    // Handle direct postal code input
    if (typeof value === 'string' && /^\d{5}$/.test(value)) {
      navigate(`/zip/${value}`);
      return;
    }

    // Parse location data and navigate
    if (value.line && value.city && value.state_code) {
      // Full address - this should take precedence
      const formattedAddress = value.line.toLowerCase().replace(/[,\s]+/g, '-');
      const formattedCity = value.city.toLowerCase().replace(/\s+/g, '-');
      const formattedState = value.state_code.toLowerCase();
      navigate(`/${formattedState}/${formattedCity}/${formattedAddress}`);
    } else if (value.postal_code) {
      navigate(`/zip/${value.postal_code}`);
    } else if (value.city && value.state_code) {
      // City
      const path = [
        value.state_code.toLowerCase(),
        value.city.toLowerCase().replace(/\s+/g, '-')
      ].join('/');
      navigate(`/${path}`);
    } else if (value.state_code) {
      // State only
      navigate(`/${value.state_code.toLowerCase()}`);
    }
  };

  // Format the display of suggestions
  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    
    if (option.postal_code) {
      return `${option.postal_code} ${option.city ? `(${option.city}, ${option.state_code})` : ''}`;
    }
    if (option.line && option.city && option.state_code) {
      return `${option.line}, ${option.city}, ${option.state_code}`;
    }
    if (option.city && option.state_code) {
      return `${option.city}, ${option.state_code}`;
    }
    if (option.state_code) {
      return option.state_code;
    }
    return '';
  };

  // Custom render option to show icons and format text
  const renderOption = (props, option) => {
    let icon = <LocationOnIcon />;
    let primaryText = '';
    let secondaryText = '';

    if (option.line) {
      icon = <HomeIcon />;
      primaryText = option.line;
      secondaryText = `${option.city}, ${option.state_code}`;
    } else if (option.city) {
      icon = <LocationCityIcon />;
      primaryText = option.city;
      secondaryText = option.state_code;
    } else if (option.postal_code) {
      primaryText = `ZIP ${option.postal_code}`;
      secondaryText = option.city ? `${option.city}, ${option.state_code}` : '';
    }

    return (
      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ mr: 1, color: 'action.active' }}>{icon}</Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1">{primaryText}</Typography>
          {secondaryText && (
            <Typography variant="body2" color="text.secondary">
              {secondaryText}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
      <Box sx={{ flex: 1 }}>
        <Autocomplete
          freeSolo
          options={options}
          getOptionLabel={getOptionLabel}
          renderOption={renderOption}
          inputValue={inputValue}
          onInputChange={(event, newValue) => {
            setInputValue(newValue);
            fetchSuggestions(newValue);
          }}
          onChange={handleLocationSelect}
          loading={loading}
          filterOptions={(x) => x}
          isOptionEqualToValue={(option, value) => {
            if (typeof value === 'string') return false;
            return option.id === value.id;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              placeholder="Search by address, neighborhood, city, ZIP code, or state"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            />
          )}
          PaperComponent={({ children, ...props }) => (
            <Paper {...props}>
              {children}
              {preview && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Property Preview</Typography>
                  <Card sx={{ display: 'flex', mb: 1 }}>
                    {preview.primary_photo?.href ? (
                      <CardMedia
                        component="img"
                        sx={{ width: 100, height: 100, objectFit: 'cover' }}
                        image={preview.primary_photo.href}
                        alt={preview.location?.address?.line || 'Property preview'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100?text=No+Image';
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}
                      >
                        <HomeIcon sx={{ color: 'grey.400', fontSize: 40 }} />
                      </Box>
                    )}
                    <CardContent sx={{ flex: 1, p: 1 }}>
                      <Typography variant="body2" noWrap>
                        {preview.location?.address?.line}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {preview.location?.address?.city}, {preview.location?.address?.state_code}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        ${preview.list_price?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Paper>
          )}
        />
      </Box>
      <FormControl sx={{ minWidth: 120, flexShrink: 0 }}>
        <Select
          value={dataSource}
          onChange={handleDataSourceChange}
          size="small"
          sx={{
            borderRadius: 2,
            backgroundColor: 'background.paper',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
            },
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'white',
                '& .MuiMenuItem-root': {
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="realtyApi">Realty API</MenuItem>
          <MenuItem value="mls">MLS Data</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SearchBar;