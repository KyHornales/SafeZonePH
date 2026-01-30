// API Configuration Helper
// Automatically detects environment and returns correct API base URL

export const getApiBaseUrl = (): string => {
  // 1. If REACT_APP_API_URL is explicitly set, use it (manual override)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 2. In production (Vercel), use relative URLs (same domain)
  if (process.env.NODE_ENV === 'production') {
    return '';  // Relative URLs - API calls will be /api/... 
  }
  
  // 3. In development, use local backend server
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// Usage:
// Local dev: http://127.0.0.1:8000/api/auth/login
// Production: /api/auth/login (served from same Vercel domain)
