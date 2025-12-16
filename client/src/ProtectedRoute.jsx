// client/src/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si sí, mostrar el contenido (Outlet)
  return <Outlet />;
}

export default ProtectedRoute;