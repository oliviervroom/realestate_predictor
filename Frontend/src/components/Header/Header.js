import React from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #d7d7d7' }}>
      <Toolbar>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo.png"
            alt="Predict Rentals Logo"
            style={{ 
              height: '100%',
              width: 'auto',
              maxHeight: '64px', // Standard Material-UI AppBar height
              cursor: 'pointer'
            }}
          />
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;