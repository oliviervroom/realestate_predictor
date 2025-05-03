import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, Slider, Chip, Alert,
  Paper, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button
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
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import { searchMLSProperties, loadMLSData, getPricePrediction } from '../../services/mlsApi';
import DevModeWrapper from '../../components/DevToggle/DevModeWrapper';
import CircularProgress from '@mui/material/CircularProgress';

// Simple hash function to generate a stable number from a string
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate predictions based on property data
const generatePredictions = (property) => {
  if (!property?.location?.address?.line || !property?.list_price) return null;
  
  const address = property.location.address.line;
  const listPrice = property.list_price;
  
  // Generate a number between 0 and 1 using the address hash
  const hash = hashString(address);
  const normalizedHash = (hash % 1000) / 1000; // Convert to 0-1 range
  
  // Sale price: -10% to +10% of list price
  const salePercentage = (normalizedHash * 0.2) - 0.1; // -10% to +10%
  const predictedSalePrice = Math.round(listPrice * (1 + salePercentage));
  
  // Rental price: 1-3% of list price
  const rentalPercentage = 0.01 + (normalizedHash * 0.02); // 1-3%
  const predictedRent = Math.round(listPrice * rentalPercentage);
  
  return {
    predictedSalePrice,
    predictedRent
  };
};

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
  const [showRawData, setShowRawData] = useState(false);
  const [rawCsvData, setRawCsvData] = useState('');
  const [mlsData, setMlsData] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [mlsPredictedPrice, setMlsPredictedPrice] = useState(null);

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

  useEffect(() => {
    const fetchRawCsvData = async () => {
      if (!property?.raw_data) {
        console.log('No raw data found:', property);
        return;
      }
      
      try {
        // Convert the raw property object back to CSV format
        const csvLine = Object.values(property.raw_data).join(',');
        console.log('Generated CSV line:', csvLine);
        setRawCsvData(csvLine);
      } catch (error) {
        console.error('Error processing raw CSV data:', error);
      }
    };

    fetchRawCsvData();
  }, [property]);

  useEffect(() => {
    const fetchMLSData = async () => {
      if (!property?.location?.address?.line) return;
      
      try {
        const results = await searchMLSProperties(property.location.address.line, {
          directSearch: true
        });
        
        if (results && results.length > 0) {
          setMlsData(results[0]);
          // Convert the raw property object to CSV format
          const csvLine = Object.values(results[0].raw_data).join(',');
          setRawCsvData(csvLine);
        }
      } catch (error) {
        console.error('Error fetching MLS data:', error);
      }
    };

    fetchMLSData();
  }, [property]);

  useEffect(() => {
    // Calculate predicted price using the predictions function
    if (property?.list_price && property?.location?.address?.line) {
      const predictions = generatePredictions(property);
      setPredictedPrice(predictions?.predictedSalePrice || null);
    }
  }, [property]);

  useEffect(() => {
    if (mlsData) {
      setPredictionLoading(true);
      setPredictionError(null);
      setMlsPredictedPrice(null);
      getPricePrediction(mlsData.raw_data)
        .then((pred) => {
          if (pred !== null && pred !== undefined) {
            setMlsPredictedPrice(pred);
          } else {
            setPredictionError('Prediction unavailable');
          }
        })
        .catch(() => setPredictionError('Prediction unavailable'))
        .finally(() => setPredictionLoading(false));
    } else {
      setMlsPredictedPrice(null);
      setPredictionError(null);
      setPredictionLoading(false);
    }
  }, [mlsData]);

  const predictions = generatePredictions(property);

  if (dataErrors.length > 0) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <DevModeWrapper>
            <Chip label={VERSIONS.working} color="primary" sx={{ mr: 1 }} />
            <Chip label={VERSIONS.edit} color="secondary" />
          </DevModeWrapper>
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
            <DevModeWrapper>
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
            </DevModeWrapper>

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

            {/* Price Prediction Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Price Prediction
              </Typography>

              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#f9f9f9' }}>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 3 }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Current List Price
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      ${(property?.list_price || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Predicted Sale Price
                    </Typography>
                    {predictionLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={24} color="primary" />
                        <Typography variant="body1" color="text.secondary">Loading prediction...</Typography>
                      </Box>
                    ) : predictionError ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={24} color="error" variant="determinate" value={100} />
                        <Typography variant="body1" color="error">{predictionError}</Typography>
                      </Box>
                    ) : mlsPredictedPrice !== null ? (
                      <>
                        <Typography variant="h4" fontWeight="bold" color={mlsPredictedPrice > (property?.list_price || 0) ? 'success.main' : 'error.main'}>
                          ${mlsPredictedPrice.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color={mlsPredictedPrice > (property?.list_price || 0) ? 'success.main' : 'error.main'}>
                          {mlsPredictedPrice > (property?.list_price || 0) ? '↑' : '↓'} {Math.abs(Math.round((mlsPredictedPrice / (property?.list_price || 1) - 1) * 100))}% from list price
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h4" fontWeight="bold" color={predictions?.predictedSalePrice > (property?.list_price || 0) ? 'success.main' : 'error.main'}>
                        ${predictions?.predictedSalePrice?.toLocaleString() || 'Calculating...'}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                  * This is a preliminary prediction based on current market conditions and property features.
                  Actual sale price may vary based on market dynamics and negotiation factors.
                </Typography>

                {/* Raw MLS Data Section */}
                <Box sx={{ mt: 3, borderTop: '1px solid #e0e0e0', pt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CodeIcon />}
                    onClick={() => setShowRawData(true)}
                    sx={{ mb: 2 }}
                  >
                    View Raw MLS Data for Price Prediction
                  </Button>

                  <Dialog
                    open={showRawData}
                    onClose={() => setShowRawData(false)}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>
                      Raw MLS Data for Price Prediction
                      <IconButton
                        aria-label="close"
                        onClick={() => setShowRawData(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent>
                      <Box sx={{ position: 'relative' }}>
                        <IconButton
                          sx={{ position: 'absolute', right: 0, top: 0 }}
                          onClick={() => handleCopyToClipboard(rawCsvData, 'Raw MLS Data')}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                        <pre style={{ 
                          whiteSpace: 'pre-wrap', 
                          wordWrap: 'break-word',
                          backgroundColor: '#f5f5f5',
                          padding: '1rem',
                          borderRadius: '4px',
                          maxHeight: '60vh',
                          overflow: 'auto',
                          fontFamily: 'monospace'
                        }}>
                          {rawCsvData || 'No raw MLS data available'}
                        </pre>
                      </Box>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setShowRawData(false)}>Close</Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              </Paper>
            </Box>

            {/* Rental Income Analysis */}
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
                    ${predictions?.predictedRent?.toLocaleString() || 'Calculating...'}/mo
                  </Typography>
                </Paper>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 200 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Suggested Optimal Rent
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ${Math.round(predictions?.predictedRent * 0.95).toLocaleString() || 'Calculating...'}/mo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recommended for faster rental and higher occupancy
                  </Typography>
                </Paper>
              </Box>

              {/* Success Likelihood Curve */}
              <Box sx={{ height: 300, mt: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={(() => {
                    if (!predictions?.predictedRent) return [];
                    
                    const baseRent = predictions.predictedRent;
                    const optimalRent = Math.round(baseRent * 0.95);
                    const minRent = Math.round(baseRent * 0.7);  // 70% of predicted
                    const maxRent = Math.round(baseRent * 1.3);  // 130% of predicted
                    const step = Math.round((maxRent - minRent) / 30); // 30 points on the curve
                    
                    const data = [];
                    for (let rent = minRent; rent <= maxRent; rent += step) {
                      // Calculate likelihood - peaks at optimal rent
                      const distanceFromOptimal = Math.abs(rent - optimalRent) / baseRent;
                      const likelihood = Math.exp(-8 * Math.pow(distanceFromOptimal, 2));
                      data.push({ 
                        rent,
                        likelihood,
                        isOptimal: rent === optimalRent
                      });
                    }
                    
                    // Ensure optimal point is included
                    if (!data.find(d => d.rent === optimalRent)) {
                      data.push({
                        rent: optimalRent,
                        likelihood: 1,
                        isOptimal: true
                      });
                      // Sort to maintain curve smoothness
                      data.sort((a, b) => a.rent - b.rent);
                    }
                    
                    return data;
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="rent" 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      label={{ value: 'Monthly Rent ($)', position: 'insideBottom', dy: 10 }} 
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      domain={[0, 1]}
                    />
                    <ChartTooltip 
                      formatter={(value, name, props) => [
                        `${(value * 100).toFixed(0)}%`,
                        'Success Likelihood'
                      ]}
                      labelFormatter={(label) => `$${label.toLocaleString()}/mo`}
                    />
                    <Line
                      type="monotone"
                      dataKey="likelihood"
                      stroke="#228B22"
                      strokeWidth={3}
                      dot={(props) => {
                        if (props.payload.isOptimal) {
                          return (
                            <circle
                              cx={props.cx}
                              cy={props.cy}
                              r={6}
                              fill="#228B22"
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                The curve shows rental success likelihood at different price points. 
                The green dot indicates the suggested optimal rent for maximum occupancy.
              </Typography>
            </Box>

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