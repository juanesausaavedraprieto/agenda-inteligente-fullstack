import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Función para cerrar menú al hacer clic
  const closeMenu = () => setMenuOpen(false);

  // Componentes auxiliares para enlaces
  const AuthLinks = () => (
    <>
      <Link to="/dashboard" onClick={closeMenu} className="nav-link hover:text-indigo-400 transition">Inicio</Link>
      <Link to="/tasks" onClick={closeMenu} className="nav-link hover:text-indigo-400 transition">Tareas</Link>
      <Link to="/calendar" onClick={closeMenu} className="nav-link hover:text-indigo-400 transition">Calendario</Link>
      <Link to="/pets" onClick={closeMenu} className="nav-link hover:text-indigo-400 transition">Mascotas</Link>
      <Link to="/finance" onClick={closeMenu} className="nav-link hover:text-indigo-400 transition">Finanzas</Link>
      <Link to="/academic" onClick={closeMenu} className="nav-link hover:text-indigo-400 transition">Académico</Link>
      <Link to="/notes" onClick={closeMenu} className="nav-link hover:text-indigo-400 transition">Notas</Link>
      {/* NUEVO LINK DE SALUD */}
      <Link to="/health" onClick={closeMenu} className="nav-link text-green-400 hover:text-green-300 transition font-bold">Salud </Link>
    </>
  );

  const GuestLinks = () => (
    <>
      <Link to="/login" onClick={closeMenu} className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700">Login</Link>
      <Link to="/register" onClick={closeMenu} className="bg-zinc-600 px-4 py-2 rounded text-white hover:bg-zinc-500">Registro</Link>
    </>
  );

  return (
    <nav className="bg-zinc-700 my-3 rounded-lg px-4 py-4 md:px-10 relative z-50">
      <div className="flex items-center justify-between">
        
        {/* LOGO */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} onClick={closeMenu}>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            Agenda Inteligente 🧠
          </h1>
        </Link>

        {/* HAMBURGUESA */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* LINKS DESKTOP */}
        <ul className="hidden md:flex gap-4 lg:gap-6 items-center text-sm lg:text-base">
          {isAuthenticated ? <AuthLinks /> : <GuestLinks />}
        </ul>

        {/* USUARIO DESKTOP */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sky-400 font-semibold text-sm">
              Hola, {user?.name?.split(" ")[0]}
            </span>
            <button onClick={() => { logout(); closeMenu(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
              Salir
            </button>
          </div>
        )}
      </div>

      {/* MENÚ MÓVIL (DESPLEGABLE) */}
      <div className={`${menuOpen ? "flex" : "hidden"} md:hidden flex-col items-center gap-4 mt-4 py-4 border-t border-zinc-600`}>
        {isAuthenticated ? (
          <>
            <AuthLinks />
            <div className="border-t border-zinc-600 w-full my-2"></div>
            <span className="text-sky-400 font-bold">Hola, {user?.name}</span>
            <button onClick={() => { logout(); closeMenu(); }} className="bg-red-600 text-white px-6 py-2 rounded w-full">
              Cerrar Sesión
            </button>
          </>
        ) : (
          <GuestLinks />
        )}
      </div>
    </nav>
  );
}

export default Navbar;