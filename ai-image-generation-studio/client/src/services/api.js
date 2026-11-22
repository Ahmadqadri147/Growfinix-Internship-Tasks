import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized: Invalid API key');
          break;
        case 403:
          console.error('Forbidden: No permission');
          break;
        case 404:
          console.error('Not found');
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    }
    return Promise.reject(error);
  }
);

export const generateImage = async (imageData) => {
  return apiClient.post('/generate', imageData);
};

export const getGallery = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  return apiClient.get(`/gallery?${queryParams.toString()}`);
};

export const getImageById = async (id) => {
  return apiClient.get(`/gallery/${id}`);
};

export const deleteImage = async (id) => {
  return apiClient.delete(`/gallery/${id}`);
};

export const toggleFavorite = async (id) => {
  return apiClient.patch(`/gallery/${id}/favorite`);
};

export const getRecentImages = async (limit = 10) => {
  return apiClient.get('/gallery/recent', { params: { limit } });
};

export const getFavoriteImages = async () => {
  return apiClient.get('/gallery/favorites');
};

export const getHistory = async (limit = 20) => {
  return apiClient.get('/history', { params: { limit } });
};

export const checkHealth = async () => {
  return apiClient.get('/health');
};

export default apiClient;