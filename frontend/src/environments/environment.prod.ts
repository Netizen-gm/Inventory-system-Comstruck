// Environment variables in Angular are injected at build time
// For Vercel: Set NG_APP_API_URL in environment variables
// The build process will replace this during compilation

export const environment = {
  production: true,
  // Set NG_APP_API_URL in Vercel environment variables
  // Format: https://your-backend.railway.app/api
  apiUrl: 'https://your-backend-url.railway.app/api',
};
