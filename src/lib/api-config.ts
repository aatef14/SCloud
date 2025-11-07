// API Configuration
// Set this to your backend API URL
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

// ALWAYS use real API - no mock mode
export const USE_MOCK_MODE = false;

console.log('🚀 SCloud API Configuration:', {
  baseUrl: API_BASE_URL,
  mode: 'PRODUCTION (Real AWS Backend)',
});
