// src/services/api.js
import axios from 'axios';

// Set origin without /api suffix
const ORIGIN = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE
  : import.meta.env.VITE_API_URL;

// Mistake i was doing              
//const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
/* the above code will work in production as in prod as it "OR operator" it will (API_BASE)
   true and BE req will go to render but in locally as api base is true(because it is present) so the req 
   was going the render and not on my BE localhost which was mismatch of BE request   */

   const API_BASE_URL = `${ORIGIN}/api`;

console.log('🌍 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Chat API
export const chatAPI = {
  askQuestion: (data) => api.post('/chat/ask', data),
  generateQuiz: (data) => api.post('/chat/quiz', data),
  getHistory: (params) => api.get('/chat/history', { params }),
};

// Upload API
export const uploadAPI = {
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyFiles: () => api.get('/upload/my-files'),
  deleteFile: (fileId) => api.delete(`/upload/${fileId}`),
};

// Voice API - Fixed to not add double /api
export const voiceAPI = {
  downloadVoice: (filename) => {
    if (!filename) return null;
    return `${API_BASE_URL}/voice/download/${filename}`;
  },
  getVoices: () => api.get('/voice/voices'),
  healthCheck: () => api.get('/voice/health'),
  testConnection: () => api.get('/voice/test-connection'),
};

export default api;
