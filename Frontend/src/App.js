import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Frame } from './screens/Frame';
import Home from './screens/Home/Home';
import Properties from './screens/Properties/Properties';
import PropertyInfo from './screens/PropertyInfo/PropertyInfo';
import PropertyListings from './screens/propertyListings/PropertyListings';
import Changelog from './components/Changelog/Changelog';
import MLSSearch from './screens/MLSSearch';
import DevToggle from './components/DevToggle/DevToggle';
import { DevProvider } from './components/DevToggle/DevContext';

function App() {
  return (
    <DevProvider>
      <Router>
        <Box>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/zip/:postal_code" element={<Properties />} />
            <Route path="/:state" element={<Properties />} />
            <Route path="/:state/:city" element={<Properties />} />
            <Route path="/:state/:city/:address" element={<PropertyInfo />} />
            <Route path="/property/:id" element={<PropertyInfo />} />
            <Route path="/property-listings" element={<PropertyListings />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/mls" element={<MLSSearch />} />
          </Routes>
          <DevToggle />
        </Box>
      </Router>
    </DevProvider>
  );
}

export default App;