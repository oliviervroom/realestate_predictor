import React, { useState } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { Box, Typography } from '@mui/material';

const PropertyMap = ({ 
  google, 
  properties, // Can be a single property or array of properties
  center, // Optional center point for the map
  zoom = 14,
  height = '400px',
  width = '80%'
}) => {
  const [showingInfoWindow, setShowingInfoWindow] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Ensure properties is always an array
  const propertiesArray = Array.isArray(properties) ? properties : [properties];
  
  // Get the first valid property's coordinates for center if not provided
  const defaultCenter = propertiesArray.find(p => 
    p?.location?.address?.coordinate?.lat && 
    p?.location?.address?.coordinate?.lon
  )?.location?.address?.coordinate || { lat: 37.7749, lon: -122.4194 };

  const mapCenter = center || {
    lat: defaultCenter.lat,
    lng: defaultCenter.lon
  };

  const onMarkerClick = (props, marker, property) => {
    setActiveMarker(marker);
    setSelectedProperty(property);
    setShowingInfoWindow(true);
  };

  const onClose = () => {
    setShowingInfoWindow(false);
    setActiveMarker(null);
    setSelectedProperty(null);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return price >= 1000000
      ? `$${(price / 1000000).toFixed(1)}M`
      : `$${Math.round(price / 1000)}K`;
  };

  return (
    <div>
      <Map
        google={google}
        zoom={zoom}
        initialCenter={mapCenter}
        center={mapCenter}
        style={{
          width,
          height,
          borderRadius: 8,
          marginTop: 16
        }}
      >
        {propertiesArray.map((property, index) => {
          const coordinates = property?.location?.address?.coordinate;
          if (!coordinates?.lat || !coordinates?.lon) return null;

          const price = property?.price || property?.list_price || property?.estimate?.estimate;
          
          return (
            <Marker
              key={property.property_id || index}
              position={{ lat: coordinates.lat, lng: coordinates.lon }}
              onClick={(props, marker) => onMarkerClick(props, marker, property)}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="90" height="48" viewBox="0 0 90 48" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.2"/>
                      </filter>
                    </defs>
                    <g filter="url(#shadow)">
                      <path d="M10 0h70a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H50l-5 8-5-8H10A10 10 0 0 1 0 30V10A10 10 0 0 1 10 0z" fill="#c82021" />
                      <text x="45" y="23" text-anchor="middle" fill="white" font-size="14" font-family="Arial" font-weight="bold">
                        ${formatPrice(price)}
                      </text>
                    </g>
                  </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(80, 45),
                anchor: new window.google.maps.Point(40, 48),
              }}
            />
          );
        })}

        <InfoWindow
          marker={activeMarker}
          visible={showingInfoWindow}
          onClose={onClose}
        >
          {selectedProperty && (
            <Box sx={{ maxWidth: 250 }}>
              <Box
                component="img"
                src={(() => {
                  const photoUrl = selectedProperty?.primary_photo?.href || selectedProperty?.photos?.[0]?.href || selectedProperty?.image;
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
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 1
                }}
              />
              <Typography variant="h6" gutterBottom>
                {formatPrice(selectedProperty?.price || selectedProperty?.list_price || selectedProperty?.estimate?.estimate)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedProperty?.location?.address?.line || 'Address not available'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {selectedProperty?.location?.address?.city || 'City not available'}, {selectedProperty?.location?.address?.state_code || 'State not available'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2">
                  {selectedProperty?.description?.beds || 0} beds
                </Typography>
                <Typography variant="body2">
                  {selectedProperty?.description?.baths || 0} baths
                </Typography>
                <Typography variant="body2">
                  {(selectedProperty?.description?.sqft || 0).toLocaleString()} sqft
                </Typography>
              </Box>
            </Box>
          )}
        </InfoWindow>
      </Map>
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(PropertyMap); 