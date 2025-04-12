import axios from 'axios';
import { VERSION } from '../version';

const realtyApi = axios.create({
  baseURL: 'https://realty-in-us.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const API_KEY = process.env.REACT_APP_RAPIDAPI_KEY;

export const searchProperties = async (location = 'Manchester, NH', filters = {}) => {
  try {
    await delay(300); // Keep consistent response timing
    const query = location.trim();
    const isZip = /^\d{5}$/.test(query);

    // Build request data based on search type
    const requestData = {
      limit: 20,
      offset: 0,
      status: ['for_sale', 'ready_to_build'],
      sort: {
        direction: 'desc',
        field: 'list_date'
      }
    };

    // Add bedroom filter if specified
    if (filters.beds) {
      requestData.beds = filters.beds;
    }

    // Add bathroom filter if specified
    if (filters.baths) {
      requestData.baths_min = filters.baths.min;
      requestData.baths_max = filters.baths.max;
    }

    // Add location parameters based on search type
    if (isZip) {
      requestData.postal_code = query;
    } else {
      const [city, state_code] = query.split(',').map(part => part.trim());
      if (!city || !state_code) {
        return {
          success: false,
          errorSource: 'Client Validation',
          errorMessage: 'Please provide both city and state (e.g., "Boston, MA")',
          version: VERSION
        };
      }
      requestData.city = city;
      requestData.state_code = state_code;
    }

    console.log('API Request:', requestData);
    const response = await realtyApi.post('/properties/v3/list', requestData);
    console.log('API Response:', response.data);

    if (response.data?.errors) {
      return {
        success: false,
        requestData,
        error: response.data,
        errorSource: 'Realty API',
        errorMessage: response.data.errors[0]?.data?.message || 'API Error',
        version: VERSION
      };
    }

    const results = response.data?.data?.home_search?.results;
    if (!Array.isArray(results)) {
      return {
        success: false,
        requestData,
        error: response.data,
        errorSource: 'Data Processing',
        errorMessage: 'Invalid response format: missing or invalid results array',
        version: VERSION
      };
    }

    const processedResults = results.map(item => ({
      property_id: item?.property_id,
      price: item?.list_price || item?.price,
      beds: item?.description?.beds || item?.beds,
      baths: item?.description?.baths || item?.baths,
      sqft: item?.description?.sqft || item?.sqft,
      photos: item?.photos || [],
      primary_photo: item?.primary_photo?.href || item?.photos?.[0]?.href,
      location: {
        address: {
          line: item?.location?.address?.line || item?.address?.line,
          city: item?.location?.address?.city || item?.address?.city,
          state_code: item?.location?.address?.state_code || item?.address?.state_code,
          postal_code: item?.location?.address?.postal_code || item?.address?.postal_code,
          lat: item?.location?.address?.coordinate?.lat,
          long: item?.location?.address?.coordinate?.lon
        }
      },
      description: item?.description || {},
      raw_data: item // Keep raw data for debugging
    }));

    return {
      success: true,
      requestData,
      responseData: response.data,
      processedData: processedResults,
      version: VERSION
    };
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return {
      success: false,
      requestData: error.config?.data ? JSON.parse(error.config.data) : {},
      error: error.response?.data || error.message,
      errorSource: 'Network/Server',
      errorMessage: error.response?.data?.errors?.[0]?.data?.message || 
                   error.response?.data?.message || 
                   error.message ||
                   'Failed to fetch properties',
      version: VERSION
    };
  }
};

export const getPropertyDetails = async (propertyId) => {
  try {
    const response = await realtyApi.get('/properties/v3/detail', {
      params: { property_id: propertyId }
    });
    
    const data = response.data?.data?.home;
    if (!data) {
      return {
        success: false,
        error: response.data,
        errorMessage: 'Invalid response format: missing home data',
        version: VERSION
      };
    }

    return {
      success: true,
      property: {
        property_id: data?.property_id,
        price: data?.list_price || data?.price,
        beds: data?.description?.beds || data?.beds,
        baths: data?.description?.baths || data?.baths,
        sqft: data?.description?.sqft || data?.sqft,
        photos: data?.photos || [],
        primary_photo: data?.primary_photo?.href || data?.photos?.[0]?.href,
        location: {
          address: {
            line: data?.location?.address?.line || data?.address?.line,
            city: data?.location?.address?.city || data?.address?.city,
            state_code: data?.location?.address?.state_code || data?.address?.state_code,
            postal_code: data?.location?.address?.postal_code || data?.address?.postal_code,
            lat: data?.location?.address?.coordinate?.lat,
            long: data?.location?.address?.coordinate?.lon
          }
        },
        description: data?.description || {},
        raw_data: data
      },
      version: VERSION
    };
  } catch (error) {
    console.error('Error fetching property details:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
      errorMessage: 'Failed to fetch property details',
      version: VERSION
    };
  }
};

// For search suggestions as user types
export const getLocationSuggestions = async (query) => {
  if (!query || query.length < 2) return [];
  
  try {
    console.log('Fetching location suggestions for:', query); // Debug log
    const response = await realtyApi.get('/locations/v2/auto-complete', {
      params: {
        input: query,  // Changed back to 'input' for v2 API
        limit: 5
      }
    });
    console.log('Location suggestions response:', response.data); // Debug log
    
    // v2 response structure: { autocomplete: [...] }
    const suggestions = response.data?.autocomplete || [];
    console.log('Processed suggestions:', suggestions); // Debug log
    return suggestions;
  } catch (error) {
    console.error('Error fetching location suggestions:', error.response?.data || error.message);
    return [];
  }
}; 