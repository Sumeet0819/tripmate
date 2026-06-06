import apiClient from '../apiClient';

export const authApi = {
  syncGoogleProfile: async () => {
    // The request interceptor attaches the Supabase JWT.
    // The backend uses it to sync and return the user profile + custom JWT
    const response = await apiClient.post('/auth/sync');
    return response.data;
  },
  
  requestOtp: async (email) => {
    const response = await apiClient.post('/auth/otp/request', { email });
    return response.data;
  },
  
  verifyOtp: async (email, code) => {
    const response = await apiClient.post('/auth/otp/verify', { email, code });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  promoteToProvider: async () => {
    const response = await apiClient.post('/auth/promote');
    return response.data;
  }
};
