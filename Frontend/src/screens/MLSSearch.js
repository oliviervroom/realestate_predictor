import React, { useState } from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import MLSSearchBar from '../components/MLSSearchBar';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import { searchMLSProperties } from '../services/mlsApi';
import '../styles/mls.css';

const MLSSearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchMLSProperties(searchParams.query, {
        directSearch: searchParams.directSearch
      });
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

  return (
    <Box sx={{ p: 3 }}>
      <MLSSearchBar onSearch={handleSearch} />
      
      {error && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {!hasSearched && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <Typography color="textSecondary">
            Enter an address or location to search MLS listings
          </Typography>
        </Box>
      )}

      {hasSearched && !loading && !error && properties.length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <Typography color="textSecondary">
            No properties found. Try a different search.
          </Typography>
        </Box>
      )}

      {properties.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.property_id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MLSSearch; 