import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Chip } from '@mui/material';
import ApiIcon from '@mui/icons-material/Api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DataObjectIcon from '@mui/icons-material/DataObject';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SearchBar from '../SearchBar';

const Frame = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [apiDebugInfo, setApiDebugInfo] = useState(null);

  const handleSearch = (location) => {
    console.log('Search location updated:', location); // Debug log
    setSearchLocation(location);
  };

  return (
    <Box sx={{ bgcolor: '#faf9f8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <SearchBar onSearch={handleSearch} />
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            {searchLocation ? `Properties in ${searchLocation}` : 'Popular in Manchester'}
          </Typography>
        </Box>

        {/* Property listings would go here */}
        
        {/* API Debug Info moved to bottom */}
        <Box sx={{ mt: 6 }}>
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
    </Box>
  );
};

export default Frame; 