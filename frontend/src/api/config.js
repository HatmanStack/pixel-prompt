/**
 * API Configuration
 * Loads API endpoint from environment variables
 */

// Load API endpoint from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || '';

// API Routes
export const API_ROUTES = {
  GENERATE: '/generate',
  STATUS: '/status',
  ENHANCE: '/enhance',
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 4000, // 4 seconds
};
