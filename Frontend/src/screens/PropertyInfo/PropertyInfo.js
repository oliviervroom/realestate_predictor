import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, Slider, Chip, Alert,
  Paper, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer
} from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ApiIcon from '@mui/icons-material/Api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DataObjectIcon from '@mui/icons-material/DataObject';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import Header from '../../components/Header';
import MapComponent from './MapComponent';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { VERSIONS } from '../../version';

const PropertyInfo = () => {
  const location = useLocation();
  const property = location?.state;
  const allProperties = location?.state?.allProperties || [];
  const currentPropertyId = property?.property_id;

  const [error, setError] = useState(null);
  const [dataErrors, setDataErrors] = useState([]);
  const [copySuccess, setCopySuccess] = useState('');
  const [adjustedRent, setAdjustedRent] = useState(
    property?.rental_estimate || Math.round((property?.estimate?.estimate || 300000) * 0.0045)
  );

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
      .then(() => {
        setCopySuccess(`${label} copied!`);
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  useEffect(() => {
    // Validate required data
    const errors = [];
    if (!property) {
      errors.push('No property data available');
    } else {
      if (!property.price && !property.list_price && !property.estimate?.estimate) {
        errors.push('Price information is missing');
      }
      if (!property.beds && property.beds !== 0) {
        errors.push('Number of bedrooms is missing');
      }
      if (!property.baths && property.baths !== 0) {
        errors.push('Number of bathrooms is missing');
      }
      if (!property.sqft) {
        errors.push('Square footage information is missing');
      }
      if (!property.location?.address?.line || !property.location?.address?.city || !property.location?.address?.state_code) {
        errors.push('Complete address information is missing');
      }
    }
    setDataErrors(errors);
  }, [property]);

  if (dataErrors.length > 0) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip label={VERSIONS.working} color="primary" />
        </Box>
        <Alert severity="error" sx={{ mt: 4 }}>
          {dataErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      </Container>
    );
  }

  const baseRent = property?.rental_estimate || Math.round((property?.estimate?.estimate || 300000) * 0.0045);
  const priceTrendData = generatePriceTrendData(property);

  const nearbyProperties = allProperties.filter(
    (p) => p?.property_id !== currentPropertyId &&
    p?.address?.lat && p?.address?.long
  );

  function generatePriceTrendData(property) {
    try {
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
    } catch (error) {
      setError('Error generating price trend data');
      return [];
    }
  }

  const coordinates = {
    lat: property?.address?.lat || property?.location?.address?.coordinate?.lat || 37.7749,
    lng: property?.address?.long || property?.location?.address?.coordinate?.lon || -122.4194
  };

  return (
    <Box sx={{ bgcolor: '#faf9f8', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip label={VERSIONS.working} color="primary" />
        </Box>

        {/* Property Details */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }}>
            <Box
              component="img"
              src={(() => {
                const photoUrl = property?.primary_photo?.href || property?.photos?.[0]?.href || property?.image;
                if (!photoUrl) return '/genbcs-24082644-0-jpg.png';
                // Replace thumbnail suffixes with high-quality version
                return photoUrl.replace(/-m(\d+)s\.jpg/, '-m$1x.jpg')
                             .replace(/-t\.jpg/, '-o.jpg')
                             .replace(/s\.jpg$/, 'od.jpg');
              })()}
              alt="Property"
              onError={(e) => {
                e.target.src = '/genbcs-24082644-0-jpg.png';
              }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {property.location?.address?.line || 'Address not available'}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {property.location?.address?.city || 'City not available'}, {property.location?.address?.state_code || 'State not available'} {property.location?.address?.postal_code || 'Postal code not available'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Chip label={`${property.beds} beds`} />
              <Chip label={`${property.baths} baths`} />
              <Chip label={`${(property.sqft || 0).toLocaleString()} sqft`} />
              <Chip label={`$${(property.price || 0).toLocaleString()}`} color="primary" />
            </Box>
          </CardContent>
        </Card>

        {/* Map Component */}
        <Card sx={{ mb: 4, height: '400px' }}>
          <MapComponent
            lat={property.location.address.lat}
            lng={property.location.address.long}
            properties={allProperties}
            currentPropertyId={currentPropertyId}
          />
        </Card>

        {/* API Debug Information */}
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>API Debug Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* API Request Info */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">API Request:</Typography>
                <Tooltip title={copySuccess || "Copy to clipboard"}>
                  <IconButton onClick={() => handleCopyToClipboard({
                    endpoint: '/properties/v3/detail',
                    method: 'GET',
                    params: { property_id: property.property_id }
                  }, 'API request')}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box component="pre" sx={{ 
                bgcolor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify({
                  endpoint: '/properties/v3/detail',
                  method: 'GET',
                  params: { property_id: property.property_id }
                }, null, 2)}
              </Box>
            </Paper>

            {/* Raw Property Data */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Property Data:</Typography>
                <Tooltip title={copySuccess || "Copy to clipboard"}>
                  <IconButton onClick={() => handleCopyToClipboard(property.raw_data, 'Property data')}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box component="pre" sx={{ 
                bgcolor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '400px'
              }}>
                {JSON.stringify(property.raw_data, null, 2)}
              </Box>
            </Paper>

            {/* API Response Stats */}
            <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Available Features for ML Model
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(property).map(([key, value]) => {
                  // Skip raw_data as it's shown separately
                  if (key === 'raw_data') return null;
                  
                  // Handle nested objects
                  if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                      return (
                        <Chip
                          key={key}
                          label={`${key}: [${value.length} items]`}
                          variant="outlined"
                          size="small"
                        />
                      );
                    } else {
                      // For nested objects, show their keys
                      return (
                        <Chip
                          key={key}
                          label={`${key}: {${Object.keys(value).join(', ')}}`}
                          variant="outlined"
                          size="small"
                        />
                      );
                    }
                  }
                  
                  // Handle primitive values
                  return (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>

        {/* About This Home */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>About this home</Typography>
          <Typography variant="body1" color="text.secondary">
            {typeof property?.description === 'string' 
              ? property.description 
              : "Details about this property are currently unavailable."}
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
                  <ChartTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Price']} />
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
            center={coordinates}
            price={property?.price || property?.list_price || property?.estimate?.estimate}
            nearbyProperties={nearbyProperties}
          />
        </Box>

        <ErrorMessage 
          message={error} 
          open={!!error} 
          onClose={() => setError(null)} 
        />
      </Container>
    </Box>
  );
};

export default PropertyInfo;