import React from 'react';
import { AppBar, Button, Toolbar } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #d7d7d7' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <img
          src="/screenshot-2025-03-23-at-9-40-55-pm-1.png"
          alt="Predict Rentals Logo"
          style={{ height: '41px' }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#222222',
            color: 'white',
            height: '41px',
            '&:hover': {
              backgroundColor: '#333333',
            },
          }}
        >
          Join / Sign in
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;