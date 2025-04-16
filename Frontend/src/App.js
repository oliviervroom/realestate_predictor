import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Frame } from './screens/Frame';
import Home from './screens/Home/Home';
import Properties from './screens/Properties/Properties';
import PropertyDetails from './screens/PropertyDetails/PropertyDetails';
import PropertyListings from './screens/propertyListings/PropertyListings';
import Changelog from './components/Changelog/Changelog';

function App() {
  return (
    <Router>
      <Box>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/zip/:postal_code" element={<Properties />} />
          <Route path="/:state" element={<Properties />} />
          <Route path="/:state/:city" element={<Properties />} />
          <Route path="/:state/:city/:address" element={<PropertyDetails />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/property-listings" element={<PropertyListings />} />
          <Route path="/changelog" element={<Changelog />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;