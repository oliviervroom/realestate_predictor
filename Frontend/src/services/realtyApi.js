import axios from 'axios';
import { VERSION } from '../version';

// Rate limiter class
class RateLimiter {
  constructor(requestsPerSecond) {
    this.requestsPerSecond = requestsPerSecond;
    this.queue = [];
    this.processing = false;
  }

  async add(request) {
    return new Promise((resolve) => {
      this.queue.push({ request, resolve });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { request, resolve } = this.queue.shift();
    
    try {
      const result = await request();
      resolve(result);
    } catch (error) {
      resolve({ error });
    }
    
    // Wait for the rate limit period
    await new Promise(resolve => setTimeout(resolve, 1000 / this.requestsPerSecond));
    
    this.processing = false;
    this.processQueue();
  }
}

// Create rate limiter instance (5 requests per second)
const rateLimiter = new RateLimiter(5);

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

    // Collect debug information
    const debugSteps = [];
    debugSteps.push({ step: 'Initial Filters', data: filters });

    // Add bedroom filter if specified
    if (filters.beds) {
      requestData.beds = {
        min: filters.beds.min
      };
      if (filters.beds.max) {
        requestData.beds.max = filters.beds.max;
      }
      debugSteps.push({ step: 'Beds Filter Added', data: requestData.beds });
    }

    // Add bathroom filter if specified
    if (filters.baths) {
      requestData.baths = {
        min: filters.baths.min
      };
      if (filters.baths.max) {
        requestData.baths.max = filters.baths.max;
      }
      debugSteps.push({ step: 'Baths Filter Added', data: requestData.baths });
    }

    // Add price filter if specified
    if (filters.price) {
      requestData.list_price = {};
      if (filters.price.min) {
        requestData.list_price.min = filters.price.min;
      }
      if (filters.price.max) {
        requestData.list_price.max = filters.price.max;
      }
      debugSteps.push({ step: 'Price Filter Added', data: requestData.list_price });
    }

    // Add square footage filter if specified
    if (filters.sqft) {
      requestData.sqft = {};
      if (filters.sqft.min) {
        requestData.sqft.min = filters.sqft.min;
      }
      if (filters.sqft.max && filters.sqft.max < 4000) {
        requestData.sqft.max = filters.sqft.max;
      }
      debugSteps.push({ step: 'Square Footage Filter Added', data: requestData.sqft });
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
          version: VERSION,
          debugSteps
        };
      }
      requestData.city = city;
      requestData.state_code = state_code;
    }

    console.log('Final API Request:', requestData);

    // Use rate limiter for the API call
    const response = await rateLimiter.add(() => realtyApi.post('/properties/v3/list', requestData));
    
    if (response.error) {
      throw response.error;
    }

    console.log('API Response:', response.data);

    if (response.data?.errors) {
      return {
        success: false,
        requestData,
        error: response.data,
        errorSource: 'Realty API',
        errorMessage: response.data.errors[0]?.data?.message || 'API Error',
        version: VERSION,
        debugSteps
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
        version: VERSION,
        debugSteps
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

    // Add client-side price filtering as a safety measure
    const filteredResults = processedResults.filter(item => {
      const price = item.price;
      if (!price) return true; // Keep items without price info
      
      if (filters.price?.min && price < filters.price.min) return false;
      if (filters.price?.max && price > filters.price.max) return false;
      
      return true;
    });

    return {
      success: true,
      requestData,
      responseData: response.data,
      processedData: filteredResults,
      version: VERSION,
      debugSteps
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      errorSource: 'Network',
      errorMessage: error.message || 'Failed to fetch properties',
      version: VERSION,
      debugSteps: []
    };
  }
};

export const getPropertyDetails = async (propertyId) => {
  try {
    const response = await rateLimiter.add(() => 
      realtyApi.get('/properties/v3/detail', {
        params: { property_id: propertyId }
      })
    );
    
    if (response.error) {
      throw response.error;
    }

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
    console.error('Error fetching property details:', error);
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
    const response = await rateLimiter.add(() => 
      realtyApi.get('/locations/v2/auto-complete', {
        params: {
          input: query,
          limit: 5
        }
      })
    );
    
    if (response.error) {
      throw response.error;
    }

    // v2 response structure is different from v3
    return response.data?.autocomplete || [];
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
}; 