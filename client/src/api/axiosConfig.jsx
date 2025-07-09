// axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically add token to every request
instance.interceptors.request.use((config) => {
  if (!config.headers['skipAuth']) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    delete config.headers['skipAuth']; // Clean it up
  }
  return config;
});


export default instance;
