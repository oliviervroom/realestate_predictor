import React, { useEffect, useState } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

// Initial fallback location
const initialPosition = {
  lat: 53.54992,
  lng: 10.00678,
};

const MapComponent = ({ google, location, price }) => {
  const [markerPosition, setMarkerPosition] = useState(initialPosition);
  const [showingInfoWindow, setShowingInfoWindow] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    if (location?.address?.coordinate?.lat && location?.address?.coordinate?.lon) {
      setMarkerPosition({
        lat: location.address.coordinate.lat,
        lng: location.address.coordinate.lon
      });
    }
  }, [location]);

  const onMarkerClick = (props, marker) => {
    setActiveMarker(marker);
    setShowingInfoWindow(true);
  };

  const onClose = () => {
    setShowingInfoWindow(false);
    setActiveMarker(null);
  };

  // Format price
  const formattedPrice = price >= 1000000
    ? `$${(price / 1000000).toFixed(1)}M`
    : `$${Math.round(price / 1000)}K`;

  return (
    <div>
      <Map
        google={google}
        zoom={14}
        initialCenter={markerPosition}
        center={markerPosition}
        style={{
          width: '80%',
          height: '400px',
          borderRadius: 8,
          marginTop: 16
        }}
      >
        <Marker
          position={markerPosition}
          onClick={onMarkerClick}
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
                    ${formattedPrice}
                  </text>
                </g>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(80, 45),
            anchor: new window.google.maps.Point(40, 48),
          }}
        />

        <InfoWindow
          marker={activeMarker}
          visible={showingInfoWindow}
          onClose={onClose}
        >
          <div>
            <h3>Property Info</h3>
            <p>{formattedPrice}</p>
            <p>Lat: {markerPosition.lat}</p>
            <p>Lng: {markerPosition.lng}</p>
          </div>
        </InfoWindow>
      </Map>
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(MapComponent);