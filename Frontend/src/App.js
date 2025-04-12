import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Frame } from './screens/Frame';
import PropertyInfo from './screens/PropertyInfo/PropertyInfo';
import PropertyListings from './screens/propertyListings/PropertyListings';
import Changelog from './components/Changelog/Changelog';

function App() {
  return (
    <Router>
      <Box>
        <Routes>
          <Route path="/" element={<Frame />} />
          <Route path="/property-listings" element={<PropertyListings />} />
          <Route path="/property-info" element={<PropertyInfo />} />
          <Route path="/changelog" element={<Changelog />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;