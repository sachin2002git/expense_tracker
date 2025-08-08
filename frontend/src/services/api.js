import axios from 'axios';

// Create an Axios instance with a base URL to your backend
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Or your production URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// This request interceptor automatically adds the token to every request
api.interceptors.request.use(
    (config) => {
        try {
            // 1. Get the user object from localStorage
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                // 2. Parse the object and get the token
                const user = JSON.parse(storedUser);
                if (user && user.token) {
                    // 3. Set the Authorization header
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (error) {
            console.error("Could not parse user from localStorage or set auth header", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// This response interceptor handles logging out the user on auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check for 401 Unauthorized or 403 Forbidden errors
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Remove the entire user object, not just the token
            localStorage.removeItem('user');
            
            // Redirect to login page to re-authenticate
            // Avoid redirecting if we are already on the login page to prevent a loop
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;