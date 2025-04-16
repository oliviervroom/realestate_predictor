import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const MapContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: '#e5e3df',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .placeholder-marker': {
    position: 'absolute',
    backgroundColor: '#00a0a0',
    color: 'white',
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(0.5),
    fontSize: '0.875rem',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: '50%',
      marginLeft: -8,
      borderWidth: 8,
      borderStyle: 'solid',
      borderColor: '#00a0a0 transparent transparent transparent',
    },
  },
}));

const PropertyMap = ({ properties }) => {
  return (
    <MapContainer>
      <Typography variant="body1" color="textSecondary">
        Map View Coming Soon
      </Typography>
      {/* Add some placeholder markers */}
      {properties?.map((property, index) => (
        <Box
          key={property.property_id || index}
          className="placeholder-marker"
          sx={{
            top: `${20 + (index * 10)}%`,
            left: `${20 + (index * 8)}%`,
          }}
        >
          ${property.price?.toLocaleString()}
        </Box>
      ))}
    </MapContainer>
  );
};

export default PropertyMap; 