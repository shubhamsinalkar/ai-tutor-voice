// src/services/api.js (UPDATED FOR YOUR BACKEND)
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE ||            // production URL (Render)
  (import.meta.env.DEV && "http://localhost:5000");  // only used while running `npm run dev`
console.log("Vercel Env →", import.meta.env.VITE_API_BASE);

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Voice API
// Voice API
export const voiceAPI = {
  downloadVoice: (filename) => {
    if (!filename) return null;
    const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    return `${baseUrl}/voice/download/${filename}`;
  },
  getVoices: () => api.get('/voice/voices'),
  healthCheck: () => api.get('/voice/health'),
  testConnection: () => api.get('/voice/test-connection'),
};

export default api;
