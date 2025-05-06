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

/*
RealtyInUS API Endpoints Documentation:

1. GET /locations/v2/auto-complete
   - Purpose: Get location suggestions while typing
   - Query params: 
     - q: search query string
   - Response: Array of location objects with properties:
     - postal_code: ZIP code
     - city: City name
     - state_code: State abbreviation
     - line: Street address
     - neighborhood: Neighborhood name

2. POST /properties/v3/list
   - Purpose: List properties with filtering
   - Request body parameters:
     - limit (int): Number of items per response, for paging
     - offset (int): The page index, for paging
     - state_code (string): Filter by state
     - city (string): Filter by city
     - street_name (string): Filter by street
     - address (string): Filter by address
     - postal_code (string): Filter by postal code
     - search_location (object): Filter around a location
       - radius (int): Radius in miles
       - location (string): Address or postal code
     - status (array): Property status ["for_sale", "ready_to_build", "for_rent", "sold", "off_market", "other", "new_community"]
     - type (array): Property type ["apartment", "condo_townhome", "condo_townhome_rowhome_coop", "condop", "condos", "coop", "duplex_triplex", "farm", "land", "mobile", "multi_family", "single_family", "townhomes"]
     - keywords (string): Property features ["basement", "carport", "central_air", etc.]
     - boundary (object): Filter within a GEOJson polygon
     - baths (object): Filter by bathrooms {min: number}
     - beds (object): Filter by bedrooms {min: number, max: number}
     - list_price (object): Filter by price {min: number, max: number}
     - sqft (object): Filter by square footage {min: number, max: number}
     - lot_sqft (object): Filter by lot size {min: number, max: number}
     - year_built (object): Filter by year built {min: number, max: number}
     - hoa_fee (object): Filter by HOA fee {max: number}
     - no_hoa_fee (boolean): Filter for no HOA fee
     - pending (boolean): Filter pending properties
     - contingent (boolean): Filter contingent properties
     - foreclosure (boolean): Filter foreclosure properties
     - has_tour (boolean): Filter properties with tours
     - new_construction (boolean): Filter new construction
     - cats (boolean): Filter cat-friendly properties
     - dogs (boolean): Filter dog-friendly properties
     - matterport (boolean): Filter properties with Matterport tours
     - sort (object): Sort results
       - direction (string): "desc" or "asc"
       - field (string): "photo_count", "last_update_date", "list_date", "list_price", "sold_date", "sold_price", "beds", "lot_sqft"

3. GET /properties/v3/detail
   - Purpose: Get detailed information about a specific property
   - Query params:
     - property_id: Unique property identifier
   - Response: Detailed property information including:
     - Basic info (price, beds, baths)
     - Location details
     - Property features
     - Market data

4. GET /properties/v3/get-photos
   - Purpose: Get property photos
   - Query params:
     - property_id: Unique property identifier
   - Response: Array of photo URLs and metadata
*/

// Format address query for better auto-complete results
const formatAddressQuery = (query) => {
// Check if query contains a number
  const hasNumber = /\d/.test(query);
  if (!hasNumber) return query;

// Split into number and street parts
  const parts = query.split(/\s+/);
  const numberPart = parts.find(part => /^\d+$/.test(part));
  const streetPart = parts.filter(part => !/^\d+$/.test(part)).join(' ');

// If we have both number and street, format as "street number"
  if (numberPart && streetPart) {
    return `${streetPart} ${numberPart}`;
  }

  return query;
};

