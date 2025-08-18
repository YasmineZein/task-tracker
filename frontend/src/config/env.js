// Environment configuration helper
// This will read from window.env (injected at runtime) or fall back to Vite's import.meta.env

const getEnvVar = (key, defaultValue = '') => {
  // In production (Docker), use window.env
  if (window.env && window.env[key]) {
    return window.env[key];
  }
  
  // In development, use Vite's environment variables
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  return defaultValue;
};

export const config = {
  apiUrl: getEnvVar('REACT_APP_API_URL', 'http://localhost:3000'),
  appName: getEnvVar('REACT_APP_APP_NAME', 'Task Tracker'),
  environment: getEnvVar('REACT_APP_ENVIRONMENT', 'development'),
};

export default config;
