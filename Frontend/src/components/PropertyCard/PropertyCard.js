import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const PropertyCard = ({ property }) => {
  // Handle image source
  const photo =
    property?.photos || property?.image || property?.primary_photo?.href || '/placeholder.png';

  // Handle price
  const price =
    property?.price ||
    property?.list_price ||
    property?.listPrice; // fallback if manually set elsewhere

  // Handle beds, baths, sqft
  const beds = property?.beds || property?.description?.beds;
  const baths = property?.baths || property?.description?.baths;
  const sqft = property?.sqft || property?.description?.sqft;

  // Address
  const address = property?.location?.address;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
      <Box
        component="img"
        src={photo}
        alt="Property"
        sx={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          {price ? `$${price.toLocaleString()}` : 'Price not available'}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {beds != null ? `${beds} beds` : 'N/A beds'} •{' '}
          {baths != null ? `${baths} baths` : 'N/A baths'} •{' '}
          {sqft != null ? `${sqft.toLocaleString()} sq ft` : 'N/A sq ft'}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {address?.line}, {address?.city}, {address?.state} {address?.postal_code}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default React.memo(PropertyCard);