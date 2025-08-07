const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Hàm tìm kiếm địa điểm
export const searchLocation = async (query) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'vi,en',
          'User-Agent': 'StudentAccommodationPortal/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    const data = await response.json();
    return data.map(item => ({
      id: item.place_id,
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
};

// Hàm lấy thông tin chi tiết địa điểm
export const getLocationDetails = async (placeId) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/lookup?format=json&place_id=${placeId}`,
      {
        headers: {
          'Accept-Language': 'vi,en',
          'User-Agent': 'StudentAccommodationPortal/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location details');
    }

    const data = await response.json();
    return {
      id: data.place_id,
      name: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      type: data.type,
      address: data.address,
      importance: data.importance
    };
  } catch (error) {
    console.error('Error getting location details:', error);
    throw error;
  }
};

// Hàm chuyển đổi tọa độ thành địa chỉ
export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'Accept-Language': 'vi,en',
          'User-Agent': 'StudentAccommodationPortal/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reverse geocode');
    }

    const data = await response.json();
    return {
      id: data.place_id,
      name: data.display_name,
      address: data.address,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon)
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
}; 