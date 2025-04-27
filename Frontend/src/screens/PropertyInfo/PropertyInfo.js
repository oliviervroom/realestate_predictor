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
import ApiDebugInfo from '../../components/ApiDebugInfo/ApiDebugInfo';
import { VERSIONS } from '../../version';
import PropertyMap from '../../components/Map/PropertyMap';
import { getPredictedRent } from '../../services/realtyApi';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
  const [predictedRent, setPredictedRent] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    method: 'GET',
    endpoint: '/properties/v3/detail',
    request: { property_id: currentPropertyId },
    response: property
  });

  const [open, setOpen] = useState(false);
  const riskLevel = 'Medium'; // You can change this dynamically later (Low, Medium, High)

  const riskColor = riskLevel === 'Low' ? 'success' : riskLevel === 'High' ? 'error' : 'warning';

  const riskMessage = {
    Low: 'This property shows a low investment risk based on current market data.',
    Medium: 'This property shows a moderate investment risk. Proceed with some caution.',
    High: 'This property shows a high investment risk. Carefully review before investing.'
  };
  const predictedRent1 = 2500;
  const optimalRent = 2400;
  const graphData = [
    { rent: 2000, likelihood: 0.3 },
    { rent: 2200, likelihood: 0.5 },
    { rent: 2400, likelihood: 1 },
    { rent: 2600, likelihood: 0.7 },
    { rent: 2800, likelihood: 0.4 },
  ];
  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
      .then(() => {
        setCopySuccess(`${label} copied!`);
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  useEffect(() => {
    if (!property) {
      const errorMessage = 'No property data available';
      console.error('API Error:', {
        message: errorMessage,
        response: property,
        timestamp: new Date().toISOString()
      });
      setError(errorMessage);
      return;
    }

    // Log the API request
    console.log('API Request:', {
      endpoint: '/properties/v3/detail',
      method: 'GET',
      params: { property_id: currentPropertyId },
      timestamp: new Date().toISOString()
    });

    const errors = [];
    // Only validate critical data
    if (!property.property_id) {
      const errorMessage = 'Property ID is missing';
      console.error('API Error:', {
        message: errorMessage,
        response: property,
        timestamp: new Date().toISOString()
      });
      errors.push(errorMessage);
    }
    // Check address under location.address.line
    if (!property.location?.address?.line) {
      const errorMessage = 'Address is missing';
      console.error('API Error:', {
        message: errorMessage,
        response: property,
        timestamp: new Date().toISOString()
      });
      errors.push(errorMessage);
    }
    // Check for any price-related field
    if (!property.price && !property.list_price && !property.estimate?.estimate) {
      const errorMessage = 'Price information is missing';
      console.error('API Error:', {
        message: errorMessage,
        response: property,
        timestamp: new Date().toISOString()
      });
      errors.push(errorMessage);
    }

    setDataErrors(errors);
  }, [property, currentPropertyId]);

  useEffect(() => {
    const fetchPredictedRent = async () => {
      if (!property) return;
  
      const transformedInput = {
        NEIGHBORHOOD: property?.location?.neighborhood_name || "Unknown",
        ZIP_CODE: property?.location?.address?.postal_code || "00000",
        PROP_TYPE: property?.prop_type || "other",
        SQUARE_FEET: property?.description?.sqft || 0,
        LOT_SIZE: property?.lot_size || 0,
        NO_BEDROOMS: property?.description?.beds || 0,
        TOTAL_BATHS: property?.description?.baths || 0,
        TOTAL_PARKING_RN: property?.parking?.spaces || "0",
        FURNISHED_RN: "No", // placeholder
        PETS_ALLOWED_RN: "No", // placeholder
        SEC_DEPOSIT_RN: "No", // placeholder
        TERM_OF_RENTAL_RN: "12 months", // placeholder
        RENT_FEE_INCLUDES_RN: "None", // placeholder
        RENTAL_TERMS_RN: "Annual", // placeholder
        LIST_PRICE: property?.price || property?.list_price || 0
      };
  
      const rent = await getPredictedRent(transformedInput);
      setPredictedRent(rent);
    };
  
    fetchPredictedRent();
  }, [property]);

  if (dataErrors.length > 0) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip label={VERSIONS.working} color="primary" sx={{ mr: 1 }} />
          <Chip label={VERSIONS.edit} color="secondary" />
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

  function generateSuccessCurve(predictedRent) {
    if (!predictedRent) return [];
    const base = predictedRent;
    const data = [];
    for (let offset = -0.2; offset <= 0.2; offset += 0.02) {
      const rent = base * (1 + offset);
      const likelihood = Math.exp(-5 * Math.pow(offset, 2));
      data.push({ rent, likelihood });
    }
    return data;
  }

  return (
    <Box sx={{ bgcolor: '#faf9f8', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Version Info */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip label={VERSIONS.working} color="primary" sx={{ mr: 1 }} />
          <Chip label={VERSIONS.edit} color="secondary" />
        </Box>

        {/* Error Messages */}
        {error && <ErrorMessage message={error} />}
        {dataErrors.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {dataErrors.map((err, index) => (
              <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                {err}
              </Alert>
            ))}
          </Box>
        )}

        {/* Property Details - Only show if no critical errors */}
        {!error && dataErrors.length === 0 && (
          <>
            {/* Property Card */}
            <Card sx={{ mb: 4 }}>
              <Box sx={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={(() => {
                    const photoUrl = property?.primary_photo?.href || property?.photos?.[0]?.href || property?.image;
                    if (!photoUrl) return '/genbcs-24082644-0-jpg.png';
                    
                    // Replace thumbnail suffixes with high-quality version
                    return photoUrl
                      .replace(/-m(\d+)s\.jpg/, '-m$1x.jpg')  // Replace medium size with extra large
                      .replace(/-t\.jpg/, '-o.jpg')            // Replace thumbnail with original
                      .replace(/s\.jpg$/, 'od.jpg')            // Replace small with original download
                      .replace(/-m(\d+)\.jpg/, '-m$1x.jpg')    // Replace medium with extra large
                      .replace(/-l\.jpg/, '-o.jpg')            // Replace large with original
                      .replace(/-p\.jpg/, '-o.jpg');           // Replace preview with original
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
                  <Chip label={`${property.description?.beds} beds`} />
                  <Chip label={`${property.description?.baths} baths`} />
                  <Chip label={`${(property.description?.sqft || 0).toLocaleString()} sqft`} />
                  <Chip label={`$${(property.list_price || 0).toLocaleString()}`} color="primary" />
                </Box>
              </CardContent>
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

                {/* API Response */}
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">API Response:</Typography>
                    <Tooltip title={copySuccess || "Copy to clipboard"}>
                      <IconButton onClick={() => handleCopyToClipboard(property, 'API response')}>
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
                    {JSON.stringify(property, null, 2)}
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

            {/* Predicted Rental Income
            <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Predicted Rental Income</Typography>
            <Box sx={{ bgcolor: '#e8f5e9', p: 3, borderRadius: 2, display: 'inline-block' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {predictedRent !== null ? `$${predictedRent.toLocaleString()}/mo` : 'Loading...'}
              </Typography>
            </Box>
          </Box> */}

          {/* Rental Income Analysis Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Rental Income Analysis
            </Typography>

            {/* Predicted & Optimal Rent Cards */}
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', my: 3 }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Predicted Monthly Rent
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  $2,500/mo
                </Typography>
              </Paper>

              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Suggested Optimal Rent
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  $2,400/mo
                </Typography>
              </Paper>
            </Box>

            {/* Success Likelihood Curve */}
            <Box sx={{ height: 300, mt: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateSuccessCurve(2500)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="rent" label={{ value: 'Rent Price ($)', position: 'insideBottom', dy: 10 }} />
                  <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <ChartTooltip formatter={(value) => `${(value * 100).toFixed(0)}% Likelihood`} />
                  <Line
                    type="monotone"
                    dataKey="likelihood"
                    stroke="#228B22"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
              {/*Another version of predicted rent*/}
              {/* <Box sx={{ mb: 6 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Predicted Rental Income
                </Typography>
                <Box
                  onClick={() => setOpen(true)}
                  sx={{
                    bgcolor: '#e8f5e9',
                    p: 3,
                    borderRadius: 2,
                    display: 'inline-block',
                    cursor: 'pointer',
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    ${predictedRent1.toLocaleString()}/mo
                  </Typography>
                </Box>

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Rental Income Details
                    <IconButton onClick={() => setOpen(false)}>
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>

                  <DialogContent>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight="bold">Predicted Rent:</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>${predictedRent1.toLocaleString()}/mo</Typography>

                      <Typography variant="h6" fontWeight="bold">Suggested Optimal Rent:</Typography>
                      <Typography variant="body1">${optimalRent.toLocaleString()}/mo (Highest success likelihood)</Typography>
                    </Box>

                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={graphData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="rent" label={{ value: 'Rent Price ($)', position: 'insideBottomRight', offset: -5 }} />
                          <YAxis label={{ value: 'Success Likelihood', angle: -90, position: 'insideLeft' }} />
                          <ChartTooltip />
                          <Line type="monotone" dataKey="likelihood" stroke="#2e7d32" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </DialogContent>
                </Dialog>
              </Box> */}
              {/* Rent Optimization Explanation */}
              <Box sx={{ mb: 6, mt: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Rent Optimization Explanation
                </Typography>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9', position: 'relative' }}>
                  
                  {/* Renovation Friendly Tag - Top Right */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      border: '1px solid',
                      borderColor: property?.year_built && property.year_built < 2022 ? 'success.main' : 'error.main',
                      color: property?.year_built && property.year_built < 2022 ? 'success.main' : 'error.main',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {property?.year_built && property.year_built < 2022 ? '✔️ Renovation Friendly' : '❌ Not Renovation Friendly'}
                  </Box>

                  {/* Main Content Below */}
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 6 }}>
                    The rental prediction is influenced by key property features:
                  </Typography>

                  <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: '#555' }}>
                    <li><strong>📍 Location:</strong> {property?.location?.address?.city || "City Unknown"}, {property?.location?.address?.state_code || "State Unknown"}</li>
                    <li><strong>📐 Square Footage:</strong> {property?.description?.sqft ? `${property.description.sqft} sqft` : "Not available"}</li>
                    <li><strong>🛏️ Bedrooms:</strong> {property?.description?.beds || "N/A"} beds</li>
                    <li><strong>🛁 Bathrooms:</strong> {property?.description?.baths || "N/A"} baths</li>
                    <li><strong>🏠 Property Type:</strong> {property?.prop_type || "N/A"}</li>
                    <li><strong>🚗 Parking:</strong> {property?.parking?.spaces ? `${property.parking.spaces} spaces` : "No dedicated parking"}</li>
                    <li><strong>📄 Rental Terms:</strong> Annual Lease</li>
                  </ul>

                  <Typography variant="body2" color="text.secondary">
                    📈 Based on these factors and local market trends, the rent is optimized to increase the chances of a successful rental within the competitive market.
                  </Typography>

                </Paper>
              </Box>

            {/*Risk Assessment */}
              <Box sx={{ mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Risk Assessment
              </Typography>

              {/* Risk Level Chip */}
              <Chip
                label={`${riskLevel} Risk`}
                color={riskColor}
                sx={{ fontSize: '1rem', mb: 2, p: 2 }}
              />

              {/* Risk Message */}
              <Typography variant="body1" color="text.secondary">
                {riskMessage[riskLevel]}
              </Typography>
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
              <PropertyMap
                properties={property}
                center={coordinates}
              />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PropertyInfo;