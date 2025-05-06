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
import Header from '../../components/Header';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { VERSIONS } from '../../version';
import PropertyMap from '../../components/Map/PropertyMap';
// import { getPredictedRent } from '../../services/realtyApi';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import { searchMLSProperties, loadMLSData,getFullRentInsights, getPricePrediction } from '../../services/mlsApi';
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
  if (!property?.list_price) return null;
  
  const listPrice = property.list_price;
  
  // If we have complete data, use the existing hash-based prediction
  if (property?.location?.address?.line) {
    const address = property.location.address.line;
    
    // Generate a number between 0 and 1 using the address hash
    const hash = hashString(address);
    const normalizedHash = (hash % 1000) / 1000; // Convert to 0-1 range
    
    // Sale price: -10% to +10% of list price
    const salePercentage = (normalizedHash * 0.2) - 0.1; // -10% to +10%
    const predictedSalePrice = Math.round(listPrice * (1 + salePercentage));
    
    // Rental price: 1% of list price
    const rentalPercentage = 0.01 + (normalizedHash * 0.002); // 1%
    const predictedRent = Math.round(listPrice * rentalPercentage);
    
    return {
      predictedSalePrice,
      predictedRent
    };
  }
  
  // Fallback calculation when data is incomplete
  // Base rental rate around 1% of list price
  let baseRentalRate = 0.01;
  
  // Adjust based on property features if available
  if (property?.beds) {
    baseRentalRate += (property.beds * 0.001); // Each bedroom adds 0.1%
  }
  if (property?.baths) {
    baseRentalRate += (property.baths * 0.0005); // Each bathroom adds 0.05%
  }
  if (property?.sqft) {
    baseRentalRate += (property.sqft / 10000); // Each 1000 sqft adds 0.1%
  }
  
  // Add some randomness (-10% to +10%)
  const randomFactor = 0.9 + (Math.random() * 0.2);
  const predictedRent = Math.round(listPrice * baseRentalRate * randomFactor);
  
  // Ensure rent stays within reasonable bounds (0.5% to 2% of list price)
  const minRent = Math.round(listPrice * 0.005);
  const maxRent = Math.round(listPrice * 0.02);
  const boundedRent = Math.min(Math.max(predictedRent, minRent), maxRent);
  
  return {
    predictedSalePrice: Math.round(listPrice * (0.95 + Math.random() * 0.1)), // 95-105% of list price
    predictedRent: boundedRent
  };
};

