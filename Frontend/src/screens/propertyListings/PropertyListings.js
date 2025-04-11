import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box } from '@mui/material';
import Header from '../../components/Header';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader/Loader';

const PropertyListings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const listings = location.state;

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // loader for 2s
    return () => clearTimeout(timer);
  }, []);
  const handleCardClick = useCallback((property) => {
    navigate('/property-info', {
      state: {
        ...property,
        allProperties: listings
      }
    });
  }, [navigate, listings]);

  if (!listings || !listings.length) {
    return (
      <Container>
        <Typography variant="h6" sx={{ mt: 4 }}>
          No matching properties found.
        </Typography>
      </Container>
    );
  }

  if (loading) return <Loader text="Loading listings..." />;

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Matching Properties
        </Typography>
        <Grid container spacing={3}>
          {listings.map((property, index) => (
            <Grid item xs={12} sm={6} md={4} key={property.property_id || index}>
              <Box onClick={() => handleCardClick(property)} sx={{ cursor: 'pointer' }}>
                <PropertyCard property={property} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PropertyListings;