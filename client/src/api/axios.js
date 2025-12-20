import axios from "axios";
import Cookies from "js-cookie";

// Detectar si estamos en local o en producción
// Si import.meta.env.VITE_BACKEND_URL existe, lo usa, si no, localhost.
const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

const instance = axios.create({
  baseURL: URL,
  withCredentials: true, // Esto permite cookies, pero si fallan, usaremos el header
});

// --- INTERCEPTOR MÁGICO ---
// Antes de enviar cualquier petición, inyectamos el token manualmente
instance.interceptors.request.use((config) => {
  const token = Cookies.get("token"); // Leemos el token que guardamos
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Lo pegamos en el Header
  }
  return config;
});

export default instance;