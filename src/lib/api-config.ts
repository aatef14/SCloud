// API Configuration
// Set this to your backend API URL
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Use mock mode or real API
export const USE_MOCK_MODE = (import.meta as any).env?.VITE_USE_MOCK_MODE === 'true' || false;

console.log('API Configuration:', {
  baseUrl: API_BASE_URL,
  mockMode: USE_MOCK_MODE,
});
