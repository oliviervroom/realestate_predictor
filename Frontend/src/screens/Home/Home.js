import React from 'react';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar/SearchBar';

function Home() {
  const navigate = useNavigate();

  const handleSearch = (searchData) => {
    if (!searchData) return;

    // Handle direct postal code input
    if (typeof searchData === 'string' && /^\d{5}$/.test(searchData)) {
      navigate(`/zip/${searchData}`);
      return;
    }

    // Parse location data and navigate
    if (searchData.line && searchData.city && searchData.state_code) {
      // Full address
      const formattedAddress = searchData.line.toLowerCase().replace(/[,\s]+/g, '-');
      const formattedCity = searchData.city.toLowerCase().replace(/\s+/g, '-');
      const formattedState = searchData.state_code.toLowerCase();
      navigate(`/${formattedState}/${formattedCity}/${formattedAddress}`);
    } else if (searchData.postal_code) {
      navigate(`/zip/${searchData.postal_code}`);
    } else if (searchData.city && searchData.state_code) {
      // City
      const path = [
        searchData.state_code.toLowerCase(),
        searchData.city.toLowerCase().replace(/\s+/g, '-')
      ].join('/');
      navigate(`/${path}`);
    } else if (searchData.state_code) {
      // State only
      navigate(`/${searchData.state_code.toLowerCase()}`);
    }
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
                onSearch={handleSearch}
                placeholder="Enter city and state (e.g., Boston, MA) or ZIP code"
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 