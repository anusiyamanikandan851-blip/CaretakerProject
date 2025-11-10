import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../utils/constants';

// Create a shared axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Automatically attach token if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('⚠️ Token read error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// AUTH API ENDPOINTS
export const authAPI = {
  login: async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  adminLogin: async (data) => {
    try {
      const response = await api.post('/auth/admin-login', data);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  register: async (data) => {
    try {
      // Debug log for payload
      console.log('🔄 Registration payload:', {
        name: data.name,
        email: data.email,
        password: '[HIDDEN]',
        phone: data.phone,
        address: data.address,
        role: 'user'
      });

      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone.trim(),
        address: { city: data.address.city.trim() },
        role: 'user'
      };

      const response = await api.post('/auth/register', payload);

      // Debug log for response
      console.log('📦 Registration API response:', response);

      // Check for success and user object
      if ((response.status === 201 || response.status === 200) && response.data?.success) {
        if (response.data.user?._id) {
          console.log('✅ User saved in MongoDB:', response.data.user._id);
        } else {
          console.warn('⚠️ Success but no user ID returned:', response.data);
        }
        return { success: true, data: response.data };
      } else {
        console.error('❌ Registration failed:', response.data);
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      // Log full error object for backend debugging
      console.error('❌ Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  }
};

export default api;
