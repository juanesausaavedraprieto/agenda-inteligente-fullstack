import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Componentes auxiliares para enlaces
  const AuthLinks = () => (
    <>
      <Link to="/dashboard" className="nav-link">Inicio</Link>
      <Link to="/tasks" className="nav-link">Tareas</Link>
      <Link to="/calendar" className="nav-link">Calendario</Link>
      <Link to="/pets" className="nav-link">Mascotas</Link>
      <Link to="/finance" className="nav-link">Finanzas</Link>
      <Link to="/academic" className="nav-link">Académico</Link>
      <Link to="/notes" className="nav-link">Notas</Link>
    </>
  );

  const GuestLinks = () => (
    <>
      <Link to="/login" className="btn-indigo">Login</Link>
      <Link to="/register" className="btn-indigo">Registro</Link>
    </>
  );

  return (
    <nav className="bg-zinc-700 my-3 rounded-lg px-4 py-4 md:px-10">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex items-center justify-between">

        {/* LOGO */}
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            Agenda Inteligente 🧠
          </h1>
        </Link>

        {/* BOTÓN HAMBURGUESA (solo móvil) */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {/* LINKS DESKTOP */}
        <ul className="hidden md:flex gap-6 items-center">
          {isAuthenticated ? <AuthLinks /> : <GuestLinks />}
        </ul>

        {/* USUARIO + BOTONES DESKTOP */}
        {/* USUARIO + BOTONES DESKTOP */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sky-400 font-semibold">
              Hola, {user?.name || "Usuario"}
            </span>

            <Link to="/add-task" className="btn-indigo">
              Añadir Tarea
            </Link>

            <button onClick={logout} className="btn-red">
              Salir
            </button>
          </div>
        )}

      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 text-center">
          {isAuthenticated ? (
            <>
              <AuthLinks />

              <span className="text-sky-400 font-semibold">
                Hola, {user?.name || "Usuario"}
              </span>

              <Link to="/add-task" className="btn-indigo">
                Añadir Tarea
              </Link>

              <button onClick={logout} className="btn-red">
                Salir
              </button>
            </>
          ) : (
            <GuestLinks />
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
