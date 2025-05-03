import Papa from 'papaparse';

// Constants for data mapping
const MLS_TO_COMMON_FORMAT = {
  property_id: 'LIST_NO',
  list_price: 'LIST_PRICE',
  location: {
    address: {
      line: 'ADDRESS',
      city: 'TOWN',
      state_code: 'STATE',
      postal_code: 'ZIP_CODE'
    }
  },
  description: 'REMARKS',
  beds: 'NO_BEDROOMS',
  baths: 'TOTAL_BATHS',
  building_size: {
    size: 'SQUARE_FEET',
    units: 'SQUARE FEET'
  },
  property_type: 'STYLE_SF',
  year_built: 'YEAR_BUILT'
};

let cachedMLSData = null;
let isLoading = false;
let lastError = null;

// Constants
const SEARCH_RADIUS_MILES = 25;

// Helper function to calculate distance between two points
const calculateDistance = (point1, point2) => {
  const R = 3963; // Earth's radius in miles
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const lon1 = point1.lng * Math.PI / 180;
  const lon2 = point2.lng * Math.PI / 180;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper function to check if a point is within radius of another point
const isWithinRadius = (center, point, radiusMiles) => {
  return calculateDistance(center, point) <= radiusMiles;
};

// Helper function to get location coordinates from query
const getLocationFromQuery = async (query) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

// Function to load and cache MLS data
export const loadMLSData = async () => {
  if (cachedMLSData) return cachedMLSData;
  if (isLoading) {
    // Wait for the current loading to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (lastError) throw lastError;
    return cachedMLSData;
  }

  isLoading = true;
  lastError = null;

  try {
    // Updated path to use filename without spaces
    const response = await fetch('/data/sold_data.csv');
    if (!response.ok) {
      throw new Error(`Failed to load MLS data: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    // Log the first few lines of the CSV to debug
    console.log('First few lines of CSV:', csvText.split('\n').slice(0, 3));
    
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: ',',  // Explicitly set comma as delimiter
      transformHeader: header => header.trim(),
      error: (error) => {
        console.error('Papa Parse error:', error);
      },
      complete: (results) => {
        console.log('Papa Parse complete. Fields found:', results.meta.fields);
      }
    });

    if (results.errors && results.errors.length > 0) {
      console.warn('CSV parsing warnings:', results.errors);
    }

    // Log the first entry with its fields
    if (results.data && results.data.length > 0) {
      console.log('First entry fields:', Object.keys(results.data[0]));
      console.log('First entry data:', results.data[0]);
    }

    cachedMLSData = results.data;
    return cachedMLSData;
  } catch (error) {
    lastError = error;
    console.error('Error loading MLS data:', error);
    throw new Error('Failed to load MLS data: ' + error.message);
  } finally {
    isLoading = false;
  }
};

// Convert MLS data to common format
const convertToCommonFormat = (mlsProperty) => {
  if (!mlsProperty) return null;

  const formatted = {
    property_id: mlsProperty.LIST_NO?.toString(),
    list_price: mlsProperty.LIST_PRICE,
    location: {
      address: {
        line: mlsProperty.ADDRESS,
        city: mlsProperty.TOWN,
        state_code: mlsProperty.STATE,
        postal_code: mlsProperty.ZIP_CODE?.toString()
      }
    },
    description: mlsProperty.REMARKS,
    property_type: mlsProperty.STYLE_SF || 'Unknown',
    year_built: mlsProperty.YEAR_BUILT,
    beds: mlsProperty.NO_BEDROOMS,
    baths: mlsProperty.TOTAL_BATHS,
    building_size: {
      size: mlsProperty.SQUARE_FEET,
      units: 'SQUARE FEET'
    },
    lot_size: {
      size: mlsProperty.ACRE,
      units: 'acres'
    },
    raw_data: mlsProperty
  };

  return formatted;
};

// Filter properties based on search criteria
const filterProperties = (properties, filters) => {
  if (!properties || !Array.isArray(properties)) return [];
  
  return properties.filter(property => {
    // Location filters
    if (filters.state_code && 
        property.STATE?.toLowerCase() !== filters.state_code.toLowerCase()) {
      return false;
    }
    
    if (filters.city && 
        property.TOWN?.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    
    if (filters.postal_code && 
        property.ZIP_CODE?.toString() !== filters.postal_code) {
      return false;
    }

    if (filters.address && 
        !property.ADDRESS?.toLowerCase().includes(filters.address.toLowerCase())) {
      return false;
    }

    // Price filter
    if (filters.list_price) {
      const price = property.LIST_PRICE;
      if (filters.list_price.min && price < filters.list_price.min) return false;
      if (filters.list_price.max && price > filters.list_price.max) return false;
    }

    // Beds filter
    if (filters.beds) {
      const beds = property.NO_BEDROOMS;
      if (filters.beds.min && beds < filters.beds.min) return false;
      if (filters.beds.max && beds > filters.beds.max) return false;
    }

    // Baths filter
    if (filters.baths) {
      const baths = property.TOTAL_BATHS;
      if (filters.baths.min && baths < filters.baths.min) return false;
      if (filters.baths.max && baths > filters.baths.max) return false;
    }

    // Square footage filter
    if (filters.sqft) {
      const sqft = property.SQUARE_FEET;
      if (filters.sqft.min && sqft < filters.sqft.min) return false;
      if (filters.sqft.max && sqft > filters.sqft.max) return false;
    }

    return true;
  });
};

// Main search function
export const searchMLSProperties = async (query, options = {}) => {
  try {
    const mlsData = await loadMLSData();
    const { directSearch = false } = options;
    
    if (directSearch) {
      // Perform direct search without location matching
      const searchTerms = query.toLowerCase().split(' ');
      console.log('Searching for terms:', searchTerms);
      
      const results = mlsData.filter(property => {
        // Create a searchable string from the property's address components
        const propertyText = [
          property.ADDRESS,
          property.TOWN,
          property.STATE,
          property.ZIP_CODE
        ].filter(Boolean).join(' ').toLowerCase();
        
        console.log('Checking property:', propertyText);
        
        // For exact address matches, check if the property address starts with the search query
        if (property.ADDRESS?.toLowerCase().startsWith(query.toLowerCase())) {
          console.log('Found exact address match:', property.ADDRESS);
          return true;
        }
        
        // For partial matches, check if all search terms are present
        return searchTerms.every(term => propertyText.includes(term));
      });
      
      console.log('Found results:', results.length);
      return results.map(convertToCommonFormat).filter(Boolean);
    }

    // Regular search with location matching
    const location = await getLocationFromQuery(query);
    if (!location) {
      return [];
    }

    const results = mlsData.filter(property => {
      if (!property.LATITUDE || !property.LONGITUDE) return false;
      
      const propertyLocation = {
        lat: parseFloat(property.LATITUDE),
        lng: parseFloat(property.LONGITUDE)
      };

      return isWithinRadius(location, propertyLocation, SEARCH_RADIUS_MILES);
    });

    return results.map(convertToCommonFormat).filter(Boolean);
  } catch (error) {
    console.error('Error searching MLS properties:', error);
    throw error;
  }
};

// Function to get location suggestions from MLS data
export const getMLSLocationSuggestions = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    const mlsData = await loadMLSData();
    const lowerQuery = query.toLowerCase();
    const matches = new Set();
    const suggestions = [];

    // Helper function to add a suggestion if it's unique
    const addSuggestion = (suggestion) => {
      const key = suggestion.line 
        ? `${suggestion.line}, ${suggestion.city}, ${suggestion.state_code}`
        : suggestion.city 
          ? `${suggestion.city}, ${suggestion.state_code}`
          : suggestion.postal_code;
      
      if (!matches.has(key)) {
        matches.add(key);
        suggestions.push(suggestion);
      }
    };

    // Helper function to check if a string matches the query
    const isMatch = (str) => {
      if (!str) return false;
      const lowerStr = str.toLowerCase();
      return lowerStr.includes(lowerQuery) || 
             lowerStr.split(' ').some(word => word.startsWith(lowerQuery));
    };

    mlsData.forEach(property => {
      // Check address match
      if (isMatch(property.ADDRESS)) {
        addSuggestion({
          id: `address-${property.LIST_NO}`,
          line: property.ADDRESS,
          city: property.TOWN,
          state_code: property.STATE,
          postal_code: property.ZIP_CODE?.toString(),
          type: 'address'
        });
      }

      // Check city match
      if (isMatch(property.TOWN)) {
        addSuggestion({
          id: `city-${property.TOWN}-${property.STATE}`,
          city: property.TOWN,
          state_code: property.STATE,
          type: 'city'
        });
      }

      // Check ZIP code match
      if (property.ZIP_CODE?.toString().includes(query)) {
        addSuggestion({
          id: `zip-${property.ZIP_CODE}`,
          postal_code: property.ZIP_CODE?.toString(),
          city: property.TOWN,
          state_code: property.STATE,
          type: 'postal_code'
        });
      }
    });

    // Sort suggestions to prioritize exact matches and most relevant results
    return suggestions
      .sort((a, b) => {
        const aValue = a.line || a.city || a.postal_code;
        const bValue = b.line || b.city || b.postal_code;
        
        // Prioritize exact matches
        const aStartsWith = aValue.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = bValue.toLowerCase().startsWith(lowerQuery);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // Then prioritize by type (address > city > postal_code)
        const typeOrder = { address: 0, city: 1, postal_code: 2 };
        if (a.type !== b.type) {
          return typeOrder[a.type] - typeOrder[b.type];
        }

        return 0;
      })
      .slice(0, 10); // Limit to 10 suggestions

  } catch (error) {
    console.error('Error getting MLS location suggestions:', error);
    return [];
  }
};

// Function to get price prediction for a property
export const getPricePrediction = async (propertyData) => {
  try {
    const endpoint = '/api/predict';
    console.log('[getPricePrediction] POST', endpoint, 'Payload:', propertyData);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData)
    });

    const responseClone = response.clone();
    let responseBody;
    try {
      responseBody = await responseClone.text();
    } catch (e) {
      responseBody = '[unreadable]';
    }
    console.log('[getPricePrediction] Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(response.headers.entries()),
      body: responseBody
    });

    if (!response.ok) {
      throw new Error(`Failed to get prediction: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.prediction;
  } catch (error) {
    console.error('Error getting price prediction:', error);
    return null;
  }
}; 