import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api');

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
    
    // Add auth token if available
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    
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

    // Handle network errors - don't show toast for expected fallbacks
    if (!error.response) {
      // Only show network error for non-news API calls
      if (!originalRequest.url.includes('/news/')) {
        toast.error('Network error. Please check your connection.');
      }
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
        // Don't show server error toast for news API calls (they have fallbacks)
        if (!originalRequest.url.includes('/news/')) {
          toast.error('Server error. Please try again later.');
        }
        break;

      default:
        // Don't show generic error toast for news API calls
        if (!originalRequest.url.includes('/news/')) {
          const message = error.response?.data?.message || 'An error occurred';
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

export default api;