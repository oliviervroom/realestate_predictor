import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import MLSSearchBar from '../components/MLSSearchBar';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import { searchMLSProperties, loadMLSData } from '../services/mlsApi';
import '../styles/mls.css';

const MLSSearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialProperties();
  }, []);

  const loadInitialProperties = async () => {
    try {
      const mlsData = await loadMLSData();
      // Take first 5 properties from the dataset
      setProperties(mlsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading initial properties:', error);
      setError('Failed to load initial properties.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);

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

  return (
    <div className="mls-search-page">
      <Typography variant="h4" component="h1" gutterBottom>
        MLS Property Search
      </Typography>
      
      <MLSSearchBar onSearch={handleSearch} />
      
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {!loading && !error && properties.length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="textSecondary">
            No properties found. Try adjusting your search.
          </Typography>
        </Box>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={property.property_id}>
            <PropertyCard property={property} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default MLSSearch; 