// Dynamic API URL configuration:
// 1. Uses VITE_API_URL environment variable if set (configured in Vercel / .env)
// 2. In browser environments where VITE_API_URL is missing and host is not localhost, warns in console
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn(
      '[API Config Warning] VITE_API_URL no está definida en las variables de entorno de Vercel. ' +
      'Por favor configura VITE_API_URL en Vercel apuntando a tu backend en Render (ej: https://tu-backend.onrender.com/api).'
    );
  }

  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
