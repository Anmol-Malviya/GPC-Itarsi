import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import 'react-toastify/dist/ReactToastify.css'
import './styles/toast.css' // Import custom toast styles
import './styles/custom-toast.css' // Import custom toast animations
import './styles/notice.css' // Import notice styles for links
import './styles/quill-editor.css' // Import custom Quill editor styles
import './index.css'
import App from './App.jsx'
import axios from 'axios'
import config from './config'
import CustomToastContainer from './components/CustomToastContainer'

// Handle redirects from 404.html
const handleRedirect = () => {
  const query = new URLSearchParams(window.location.search);
  const redirectPath = query.get('redirect');

  if (redirectPath) {
    // Remove the query parameter
    window.history.replaceState(null, null, redirectPath);
  }
}

// Execute redirect handling
handleRedirect();

// Set default axios base URL and headers
axios.defaults.baseURL = config.apiUrl;
console.log('Setting axios baseURL to:', config.apiUrl);

// Set default authorization header if token exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('main.jsx: Setting default Authorization header with token:', token.substring(0, 10) + '...');
} else {
  console.log('No token found in localStorage');
}

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    const requestId = Math.random().toString(36).substring(2, 8);
    config.requestId = requestId;

    console.log(`[${requestId}] 🚀 Request: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);

    // Log authorization header (partially masked)
    if (config.headers && config.headers.Authorization) {
      const authHeader = config.headers.Authorization;
      const maskedAuth = authHeader.substring(0, 15) + '...' + authHeader.substring(authHeader.length - 5);
      console.log(`[${requestId}] 🔑 Auth: ${maskedAuth}`);
    } else {
      console.log(`[${requestId}] ⚠️ No Authorization header`);
    }

    // Log request data if present (but not for login to avoid logging passwords)
    if (config.data && !config.url.includes('login')) {
      console.log(`[${requestId}] 📦 Request data:`, config.data);
    }

    // Add timestamp to track request duration
    config.timestamp = new Date().getTime();
    return config;
  },
  error => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    const requestId = response.config.requestId || 'unknown';
    const duration = response.config.timestamp ? new Date().getTime() - response.config.timestamp : 'unknown';

    console.log(`[${requestId}] ✅ Response: ${response.status} from ${response.config.url} (${duration}ms)`);

    // Log response data summary (not the full data to avoid cluttering the console)
    if (response.data) {
      if (typeof response.data === 'object') {
        const keys = Object.keys(response.data);
        console.log(`[${requestId}] 📄 Response contains keys: ${keys.join(', ')}`);
      } else {
        console.log(`[${requestId}] 📄 Response type: ${typeof response.data}`);
      }
    }

    return response;
  },
  error => {
    const requestId = error.config?.requestId || 'unknown';
    const duration = error.config?.timestamp ? new Date().getTime() - error.config.timestamp : 'unknown';

    console.error(`[${requestId}] ❌ Error: ${error.message} (${duration}ms)`);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[${requestId}] 🔴 Status: ${error.response.status}`);
      console.error(`[${requestId}] 🔴 Data:`, error.response.data);
      console.error(`[${requestId}] 🔴 Headers:`, error.response.headers);

      // Special handling for authentication errors
      if (error.response.status === 401 || error.response.status === 403) {
        console.error(`[${requestId}] 🔐 Authentication error detected`);
        // We don't automatically redirect here to avoid loops
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[${requestId}] 🟠 No response received:`, error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`[${requestId}] 🟡 Request setup error:`, error.message);
    }

    return Promise.reject(error);
  }
);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
      <CustomToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ClerkProvider>
  </StrictMode>
)
