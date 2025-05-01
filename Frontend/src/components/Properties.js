import React, { useState } from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import PropertyCard from './PropertyCard/PropertyCard';
import realtyApi from '../services/realtyApi';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    setSearchParams(params);

    try {
      const results = await realtyApi.searchProperties(params.query);
      setProperties(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to fetch properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!properties.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="textSecondary">
          {searchParams ? 'No properties found. Try a different search.' : 'Enter a search to find properties.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {properties.map((property) => (
        <Grid item xs={12} sm={6} md={4} key={property.property_id}>
          <PropertyCard property={property} />
        </Grid>
      ))}
    </Grid>
  );
};

export default Properties; 