export const searchProperties = async (params) => {
  const debugSteps = [];
  try {
    debugSteps.push({
      step: 'Initial Parameters',
      data: params
    });

    // Construct the request data
    const requestData = {
      limit: 42,
      offset: 0,
      postal_code: params.postal_code,
      state_code: params.state_code,
      city: params.city,
      // Format list_price according to API spec
      list_price: params.list_price ? {
        min: params.list_price.min,
        max: params.list_price.max
      } : undefined,
      // Include other filters
      beds: params.beds,
      baths: params.baths,
      sqft: params.sqft,
      // Add sorting if specified
      sort: params.sort ? {
        field: 'list_price',
        direction: params.sort
      } : undefined
    };

    debugSteps.push({
      step: 'Constructed Request Data',
      data: requestData
    });

    const response = await rateLimiter.add(() =>
      realtyApi.post('/properties/v3/list', requestData)
    );

    debugSteps.push({
      step: 'Raw API Response',
      data: response.data
    });

    if (response.error) {
      return {
        success: false,
        errorMessage: response.error.message || 'API request failed',
        debugSteps,
        requestData,
        responseData: response.data,
        error: response.error
      };
    }

    const processedData = response.data?.data?.home_search?.results || [];

    // Remove duplicate properties based on property_id
    const uniqueProperties = processedData.reduce((acc, property) => {
      if (!acc.some(p => p.property_id === property.property_id)) {
        acc.push(property);
      }
      return acc;
    }, []);

    // Add debug logging for price filtering
    debugSteps.push({
      step: 'Price Filter Debug',
      data: {
        filterParams: params.list_price,
        samplePrices: uniqueProperties.slice(0, 5).map(p => ({
          property_id: p.property_id,
          price: p.list_price,
          address: p.location?.address?.line
        }))
      }
    });

    // Apply local filtering
    const filteredData = uniqueProperties.filter(property => {
      // Price filter with detailed logging
      if (params.list_price?.min || params.list_price?.max) {
        const price = property.list_price;
        const min = params.list_price.min;
        const max = params.list_price.max;
        
        // Log each property's price check
        debugSteps.push({
          step: 'Price Check',
          data: {
            property_id: property.property_id,
            price: price,
            min: min,
            max: max,
            passes: !(min && price < min) && !(max && price > max)
          }
        });

        if (min && price < min) return false;
        if (max && price > max) return false;
      }

      // Beds filter
      if (params.beds?.min || params.beds?.max) {
        const beds = property.description?.beds;
        if (params.beds.min && beds < params.beds.min) return false;
        if (params.beds.max && beds > params.beds.max) return false;
      }

      // Baths filter
      if (params.baths?.min || params.baths?.max) {
        const baths = property.description?.baths;
        if (params.baths.min && baths < params.baths.min) return false;
        if (params.baths.max && baths > params.baths.max) return false;
      }

      // Square footage filter
      if (params.sqft?.min || params.sqft?.max) {
        const sqft = property.description?.sqft;
        if (params.sqft.min && sqft < params.sqft.min) return false;
        if (params.sqft.max && sqft > params.sqft.max) return false;
      }

      return true;
    });

    // Log final filtered results
    debugSteps.push({
      step: 'Filtered Results',
      data: {
        totalBefore: processedData.length,
        totalAfter: filteredData.length,
        priceRange: {
          min: Math.min(...filteredData.map(p => p.list_price)),
          max: Math.max(...filteredData.map(p => p.list_price))
        }
      }
    });

    debugSteps.push({
      step: 'Processed Data',
      data: {
        count: filteredData.length,
        sample: filteredData.slice(0, 2) // Show first 2 items as sample
      }
    });

    return {
      success: true,
      processedData: filteredData,
      debugSteps,
      requestData,
      responseData: response.data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in searchProperties:', error);
    return {
      success: false,
      errorMessage: error.message || 'Failed to fetch properties',
      debugSteps,
      requestData: params,
      error
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

export const getLocationSuggestions = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    const formattedQuery = formatAddressQuery(query);
    const response = await rateLimiter.add(() => 
      realtyApi.get('/locations/v2/auto-complete', {
        params: { input: formattedQuery }
      })
    );

    if (response.error) {
      throw response.error;
    }

    const suggestions = response.data?.autocomplete || [];

// Add unique IDs to suggestions to prevent React key warnings
    const processedSuggestions = suggestions.map((suggestion, index) => ({
      ...suggestion,
      id: `${suggestion.postal_code || suggestion.line || suggestion.city || suggestion.state_code}-${index}`
    }));

    return processedSuggestions
      .filter(suggestion => {
// Remove duplicate ZIP codes
        if (suggestion.postal_code) {
          return processedSuggestions.findIndex(s => s.postal_code === suggestion.postal_code) === processedSuggestions.indexOf(suggestion);
        }
        return true;
      })
      .sort((a, b) => {
// Prioritize addresses when query contains numbers
        if (/\d/.test(query)) {
          const aHasAddress = Boolean(a.line);
          const bHasAddress = Boolean(b.line);
          if (aHasAddress !== bHasAddress) return bHasAddress - aHasAddress;
        }
        return 0;
      });

  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
};


