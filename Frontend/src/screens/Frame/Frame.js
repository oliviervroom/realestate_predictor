import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Chip, Alert, Paper, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import RangeSlider from '../../components/RangeSlider';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import BedBathToggle from '../../components/BedBathToggle/BedBathToggle';
import PriceToggle from '../../components/PriceToggle/PriceToggle';
import SquareFootageToggle from '../../components/SquareFootageToggle/SquareFootageToggle';
import { VERSIONS } from '../../version';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { searchProperties } from '../../services/realtyApi';
import { Link } from 'react-router-dom';
import ApiIcon from '@mui/icons-material/Api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DataObjectIcon from '@mui/icons-material/DataObject';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import DevModeWrapper from '../../components/DevToggle/DevModeWrapper';

function Frame() {
  const [originalData, setOriginalData] = useState([]);
  const [modifiedData, setModifiedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('Manchester, NH');
  const [shouldSearch, setShouldSearch] = useState(true);
  const [beds, setBeds] = useState(null);
  const [baths, setBaths] = useState(null);
  const [price, setPrice] = useState(null);
  const [sqft, setSqft] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [apiDebugInfo, setApiDebugInfo] = useState(null);

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

  useEffect(() => {
    const handleSearch = async () => {
      if (!shouldSearch) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const filters = {
        beds,
        baths,
        price,
        sqft,
        location: searchQuery
      };

      try {
        console.log('Current filters:', {
          beds,
          baths,
          price,
          sqft,
          location: searchQuery
        });

        console.log('Sending search request:', { searchQuery, filters });

        const result = await searchProperties(searchQuery, filters);
        
        if (!result.success) {
          setError(result.errorMessage);
          setModifiedData([]);
          setApiDebugInfo({
            requestData: filters,
            responseData: null,
            error: result.errorMessage,
            debugSteps: result.debugSteps || []
          });
          setDebugInfo(result);
        } else {
          const processedData = prepareObjects(result.processedData);
          setOriginalData(processedData);
          setModifiedData(processedData);
          setApiDebugInfo({
            requestData: filters,
            responseData: result.processedData,
            error: null,
            debugSteps: result.debugSteps || []
          });
          setDebugInfo(result);
          if (result.processedData.length === 0) {
            setError('No properties found matching your criteria');
          }
        }
      } catch (err) {
        setError('Failed to search properties');
        setModifiedData([]);
        setApiDebugInfo({
          requestData: filters,
          responseData: null,
          error: err.message,
          debugSteps: []
        });
      } finally {
        setIsLoading(false);
        setShouldSearch(false);
      }
    };

    handleSearch();
  }, [searchQuery, beds, baths, price, sqft, shouldSearch]);

  const onSearch = (query) => {
    setSearchQuery(query);
    setShouldSearch(true);
  };

  // Update filters
  useEffect(() => {
    if (beds || baths || price || sqft) {
      setShouldSearch(true);
    }
  }, [beds, baths, price, sqft]);

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
      .then(() => {
        setCopySuccess(`${label} copied!`);
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
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
                onSearch={onSearch}
                placeholder="Enter city and state (e.g., Boston, MA) or ZIP code"
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <PriceToggle
                  value={price}
                  onChange={setPrice}
                />
                <BedBathToggle
                  bedsValue={beds}
                  bathsValue={baths}
                  onBedsChange={(value) => {
                    setBeds(value);
                    setShouldSearch(true);
                  }}
                  onBathsChange={(value) => {
                    setBaths(value);
                    setShouldSearch(true);
                  }}
                />
                <SquareFootageToggle
                  value={sqft}
                  onChange={setSqft}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/changelog" style={{ textDecoration: 'none' }}>
              <Chip 
                label="View Changelog" 
                variant="outlined" 
                color="primary"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' } }}
              />
            </Link>
          </Box>
          <DevModeWrapper>
            {debugInfo && (
              <Chip 
                label={debugInfo.success ? "API Request Successful" : "API Request Failed"} 
                color={debugInfo.success ? "success" : "error"} 
              />
            )}
          </DevModeWrapper>
        </Box>

        {/* Debug Information Accordion */}
        <DevModeWrapper>
          {debugInfo && (
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>API Debug Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">Filter Debug Steps:</Typography>
                    <Tooltip title={copySuccess || "Copy to clipboard"}>
                      <IconButton onClick={() => handleCopyToClipboard(debugInfo.debugSteps || [], 'Debug steps')}>
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
                    {JSON.stringify(debugInfo.debugSteps || [], null, 2)}
                  </Box>
                </Paper>

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
        </DevModeWrapper>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {searchQuery ? `Properties in ${searchQuery}` : 'Properties in Manchester, NH'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Available properties for investment
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

        {/* API Debug Info at bottom */}
        <Box sx={{ mt: 6 }} className="api-debug-info">
          {apiDebugInfo && (
            <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                API Debug Info
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<ApiIcon />}
                  label={`Status: ${apiDebugInfo.status}`}
                  color={apiDebugInfo.status === 'success' ? 'success' : 'error'}
                  variant="outlined"
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`Response Time: ${apiDebugInfo.responseTime}ms`}
                  variant="outlined"
                />
                <Chip
                  icon={<DataObjectIcon />}
                  label={`Data Points: ${apiDebugInfo.dataPoints}`}
                  variant="outlined"
                />
                <Chip
                  icon={<MemoryIcon />}
                  label={`Cache: ${apiDebugInfo.cacheStatus}`}
                  variant="outlined"
                />
                <Chip
                  icon={<StorageIcon />}
                  label={`Memory: ${apiDebugInfo.memoryUsage}`}
                  variant="outlined"
                />
              </Box>
            </Paper>
          )}
        </Box>
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