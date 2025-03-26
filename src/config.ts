const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export const API_BASE_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl; 