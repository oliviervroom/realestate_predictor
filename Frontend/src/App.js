import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Frame } from './screens/Frame';
import PropertyInfo from './screens/PropertyInfo/PropertyInfo';
import PropertyListings from './screens/propertyListings/PropertyListings';

function App() {
  return (
    <Router>
      <Box>
        <Routes>
          <Route path="/" element={<Frame />} />
          <Route path="/property-listings" element={<PropertyListings />} />
           <Route path="/property-info" element={<PropertyInfo />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;