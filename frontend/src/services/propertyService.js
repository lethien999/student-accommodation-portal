/**
 * Property Service
 * 
 * Frontend service for multi-property management API.
 * 
 * @module services/propertyService
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Get auth token from localStorage
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

/**
 * Get all properties for current landlord
 */
const getMyProperties = async () => {
    const response = await axios.get(`${API_URL}/properties`, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Get single property by ID
 */
const getPropertyById = async (id) => {
    const response = await axios.get(`${API_URL}/properties/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Create new property
 */
const createProperty = async (propertyData) => {
    const response = await axios.post(`${API_URL}/properties`, propertyData, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Update property
 */
const updateProperty = async (id, propertyData) => {
    const response = await axios.put(`${API_URL}/properties/${id}`, propertyData, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Delete property
 */
const deleteProperty = async (id) => {
    const response = await axios.delete(`${API_URL}/properties/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Get property statistics overview
 */
const getPropertyStats = async () => {
    const response = await axios.get(`${API_URL}/properties/stats/overview`, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Assign accommodation to property
 */
const assignAccommodation = async (propertyId, accommodationId) => {
    const response = await axios.post(
        `${API_URL}/properties/${propertyId}/accommodations/${accommodationId}`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Remove accommodation from property
 */
const removeAccommodation = async (propertyId, accommodationId) => {
    const response = await axios.delete(
        `${API_URL}/properties/${propertyId}/accommodations/${accommodationId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

const propertyService = {
    getMyProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertyStats,
    assignAccommodation,
    removeAccommodation
};

export default propertyService;
