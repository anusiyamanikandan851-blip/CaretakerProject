import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://10.1.50.170:5000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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
      const response = await api.post('/auth/register', data);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default api;