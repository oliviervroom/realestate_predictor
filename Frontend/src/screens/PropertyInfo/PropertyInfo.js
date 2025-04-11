import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, Slider} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Header from '../../components/Header';
import MapComponent from './MapComponent';

const PropertyInfo = () => {
  const location = useLocation();
  const property = location?.state;
  const allProperties = location?.state?.allProperties || [];
  const currentPropertyId = property?.property_id;

  const baseRent = property?.rental_estimate || Math.round((property?.estimate?.estimate || 300000) * 0.0045);
  const [adjustedRent, setAdjustedRent] = useState(baseRent);

  const priceTrendData = generatePriceTrendData(property);

  const nearbyProperties = allProperties.filter(
    (p) => p?.property_id !== currentPropertyId &&
    p?.location?.address?.coordinate?.lat && p?.location?.address?.coordinate?.lon
  );

  if (!property) {
    return (
      <Container>
        <Typography variant="h6" sx={{ mt: 4 }}>No property data found.</Typography>
      </Container>
    );
  }

  function generatePriceTrendData(property) {
    const soldPrice = property?.last_sold_price;
    const estimate = property?.estimate?.estimate;
    const listPrice = property?.list_price;
    if (soldPrice && estimate && listPrice) {
      return [
        { date: '2020', value: soldPrice * 0.95 },
        { date: '2021', value: soldPrice },
        { date: '2022', value: estimate },
        { date: '2023', value: estimate * 1.03 },
        { date: '2024', value: listPrice }
      ];
    }
    return [];
  }

  const coordinates = {
    lat: property?.location?.address?.coordinate?.lat || 37.7749,
    lng: property?.location?.address?.coordinate?.lon || -122.4194
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Basic Info */}
        <Card sx={{ mb: 4 }}>
          <Box
            component="img"
            src={property?.primary_photo?.href || '/genbcs-24082644-0-jpg.png'}
            alt="Property"
            sx={{ width: '100%', height: 400, objectFit: 'cover' }}
          />
          <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
              {(() => {
                const price =
                  property?.price ||
                  property?.list_price ||
                  property?.listPrice ||
                  property?.estimate?.estimate;
                return price ? `$${price.toLocaleString()}` : 'Price not available';
              })()}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {property?.location?.address?.line}, {property?.location?.address?.city}, {property?.location?.address?.state}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {property?.description?.beds || 0} beds • {property?.description?.baths || 0} baths • {property?.description?.sqft?.toLocaleString() || '-'} sqft
            </Typography>
          </CardContent>
        </Card>

        {/* About This Home */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>About this home</Typography>
          <Typography variant="body1" color="text.secondary">
            {property?.description?.text || "Details about this property are currently unavailable."}
          </Typography>
        </Box>

        {/* Price Graph */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Price Estimate Trend</Typography>
          {priceTrendData.length ? (
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Price']} />
                  <Line type="monotone" dataKey="value" stroke="#c82021" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography>No trend data available.</Typography>
          )}
        </Box>

        {/* Predicted Rental Income */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Predicted Rental Income</Typography>
          <Box sx={{ bgcolor: '#e8f5e9', p: 3, borderRadius: 2, display: 'inline-block' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
              ${baseRent} / month
            </Typography>
          </Box>
        </Box>

        {/* Adjustable Rent */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold">Adjustable Rental Income</Typography>
          <Slider
            value={adjustedRent}
            min={baseRent * 0.5}
            max={Math.ceil(baseRent * 1.5)}
            step={50}
            onChange={(_, val) => setAdjustedRent(val)}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `$${val}`}
            sx={{ maxWidth: 500, color: '#c82021' }}
          />
        </Box>

        {/* Market Positioning */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Market Positioning
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            See where your adjusted rent stands in comparison to estimated market rates
          </Typography>

          {/* Dynamic Bar */}
          <Box
            sx={{
              position: 'relative',
              height: 10,
              borderRadius: 5,
              background: 'linear-gradient(to right, #c8e6c9, #fff59d, #ffcdd2)',
              mb: 2,
              mt: 3
            }}
          >
            {/* Marker for your price */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#c82021',
                border: '3px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                left: `${Math.min(100, Math.max(0, ((adjustedRent - baseRent) / baseRent) * 50 + 50))}%`,
                transition: 'left 0.3s ease'
              }}
            />
          </Box>

          {/* Price Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              ${Math.round(baseRent * 0.8)} (Below Market)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ${adjustedRent} (Your Price)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ${Math.round(baseRent * 1.2)} (Above Market)
            </Typography>
          </Box>
        </Box>

        {/* Map Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold">Location on Map</Typography>
          <MapComponent
            center={{
              lat: property?.location?.address?.coordinate?.lat,
              lng: property?.location?.address?.coordinate?.lon
            }}
            price={ property?.price || property?.list_price || property?.listPrice || property?.estimate?.estimate}
            nearbyProperties={nearbyProperties}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default PropertyInfo;