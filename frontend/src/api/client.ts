import axios from "axios";

// Development: VITE_API_URL is not set → baseURL is "/api" → Vite proxy forwards to localhost:5000
// Production:  VITE_API_URL is "https://euc-lms.onrender.com" → baseURL becomes full URL with /api
const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token automatically for every request that needs it
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;