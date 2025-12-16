// client/src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true // Importante para manejo de cookies (si usaras)
});

// Interceptor: Antes de cada petición, inyecta el token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;