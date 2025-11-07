// API Configuration
// Set this to your backend API URL
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

// Use mock mode or real API
// Defaults to true (mock mode) if not explicitly set to 'false'
export const USE_MOCK_MODE = (import.meta.env.VITE_USE_MOCK_MODE as string) !== 'false';

console.log('API Configuration:', {
  baseUrl: API_BASE_URL,
  mockMode: USE_MOCK_MODE,
  env: import.meta.env.VITE_USE_MOCK_MODE,
});
