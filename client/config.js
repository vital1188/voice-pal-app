// Configuration for Voice Pal app

// Server URL - will be overridden by environment variables in production
const SERVER_URL = 
  window.VOICE_PAL_SERVER_URL || // Can be set by Netlify environment variables
  'https://voice-pal-app.onrender.com' || // Default production server
  'http://localhost:3000'; // Fallback for local development

// Export configuration
window.CONFIG = {
  SERVER_URL
};
