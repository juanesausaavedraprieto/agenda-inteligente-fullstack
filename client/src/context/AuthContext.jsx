import { createContext, useState, useContext, useEffect } from "react";
import axios from "../api/axios";
import Cookies from "js-cookie";
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  
  // 1. NUEVO ESTADO: Loading
  const [loading, setLoading] = useState(true);

  const signup = async (user) => {
    try {
      const res = await axios.post("/auth/register", user);
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', res.data.token);
    } catch (error) {
      setErrors(error.response?.data?.message ? [error.response.data.message] : ["Error en registro"]);
    }
  };

  const signin = async (user) => {
    try {
      const res = await axios.post("/auth/login", user);
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', res.data.token);
    } catch (error) {
      setErrors(error.response?.data?.message ? [error.response.data.message] : ["Error en login"]);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // 2. NUEVO: EFECTO PARA VERIFICAR SESIÓN AL CARGAR
  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem('token');

      // Si no hay token, no estamos logueados, terminamos de cargar.
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Verificar el token con el backend
        // (El interceptor de axios.js enviará el token automáticamente)
        const res = await axios.get("/auth/verify");
        
        if (!res.data) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        // Si el backend dice OK: restauramos la sesión
        setIsAuthenticated(true);
        setUser(res.data);
        setLoading(false);
      } catch (error) {
        // Si el token venció o es falso
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    }
    
    checkLogin();
  }, []);
const signinWithGoogle = async (googleToken) => {
    try {
        // Enviamos el token al backend
        const res = await axios.post("/auth/google", { token: googleToken });
        Cookies.set("token", res.data.token, { expires: 7 });
        // Si todo sale bien, actualizamos el estado
        setUser(res.data.user);
        setIsAuthenticated(true);
        setErrors([]); // Limpiamos errores previos
    } catch (error) {
        console.error(error);
        if (Array.isArray(error.response.data)) {
            setErrors(error.response.data);
        } else {
            setErrors([error.response.data.message]);
        }
    }
  };
  // 3. Importante: No renderizar nada hasta terminar de verificar (Evita parpadeos)
  if (loading) return <h1 className="text-white text-center mt-10">Cargando... ⏳</h1>;
  
  return (
    <AuthContext.Provider value={{ 
      signup, 
      signin, 
      logout,
      user, 
      isAuthenticated, 
      errors,
      signinWithGoogle,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};