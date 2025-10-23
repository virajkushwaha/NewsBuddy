import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Handle different error status codes
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh token
            const authStore = await import('../store/authStore');
            const success = await authStore.useAuthStore.getState().refreshToken();
            
            if (success) {
              // Retry original request
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          
          // Redirect to login
          const authStore = await import('../store/authStore');
          authStore.useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        break;

      case 403:
        toast.error('Access denied. You don\'t have permission.');
        break;

      case 404:
        if (!originalRequest.url.includes('/auth/me')) {
          toast.error('Resource not found.');
        }
        break;

      case 429:
        toast.error('Too many requests. Please slow down.');
        break;

      case 500:
        toast.error('Server error. Please try again later.');
        break;

      default:
        const message = error.response?.data?.message || 'An error occurred';
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;