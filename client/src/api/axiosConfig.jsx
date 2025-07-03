// axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically add token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ✅ Must exist after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
