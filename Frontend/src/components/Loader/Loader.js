// src/components/FullPageLoader.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = ({ text = "Loading..." }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography mt={2} variant="h6" color="text.primary">
        {text}
      </Typography>
    </Box>
  );
};

export default Loader;