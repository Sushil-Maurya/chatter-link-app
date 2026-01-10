import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

// Create an instance instead of setting defaults globally to avoid pollution
export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true, // If we use cookies later, good to have. If JWT via header, we need an interceptor.
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
