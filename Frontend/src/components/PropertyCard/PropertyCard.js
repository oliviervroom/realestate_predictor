import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Skeleton
} from '@mui/material';
import { LocationOn, Bed, Bathtub, SquareFoot, TrendingUp, MonetizationOn } from '@mui/icons-material';

const DEFAULT_IMAGE = '/default-property.png';

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

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const predictions = generatePredictions(property);

  const handleClick = () => {
    // Get address components
    const address = property?.location?.address?.line || property?.address?.line;
    const city = property?.location?.address?.city || property?.address?.city;
    const state = property?.location?.address?.state_code || property?.address?.state_code;

    if (address && city && state) {
      // Format the address for URL
      const formattedAddress = address.toLowerCase().replace(/[,\s]+/g, '-');
      const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
      const formattedState = state.toLowerCase();
      
      // Navigate to the proper route
      navigate(`/${formattedState}/${formattedCity}/${formattedAddress}`, {
        state: property
      });
    } else {
      console.error('Missing address information:', property);
    }
  };

  const getImageUrl = () => {
    if (imageError) return DEFAULT_IMAGE;
    return property?.primary_photo?.href || 
           property?.photos?.[0]?.href || 
           property?.image || 
           DEFAULT_IMAGE;
  };

  const handleImageError = (e) => {
    console.warn('Property image failed to load:', {
      propertyId: property?.property_id,
      attemptedUrl: e.target.src
    });
    setImageError(true);
    e.target.src = DEFAULT_IMAGE;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card 
      onClick={handleClick}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      {imageLoading && (
        <Skeleton 
          variant="rectangular" 
          height={200}
          animation="wave"
          sx={{ bgcolor: 'grey.100' }}
        />
      )}
      <CardMedia
        component="img"
        height={200}
        image={(() => {
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
        alt={property?.location?.address?.line || 'Property'}
        onError={(e) => {
          e.target.src = '/genbcs-24082644-0-jpg.png';
        }}
        onLoad={handleImageLoad}
        sx={{ 
          display: imageLoading ? 'none' : 'block',
          objectFit: 'cover'
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {(() => {
            const price = property?.price || property?.list_price || property?.estimate?.estimate;
            return price ? `$${price.toLocaleString()}` : 'Price not available';
          })()}
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <LocationOn sx={{ mr: 0.5, color: 'text.secondary' }} />
          {property?.address?.line || property?.location?.address?.line || 'Address not available'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip
            icon={<Bed />}
            label={`${property?.beds || property?.description?.beds || 0} beds`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<Bathtub />}
            label={`${property?.baths || property?.description?.baths || 0} baths`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<SquareFoot />}
            label={`${(property?.sqft || property?.description?.sqft || 0).toLocaleString()} sqft`}
            size="small"
            variant="outlined"
          />
        </Box>

        {predictions && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: predictions.predictedSalePrice > (property?.list_price || 0) ? 'success.main' : 'error.main' }} />
              <Typography variant="body2" color={predictions.predictedSalePrice > (property?.list_price || 0) ? 'success.main' : 'error.main'}>
                Predicted Sale: ${predictions.predictedSalePrice.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MonetizationOn sx={{ color: 'primary.main' }} />
              <Typography variant="body2" color="primary.main">
                Predicted Rent: ${predictions.predictedRent.toLocaleString()}/mo
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;