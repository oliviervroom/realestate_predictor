import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Chip, Alert, Paper, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import RangeSlider from '../../components/RangeSlider';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import {
  locationOptions,
  seasonOptions,
  monthOptions,
  bedroomOptions,
  numberOfBedroomsOptions,
  propertySizeOptions
} from '../../constants/filterOptions';
import { VERSION } from '../../version';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { searchProperties } from '../../services/realtyApi';

function Frame() {
  const [originalData, setOriginalData] = useState([]);
  const [modifiedData, setModifiedData] = useState([]);
  const [location, setLocation] = useState('');
  const [season, setSeason] = useState('');
  const [month, setMonth] = useState('');
  const [bedroom, setBedroom] = useState('studio');
  const [numberOfBedrooms, setNumberOfBedrooms] = useState('');
  const [propertySize, setPropertySize] = useState('small');
  const [sqft, setSqft] = useState(2000);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await searchProperties();
        setDebugInfo(result);

        if (!result.success) {
          throw new Error(result.errorMessage);
        }

        const processedData = prepareObjects(result.processedData);
        setOriginalData(processedData);
        setModifiedData(processedData);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError(error.message || 'Failed to fetch properties. Please try again later.');
        setOriginalData([]);
        setModifiedData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const prepareObjects = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: expected an array of properties');
    }
    
    return data.map((each) => {
      if (!each) return null;
      
      return {
        id: each.property_id,
        image: each.primary_photo || each.photos?.[0]?.href,
        price: each.price,
        beds: each.beds,
        baths: each.baths,
        sqft: each.sqft,
        address: each.location?.address || {},
        photos: each.photos || [],
        description: each.description || {},
        location: each.location || {},
        raw_data: each.raw_data || each
      };
    }).filter(Boolean);
  };

  const formatSqft = (value) => {
    return `${value.toLocaleString()} sqft`;
  };

  const handleSearch = async (searchLocation) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await searchProperties(searchLocation);
      setDebugInfo(result);

      if (!result.success) {
        throw new Error(result.errorMessage);
      }

      const processedData = prepareObjects(result.processedData);
      setOriginalData(processedData);
      setModifiedData(processedData);
    } catch (error) {
      console.error('Error searching properties:', error);
      setError(error.message || 'Failed to fetch properties. Please try again later.');
      setOriginalData([]);
      setModifiedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
      .then(() => {
        setCopySuccess(`${label} copied!`);
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <Box sx={{ bgcolor: '#faf9f8', minHeight: '100vh' }}>
      <Header />

      <Box
        sx={{
          width: '100%',
          height: '600px',
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#222222',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mt: 8 }}>

            <Box 
              sx={{ 
                bgcolor: 'rgba(34, 34, 34, 0.9)', 
                p: 3, 
                borderRadius: '4px', 
                mt: -0.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <SearchBar
                onSearch={handleSearch}
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                <FilterDropdown
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  options={locationOptions}
                />
                <FilterDropdown
                  label="Season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  options={seasonOptions}
                />
                <FilterDropdown
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  options={monthOptions}
                />
                <FilterDropdown
                  label="Bedroom Category"
                  value={bedroom}
                  onChange={(e) => setBedroom(e.target.value)}
                  options={bedroomOptions}
                />
                <FilterDropdown
                  label="Number of Bedrooms"
                  value={numberOfBedrooms}
                  onChange={(e) => setNumberOfBedrooms(e.target.value)}
                  options={numberOfBedroomsOptions}
                />
                <FilterDropdown
                  label="Property Size Category"
                  value={propertySize}
                  onChange={(e) => setPropertySize(e.target.value)}
                  options={propertySizeOptions}
                />
                <RangeSlider
                  value={sqft}
                  onChange={(e, newValue) => setSqft(newValue)}
                  min={500}
                  max={4000}
                  step={100}
                  formatLabel={formatSqft}
                  label="Square Feet"
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Chip label={`Version ${VERSION}`} color="primary" />
          {debugInfo && (
            <Chip 
              label={debugInfo.success ? "API Request Successful" : "API Request Failed"} 
              color={debugInfo.success ? "success" : "error"} 
            />
          )}
        </Box>

        {/* Debug Information Accordion */}
        {debugInfo && (
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>API Debug Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Request Data:</Typography>
                  <Tooltip title={copySuccess || "Copy to clipboard"}>
                    <IconButton onClick={() => handleCopyToClipboard(debugInfo.requestData, 'Request data')}>
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
                  {JSON.stringify(debugInfo.requestData, null, 2)}
                </Box>
              </Paper>
              
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Response Data:</Typography>
                  <Tooltip title={copySuccess || "Copy to clipboard"}>
                    <IconButton onClick={() => handleCopyToClipboard(debugInfo.success ? debugInfo.responseData : debugInfo.error, 'Response data')}>
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
                  {JSON.stringify(debugInfo.success ? debugInfo.responseData : debugInfo.error, null, 2)}
                </Box>
              </Paper>

              {debugInfo.errorSource && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Error Source: {debugInfo.errorSource}
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Popular in Manchester
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The most viewed and favorited homes in the past day.
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading properties...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : modifiedData.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No properties found. Try adjusting your search criteria.
          </Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {modifiedData.slice(0, 4).map((property) => (
                <Grid item xs={12} sm={6} md={4} key={property.id}>
                  <PropertyCard property={property} />
                </Grid>
              ))}
            </Grid>

            {modifiedData.length > 4 && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Showing top 4 results only
                </Typography>
                <Box
                  onClick={() =>
                    window.location.href = '/property-listings' // Or use navigate if available here
                  }
                  sx={{
                    display: 'inline-block',
                    cursor: 'pointer',
                    color: '#c82021',
                    border: '1px solid #c82021',
                    borderRadius: '4px',
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#c82021', color: '#fff' },
                  }}
                >
                  See All Properties
                </Box>
              </Box>
            )}
          </>
        )}
      </Container>

      <ErrorMessage 
        message={error} 
        open={!!error} 
        onClose={() => setError(null)} 
      />
    </Box>
  );
}

export default Frame;