const PropertyInfo = () => {
  const location = useLocation();
  const property = location?.state || JSON.parse(localStorage.getItem('selectedProperty'));
  const allProperties = location?.state?.allProperties || [];
  const currentPropertyId = property?.property_id;

  const [error, setError] = useState(null);
  const [dataErrors, setDataErrors] = useState([]);
  const [copySuccess, setCopySuccess] = useState('');
  const [adjustedRent, setAdjustedRent] = useState(
    property?.rental_estimate || Math.round((property?.estimate?.estimate || 300000) * 0.0045)
  );
  const [showRawData, setShowRawData] = useState(false);
  const [rawCsvData, setRawCsvData] = useState('');
  const [mlsData, setMlsData] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [mlsPredictedPrice, setMlsPredictedPrice] = useState(null);
  const [rentInsights, setRentInsights] = useState(null);
  const totalRisk = rentInsights?.total_risk_score;
  const riskLevel = totalRisk < 0.4 ? "Low" : totalRisk < 0.7 ? "Medium" : "High";
  const riskColor = totalRisk < 0.4 ? "success" : totalRisk < 0.7 ? "warning" : "error";
  const riskMessage = {
    Low: 'This property shows a low investment risk based on current market data.',
    Medium: 'This property shows a moderate investment risk. Proceed with some caution.',
    High: 'This property shows a high investment risk. Carefully review before investing.'
  };

  const [position, setPosition] = useState(50); // 50% is center
  const [isDragging, setIsDragging] = useState(false);
  const [baseRent, setBaseRent] = useState(
    property?.rental_estimate || Math.round((property?.estimate?.estimate || 300000) * 0.0045)
  );
  const percentageDiff = Math.round(((adjustedRent / baseRent) - 1) * 100);

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
    if (!property?.property_id) {
      const errorMessage = 'Property ID is missing';
      console.error('API Error:', {
        message: errorMessage,
        response: property,
        timestamp: new Date().toISOString()
      });
      errors.push(errorMessage);
    }
    // Check address under location.address.line
    if (!property?.location?.address?.line) {
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
    const fetchInsights = async () => {
      const address = property.location.address.line;
      if (!address) return;
      const insights = await getFullRentInsights(address);
      setRentInsights(insights);
    };
    fetchInsights();
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

  const convertToCommonFormat = (mlsProperty) => {
    if (!mlsProperty) return null;
  
    const formatted = {
      line: mlsProperty.ADDRESS,
      list_price: mlsProperty.LIST_PRICE,
      location: {
        address: {
          line: mlsProperty.ADDRESS,
          city: mlsProperty.TOWN,
          state_code: mlsProperty.STATE,
          postal_code: mlsProperty.ZIP_CODE?.toString()
        }
      },
      description: mlsProperty.REMARKS,
      property_type: mlsProperty.STYLE_SF || 'Unknown',
      year_built: mlsProperty.YEAR_BUILT,
      beds: mlsProperty.NO_BEDROOMS,
      baths: mlsProperty.TOTAL_BATHS,
      building_size: {
        size: mlsProperty.SQUARE_FEET,
        units: 'SQUARE FEET'
      },
      lot_size: {
        size: mlsProperty.ACRE,
        units: 'acres'
      },
      raw_data: mlsProperty
    };
  
    return formatted;
  };

  useEffect(() => {
    const fetchMLSData = async () => {
      const address = property?.location?.address?.line;
      if (!address) return;
      
      try {
        const results = await searchMLSProperties(address, {
          directSearch: true
        });
        
        if (results && results.length > 0) {
          const matched = results[0];
          console.log('🎯 Matched CSV Entry from ADDRESS:', matched);
      // setMlsData(matched);
          setMlsData(results[0]);
          // Convert the raw property object to CSV format
          const csvLine = Object.values(results[0].raw_data).join(',');
          setRawCsvData(csvLine);
        } else {
          console.warn('nO mls MATCH FOUND FOR ADDRESS:',address)
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

  const priceTrendData = generatePriceTrendData(property);

  const nearbyProperties = allProperties.filter(
    (p) => p?.property_id !== currentPropertyId &&
    p?.address?.lat && p?.address?.long
  );

  function generatePriceTrendData(property) {
    try {
      const realDataPoints = [];
      const currentYear = new Date().getFullYear();
      const yearsToShow = 10;
      const startYear = currentYear - yearsToShow + 1;
      let appreciationRate = 0.03; // Default to 3% annual appreciation
      let startValue;
      let anchorYear;
      let anchorValue;

      // Use last sold price as anchor if available and within last 10 years
      if (property?.last_sold_price && property?.last_sold_date) {
        anchorYear = new Date(property.last_sold_date).getFullYear();
        anchorValue = property.last_sold_price;
        if (anchorYear > startYear) {
          const yearsBack = anchorYear - startYear;
          startValue = anchorValue / Math.pow(1 + appreciationRate, yearsBack);
        } else {
          startValue = anchorValue;
        }
      } else if (property?.list_price) {
        anchorYear = currentYear;
        anchorValue = property.list_price;
        startValue = anchorValue / Math.pow(1 + appreciationRate, yearsToShow - 1);
      } else {
        startValue = 300000;
        anchorYear = currentYear;
        anchorValue = 300000 * Math.pow(1 + appreciationRate, yearsToShow - 1);
      }

      // Generate values for each year with fluctuation
      for (let i = 0; i < yearsToShow; i++) {
        const year = startYear + i;
        let value;
        if (year === anchorYear) {
          value = anchorValue;
        } else if (year < anchorYear) {
          value = startValue * Math.pow(1 + appreciationRate, year - startYear);
        } else {
          value = anchorValue * Math.pow(1 + appreciationRate, year - anchorYear);
        }
        // Add fluctuation except for the final year (current year)
        if (year !== currentYear) {
          const fluctuation = 1 + (Math.random() * 0.07 - 0.035); // ±3.5%
          value = Math.round(value * fluctuation);
        } else {
          value = Math.round(value);
        }
        realDataPoints.push({
          date: year.toString(),
          value: value
        });
      }

      // For the current year, use the predicted price if available
      if (mlsPredictedPrice) {
        realDataPoints[realDataPoints.length - 1].value = mlsPredictedPrice;
      }

      if (realDataPoints.length >= 3) {
        realDataPoints.sort((a, b) => parseInt(a.date) - parseInt(b.date));
        return realDataPoints;
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

  const handleDragStart = (e) => {
    setIsDragging(true);
    updatePosition(e);
  };

  const handleDragMove = (e) => {
    if (isDragging) {
      updatePosition(e);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const updatePosition = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    // Only use the x coordinate, ignore y position
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const boundedPercentage = Math.min(Math.max(percentage, 0), 100);
    setPosition(boundedPercentage);
    
    // Calculate new rent based on position
    const factor = 0.8 + (boundedPercentage / 100) * 0.4; // 0.8 to 1.2
    setAdjustedRent(Math.round(baseRent * factor));
  };

  // Add touch support
  const handleTouchStart = (e) => {
    setIsDragging(true);
    updateTouchPosition(e);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      updateTouchPosition(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateTouchPosition = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.min(Math.max(touch.clientX, rect.left), rect.right);
    const percentage = ((x - rect.left) / rect.width) * 100;
    const boundedPercentage = Math.min(Math.max(percentage, 0), 100);
    setPosition(boundedPercentage);
    
    // Calculate new rent based on position
    const factor = 0.8 + (boundedPercentage / 100) * 0.4; // 0.8 to 1.2
    setAdjustedRent(Math.round(baseRent * factor));
  };

  const handleReset = () => {
    setPosition(50);
    setAdjustedRent(baseRent);
  };

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
            <DevModeWrapper>
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
            </DevModeWrapper>

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
                <DevModeWrapper>
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
                </DevModeWrapper>
              </Paper>
            </Box>

            {/* Rental Income Analysis */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Rental Income Analysis
              </Typography>

              {/* Predicted & Optimal Rent Cards */}
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', my: 3 }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 200, maxWidth: 500 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Predicted Monthly Rent
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {rentInsights?.predicted_rent && !rentInsights.predicted_rent.toString().includes('not found') 
                      ? `$${rentInsights.predicted_rent.toLocaleString()}/mo` 
                      : `$${predictions?.predictedRent.toLocaleString()}/mo`}
                  </Typography>
                </Paper>
              </Box>
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
                <li><strong>Median Rent in Area:</strong> {rentInsights?.optimal_rent?.median_rent ? `$${rentInsights?.optimal_rent?.median_rent.toFixed(2)}/mo` : 'Calculating...'}</li>
                 <li><strong> Difference from Median:</strong> ${rentInsights?.optimal_rent?.difference} </li>
                  <li><strong> Likelihood of Renting:</strong> {rentInsights?.optimal_rent?.likelihood}</li>
                  <li><strong>Based on {rentInsights?.num_comps} local comps. </strong></li>
                  <li><strong>Suggestion: {rentInsights?.optimal_rent?.suggestion}</strong></li>
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

            {/* Market Positioning */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Market Positioning
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Drag the circle to see how different rental rates compare to market rates
              </Typography>

              {/* Gradient Bar with Draggable Circle */}
              <Box
                sx={{
                  position: 'relative',
                  height: 10,
                  borderRadius: 5,
                  background: 'linear-gradient(to right, #c8e6c9, #fff59d, #ffcdd2)',
                  mb: 2,
                  mt: 3,
                  cursor: 'pointer'
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
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
                    left: `${position}%`,
                    transition: isDragging ? 'none' : 'left 0.1s ease',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                />
              </Box>

              {/* Price Labels and Percentage Display */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mb: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    ${Math.round(baseRent * 0.8)}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    (-20%)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${Math.round(adjustedRent)}
                  </Typography>
                  <Typography variant="subtitle1" color={percentageDiff >= 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                    {percentageDiff >= 0 ? '+' : ''}{percentageDiff}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    ${Math.round(baseRent * 1.2)}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    (+20%)
                  </Typography>
                </Box>
              </Box>

              {/* Reset Button */}
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleReset}
                sx={{ mt: 2 }}
              >
                Reset to Predicted Rate
              </Button>
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