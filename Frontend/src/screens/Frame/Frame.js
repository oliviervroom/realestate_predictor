import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import RangeSlider from '../../components/RangeSlider';
import PropertyCard from '../../components/PropertyCard';
import {
  locationOptions,
  seasonOptions,
  monthOptions,
  bedroomOptions,
  numberOfBedroomsOptions,
  propertySizeOptions
} from '../../constants/filterOptions';

const data = require('../../data/data.json')

const prepareObjects = (obj) =>{
  let arr = []
  obj?.data?.home_search?.results?.forEach((each)=>{
    arr.push({id: each?.property_id ?? '',
    price: each?.list_price ?? 0,
    beds: each?.description?.beds ?? 0,
    baths: each?.description?.baths ?? 0,
    sqft: each?.description?.sqft ?? '',
    address: each?.location?.address?.line ?? '',
    image: each?.primary_photo?.href ?? '',
    location:each?.location ?? {},
    comingSoon: true,})
  })
  return arr
}

function Frame() {
  const [originalData,setOriginalData] = useState([]) 
  const [modifiedData,setModifiedData] = useState([]) 
  const [location, setLocation] = useState('');
  const [season, setSeason] = useState('');
  const [month, setMonth] = useState('');
  const [bedroom, setBedroom] = useState('studio');
  const [numberOfBedrooms, setNumberOfBedrooms] = useState('');
  const [propertySize, setPropertySize] = useState('small');
  const [sqft, setSqft] = useState(2000);

  useEffect(()=>{
    //if api call exists you can write it here and pass the result as data to that function
    const objects = prepareObjects(data)
    setOriginalData(objects)
    setModifiedData(objects) // so that every filter will happen on this
  },[data])

  const formatSqft = (value) => {
    return `${value.toLocaleString()} sqft`;
  };


  const performSearch = (str) => {
    const modified = str.toLowerCase();
    const result = originalData.filter((each) => {
      const address = each?.location?.address || {};
      return (
      address?.line?.toLowerCase().includes(modified) ||
      address?.street_name?.toLowerCase().includes(modified) ||
      address?.city?.toLowerCase().includes(modified) ||
      address?.state?.toLowerCase().includes(modified) ||       // Matches "California"
      address?.state_code?.toLowerCase().includes(modified) ||  // Matches "CA"
      address?.postal_code?.toLowerCase().includes(modified)
      );
    });
  
    console.log("mactching property", result)
  
    return result || null;
  };

  return (
    <Box sx={{ bgcolor: '#faf9f8', minHeight: '100vh' }}>
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
              <SearchBar performSearch={performSearch}/>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                <FilterDropdown
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  options={locationOptions}
                />
                <FilterDropdown
                  label="Season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  options={seasonOptions}
                />
                <FilterDropdown
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  options={monthOptions}
                />
                <FilterDropdown
                  label="Bedroom Category"
                  value={bedroom}
                  onChange={(e) => setBedroom(e.target.value)}
                  options={bedroomOptions}
                />
                <FilterDropdown
                  label="Number of Bedrooms"
                  value={numberOfBedrooms}
                  onChange={(e) => setNumberOfBedrooms(e.target.value)}
                  options={numberOfBedroomsOptions}
                />
                <FilterDropdown
                  label="Property Size Category"
                  value={propertySize}
                  onChange={(e) => setPropertySize(e.target.value)}
                  options={propertySizeOptions}
                />
                <RangeSlider
                  value={sqft}
                  onChange={(e, newValue) => setSqft(newValue)}
                  min={500}
                  max={4000}
                  step={100}
                  formatLabel={formatSqft}
                  label="Square Feet"
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Popular in Manchester
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The most viewed and favorited homes in the past day.
          </Typography>
        </Box>

        <Grid container spacing={3}>
  {modifiedData.slice(0, 4).map((property) => (
    <Grid item xs={12} sm={6} md={4} key={property.id}>
      <PropertyCard property={property} />
    </Grid>
  ))}
</Grid>

{modifiedData.length > 4 && (
  <Box sx={{ textAlign: 'center', mt: 3 }}>
    <Typography variant="body2" sx={{ mb: 1 }}>
      Showing top 4 results only
    </Typography>
    <Box
      onClick={() =>
        window.location.href = '/property-listings' // Or use navigate if available here
      }
      sx={{
        display: 'inline-block',
        cursor: 'pointer',
        color: '#c82021',
        border: '1px solid #c82021',
        borderRadius: '4px',
        px: 3,
        py: 1,
        fontWeight: 500,
        '&:hover': { bgcolor: '#c82021', color: '#fff' },
      }}
    >
      See All Properties
    </Box>
  </Box>
)}
      </Container>
    </Box>
  );
}

export default Frame;