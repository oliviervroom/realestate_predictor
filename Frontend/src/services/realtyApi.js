import axios from 'axios';

const realtyApi = axios.create({
  baseURL: 'https://realty-in-us.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com'
  }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const searchProperties = async (query) => {
  try {
    await delay(300);
    const isZip = /^\d{5}$/.test(query.trim());

    const payload = {
      limit: 20,
      offset: 0,
      sort: 'newest',
      ...(isZip
        ? { postal_code: query.trim() }
        : { city: query.trim() })
    };

    const response = await realtyApi.post('/properties/v3/list', payload);

    const results = response?.data?.data?.home_search?.results || [];

    return results.map((item) => ({
      property_id: item?.property_id,
      price: item?.list_price,
      beds: item?.description?.beds,
      baths: item?.description?.baths,
      sqft: item?.description?.sqft,
      photos: item?.primary_photo?.href,
      location: item?.location,
      description: item?.description,
      rental_estimate: item?.rental_estimate,
      estimate: item?.estimate?.estimate
    }));
  } catch (error) {
    console.error('Error searching properties:', error.response?.data || error.message);
    return [];
  }
};

export const getPropertyDetails = async (propertyId) => {
  try {
    const response = await realtyApi.get('/properties/v2/detail', {
      params: { property_id: propertyId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    return null;
  }
}; 