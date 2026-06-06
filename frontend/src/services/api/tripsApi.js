import apiClient from '../apiClient';

export const tripsApi = {
  /**
   * Fetch all trips with optional filtering.
   * @param {Object} params - Query parameters { search, category, featured }
   */
  getAllTrips: async (params = {}) => {
    // Clean up undefined parameters
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
    );
    
    // The query string is correctly handled by axios params
    const response = await apiClient.get('/trips', { params: cleanParams });
    return response.data;
  },

  /**
   * Fetch a single trip by ID.
   * @param {string} id - The trip UUID
   */
  getTripById: async (id) => {
    const response = await apiClient.get(`/trips/${id}`);
    return response.data;
  },

  /**
   * Create a new trip (Provider only).
   * @param {Object} tripData - The trip payload
   */
  createTrip: async (tripData) => {
    const response = await apiClient.post('/trips', tripData);
    return response.data;
  },
  
  /**
   * Get signed URL for image upload.
   * @param {string} fileName - the file name to upload
   */
  getUploadUrl: async (fileName) => {
    const response = await apiClient.post('/trips/upload-url', { fileName });
    return response.data;
  }
};
