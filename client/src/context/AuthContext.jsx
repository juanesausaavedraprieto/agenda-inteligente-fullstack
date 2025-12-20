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
  const [loading, setLoading] = useState(true);

  // --- REGISTRO ---
  const signup = async (user) => {
    try {
      const res = await axios.post("/auth/register", user);
      setUser(res.data.user);
      setIsAuthenticated(true);
      // CORREGIDO: Usar Cookies en lugar de localStorage para consistencia
      Cookies.set("token", res.data.token, { expires: 7 }); 
    } catch (error) {
      setErrors(error.response?.data?.message ? [error.response.data.message] : ["Error en registro"]);
    }
  };

  // --- LOGIN ---
  const signin = async (user) => {
    try {
      const res = await axios.post("/auth/login", user);
      setUser(res.data.user);
      setIsAuthenticated(true);
      // CORREGIDO: Usar Cookies en lugar de localStorage para consistencia
      Cookies.set("token", res.data.token, { expires: 7 });
    } catch (error) {
      setErrors(error.response?.data?.message ? [error.response.data.message] : ["Error en login"]);
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    Cookies.remove("token"); // CORREGIDO
    setUser(null);
    setIsAuthenticated(false);
  };

  // --- LOGIN CON GOOGLE ---
  const signinWithGoogle = async (googleToken) => {
    try {
      const res = await axios.post("/auth/google", { token: googleToken });
      Cookies.set("token", res.data.token, { expires: 7 });
      setUser(res.data.user);
      setIsAuthenticated(true);
      setErrors([]); 
    } catch (error) {
      console.error(error);
      if (Array.isArray(error.response.data)) {
        setErrors(error.response.data);
      } else {
        setErrors([error.response.data.message]);
      }
    }
  };

  // --- VERIFICAR LOGIN (Extraída para ser accesible) ---
  const checkLogin = async () => {
    const token = Cookies.get("token");

    // Si no hay token, no estamos logueados
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      // Verificar el token con el backend
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
  };

  // --- EFECTO PARA VERIFICAR AL CARGAR LA APP ---
  useEffect(() => {
    checkLogin();
  }, []);

  // No renderizar nada hasta terminar de verificar (Evita parpadeos)
  // if (loading) return <h1 className="text-white text-center mt-10">Cargando... ⏳</h1>;
  
  return (
    <AuthContext.Provider value={{ 
      signup, 
      signin, 
      logout, 
      user, 
      isAuthenticated, 
      errors, 
      signinWithGoogle, 
      loading,
      checkLogin // <--- AQUÍ ESTÁ EL CAMBIO IMPORTANTE: Exportamos la función
    }}>
      {children}
    </AuthContext.Provider>
  );
};