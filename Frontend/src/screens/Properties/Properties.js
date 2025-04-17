//This page fetches properties from the API and displays them in a list or map view. 

//It also has a search bar to search for properties by city, state, or ZIP code.

//It also has a filter to filter properties by price, beds, baths, and sqft.

//It also has a view toggle to switch between list and map view.  

//It also has a breadcrumb to show the user's location.

//It also has a loader to show when the properties are loading.

//It also has an error message to show when the properties fail to load.  

//It also has a debug info to show the API response.

//It also has a version info to show the current version of the app.  



import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Breadcrumbs, Link, Grid } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchBar from '../../components/SearchBar/SearchBar';
import ApiDebugInfo from '../../components/ApiDebugInfo/ApiDebugInfo';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyMap from '../../components/Map/PropertyMap';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import BedBathToggle from '../../components/BedBathToggle/BedBathToggle';
import PriceToggle from '../../components/PriceToggle/PriceToggle';
import SquareFootageToggle from '../../components/SquareFootageToggle/SquareFootageToggle';
import { searchProperties } from '../../services/realtyApi';
import { WORKING_VERSION, EDIT_VERSION } from '../../version';

// Move buildFilters outside the component to avoid dependency issues
const buildFilters = (stateCode, cityName, formattedAddress, postalCode, price, beds, baths, sqft) => {
  const filters = {};
  
  // Location filters
  if (postalCode) {
    filters.postal_code = postalCode;
  } else {
    if (stateCode) filters.state_code = stateCode;
    if (cityName) filters.city = cityName;
    if (formattedAddress) {
      filters.address = formattedAddress;
      filters.radius = '1.0';
      filters.exact_match = true;
    }
  }
  
  // Price filter
  if (price) {
    filters.list_price = {};
    if (price.min) filters.list_price.min = price.min;
    if (price.max) filters.list_price.max = price.max;
  }

  // Beds filter
  if (beds) {
    filters.beds = {};
    if (beds.min) filters.beds.min = beds.min;
    if (beds.max) filters.beds.max = beds.max;
  }

  // Baths filter
  if (baths) {
    filters.baths = {};
    if (baths.min) filters.baths.min = baths.min;
    if (baths.max) filters.baths.max = baths.max;
  }

  // Square footage filter
  if (sqft) {
    filters.sqft = {};
    if (sqft.min) filters.sqft.min = sqft.min;
    if (sqft.max) filters.sqft.max = sqft.max;
  }

  return filters;
};

const Properties = () => {
  const { state, city, address, postalCode } = useParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [view, setView] = useState('list');
  
  // Filter states
  const [price, setPrice] = useState(null);
  const [beds, setBeds] = useState(null);
  const [baths, setBaths] = useState(null);
  const [sqft, setSqft] = useState(null);

  // Format location parameters
  const stateCode = state?.toUpperCase();
  const cityName = city?.charAt(0).toUpperCase() + city?.slice(1).toLowerCase();
  const formattedAddress = address?.split('-').join(' ');

  // Determine view type and title
  const getViewInfo = () => {
    if (postalCode) {
      return {
        type: 'postal',
        title: `Properties in ${postalCode}`,
        subtitle: 'Available properties in this ZIP code'
      };
    }
    if (address) {
      return {
        type: 'address',
        title: `${formattedAddress}, ${cityName}, ${stateCode}`,
        subtitle: 'Property details and nearby listings'
      };
    }
    if (city) {
      return {
        type: 'city',
        title: `Properties in ${cityName}, ${stateCode}`,
        subtitle: `Available properties for investment in ${cityName}`
      };
    }
    return {
      type: 'state',
      title: `Properties in ${stateCode}`,
      subtitle: `Available properties for investment in ${stateCode}`
    };
  };

  // Generate breadcrumbs based on current view
  const getBreadcrumbs = () => {
    const crumbs = [
      { label: 'Home', link: '/' }
    ];

    if (postalCode) {
      crumbs.push({ label: `ZIP ${postalCode}`, link: null });
    } else {
      if (state) {
        crumbs.push({ label: stateCode, link: `/${state}` });
      }
      if (city) {
        crumbs.push({ label: cityName, link: `/${state}/${city}` });
      }
      if (address) {
        crumbs.push({ label: formattedAddress, link: null });
      }
    }

    return crumbs;
  };

  // Fetch properties
  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      try {
        const filters = buildFilters(stateCode, cityName, formattedAddress, postalCode, price, beds, baths, sqft);
        const result = await searchProperties(filters);
        if (result.success) {
          setProperties(result.processedData || []);
          setDebugInfo(result);
        } else {
          setError(result.errorMessage);
          setDebugInfo(result);
        }
      } catch (err) {
        setError('Failed to fetch properties');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [stateCode, cityName, formattedAddress, postalCode, price, beds, baths, sqft]);

  // Render property cards
  const renderProperties = () => (
    <Box sx={{ mt: 4 }}>
      {properties.length > 0 ? (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} key={property.property_id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      ) : !loading && (
        <Typography>No properties found in this area</Typography>
      )}
    </Box>
  );

  const viewInfo = getViewInfo();

  return (
    <Container maxWidth="lg" sx={{ position: 'relative', minHeight: '100vh', pb: 4 }}>
      <ViewToggle view={view} onViewChange={setView} />
      
      <Box sx={{ 
        py: 3,
        display: 'flex',
        flexDirection: 'column',
        height: view === 'map' ? '100vh' : 'auto'
      }}>
        {/* Version info */}
        <Typography variant="caption" display="block" gutterBottom>
          Working {WORKING_VERSION} (Edit {EDIT_VERSION})
        </Typography>

        {/* Header with search */}
        <Box sx={{ mb: 3 }}>
          <SearchBar />
        </Box>

        {/* Filters */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          bgcolor: 'rgba(34, 34, 34, 0.9)',
          p: 2,
          borderRadius: 1
        }}>
          <PriceToggle
            value={price}
            onChange={setPrice}
          />
          <BedBathToggle
            bedsValue={beds}
            bathsValue={baths}
            onBedsChange={setBeds}
            onBathsChange={setBaths}
          />
          <SquareFootageToggle
            value={sqft}
            onChange={setSqft}
          />
        </Box>

        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          {getBreadcrumbs().map((crumb, index) => (
            crumb.link ? (
              <Link
                key={index}
                component={RouterLink}
                to={crumb.link}
                color="inherit"
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={index} color="text.primary">
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>

        {/* Main content */}
        <Typography variant="h4" gutterBottom>
          {viewInfo.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {viewInfo.subtitle}
        </Typography>

        {/* Loading and error states */}
        {loading && (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((placeholder) => (
                <Grid item xs={12} sm={6} md={4} key={placeholder}>
                  <Box sx={{ height: 350, bgcolor: 'grey.100', borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {error && (
          <Box sx={{ mt: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* View content */}
        {view === 'map' ? (
          <Box sx={{ flex: 1, minHeight: 500 }}>
            <PropertyMap 
              properties={properties}
              height="600px"
              width="100%"
              zoom={12}
            />
          </Box>
        ) : view === 'split' ? (
          <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 500 }}>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {renderProperties()}
            </Box>
            <Box sx={{ flex: 1, position: 'relative', height: '600px' }}>
              <PropertyMap 
                properties={properties}
                height="100%"
                width="100%"
                zoom={12}
              />
            </Box>
          </Box>
        ) : (
          renderProperties()
        )}

        {/* API Debug Information */}
        <ApiDebugInfo debugInfo={debugInfo} />
      </Box>
    </Container>
  );
};

export default Properties; 