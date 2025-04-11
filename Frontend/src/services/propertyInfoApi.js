import mockData from '../data/mockData.json';

export const getPropertyDataFromFlask = async (query) => {
  try {
    await new Promise((res) => setTimeout(res, 300));

    const result = mockData.find(item =>
      item?.CITY?.toLowerCase().includes(query.toLowerCase()) ||
      item?.ZIP_CODE?.toString().includes(query) ||
      item?.STATE?.toLowerCase().includes(query.toLowerCase()) ||
      item?.address?.toLowerCase().includes(query.toLowerCase())
    );

    return result || null;
  } catch (err) {
    console.error('Error loading property data:', err);
    return null;
  }
};