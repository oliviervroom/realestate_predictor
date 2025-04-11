import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../../components/Header';
import { getPropertyDetails } from '../../services/realtyApi';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propertyData = await getPropertyDetails(id);
        setProperty(propertyData);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#faf9f8', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <IconButton onClick={handleBack} sx={{ color: '#666' }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
                <Box
                  component="img"
                  src={property?.photos?.[0] || '/genbcs-24082644-0-jpg.png'}
                  alt={property?.address?.full}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  ${property?.details?.price?.toLocaleString() || '399,000'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, color: '#666', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {property?.details?.beds || 3}
                    </Typography>
                    <Typography sx={{ ml: 0.5 }}>beds</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {property?.details?.baths || 2}
                    </Typography>
                    <Typography sx={{ ml: 0.5 }}>baths</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {(property?.details?.sqft || 1800).toLocaleString()}
                    </Typography>
                    <Typography sx={{ ml: 0.5 }}>sq ft</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {property?.address?.full || '123 Main St, Manchester, CT 06040'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PropertyDetails;