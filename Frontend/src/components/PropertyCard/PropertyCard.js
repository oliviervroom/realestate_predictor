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
import { LocationOn, Bed, Bathtub, SquareFoot } from '@mui/icons-material';

const DEFAULT_IMAGE = '/default-property.png';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleClick = () => {
    navigate('/property-info', { state: property });
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
      onClick={handleClick}
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
        image={getImageUrl()}
        alt={property?.location?.address?.line || 'Property'}
        onError={handleImageError}
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
      </CardContent>
    </Card>
  );
};

export default PropertyCard;