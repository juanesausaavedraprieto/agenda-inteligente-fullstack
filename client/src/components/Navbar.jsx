import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // --- BOTÓN DE TEMA ---
  const ThemeToggleButton = () => (
    <button
      onClick={toggleTheme}
      className="
        w-10 h-10 flex items-center justify-center rounded-full transition-colors border shadow-sm
        bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 
        dark:bg-zinc-700 dark:text-yellow-400 dark:border-zinc-600 dark:hover:bg-zinc-600
      "
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );

  // --- ENLACES AUTH ---
  const AuthLinks = () => (
    <>
      {["Dashboard", "Tasks", "Calendar", "Pets", "Finance", "Academic", "Notes"].map((item) => (
        <Link
          key={item}
          to={`/${item.toLowerCase()}`}
          onClick={closeMenu}
          className="font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {item === "Dashboard" ? "Inicio" :
           item === "Tasks" ? "Tareas" :
           item === "Calendar" ? "Calendario" :
           item === "Pets" ? "Mascotas" :
           item === "Finance" ? "Finanzas" :
           item === "Academic" ? "Académico" : "Notas"}
        </Link>
      ))}

      <Link
        to="/health"
        onClick={closeMenu}
        className="font-bold transition-colors text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        Salud
      </Link>
    </>
  );

  // --- ENLACES GUEST ---
  const GuestLinks = () => (
    <>
      <Link
        to="/login"
        onClick={closeMenu}
        className="px-4 py-2 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Login
      </Link>
      <Link
        to="/register"
        onClick={closeMenu}
        className="px-4 py-2 rounded-lg font-medium transition-colors bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
      >
        Registro
      </Link>
    </>
  );

  return (
    <nav
      className="
        my-3 rounded-xl px-4 py-4 md:px-10 relative z-50 shadow-md transition-colors duration-300
        bg-white text-zinc-800 
        dark:bg-zinc-800 dark:text-zinc-100
      "
    >
      <div className="flex items-center justify-between">
        
        {/* LOGO */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} onClick={closeMenu}>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            Agenda Inteligente <span className="animate-pulse">🧠</span>
          </h1>
        </Link>

        {/* HAMBURGUESA */}
        <button
          className="md:hidden text-2xl focus:outline-none transition-transform active:scale-90"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* --- DESKTOP --- */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex gap-5 items-center text-sm lg:text-base">
            {isAuthenticated ? <AuthLinks /> : <GuestLinks />}
          </ul>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

          <ThemeToggleButton />

          {isAuthenticated && (
            <div className="flex items-center gap-4">

              {/* PERFIL */}
              <Link
                to="/profile"
                title="Ir a mi perfil"
                className="
                  flex items-center gap-2 px-3 py-1 rounded-md font-bold text-sm
                  text-zinc-700 hover:text-indigo-600 hover:bg-zinc-100
                  dark:text-white dark:hover:text-indigo-400 dark:hover:bg-zinc-800
                  transition-colors
                "
              >
                <span className="text-xl">👤</span>
                {user?.username || user?.name}
              </Link>

              {/* LOGOUT */}
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
              >
                Salir
              </button>

            </div>
          )}
        </div>
      </div>

      {/* --- MENÚ MÓVIL --- */}
      <div
        className={`
          ${menuOpen ? "flex" : "hidden"}
          md:hidden flex-col items-center gap-4 mt-4 py-4 
          border-t border-zinc-100 dark:border-zinc-700
          animate-fade-in
        `}
      >
        {isAuthenticated ? (
          <>
            <div className="flex flex-col items-center gap-4 w-full">
              <AuthLinks />
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-700 w-full my-2"></div>

            <div className="flex items-center justify-between w-full px-4">

              <div className="flex items-center gap-3">
                <ThemeToggleButton />

                {/* PERFIL */}
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  title="Ir a mi perfil"
                  className="
                    flex items-center gap-2 font-bold
                    text-zinc-700 hover:text-indigo-600
                    dark:text-white dark:hover:text-indigo-400
                    transition-colors
                  "
                >
                  <span className="text-xl">👤</span>
                  {user?.username || user?.name}
                </Link>
              </div>

              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="text-red-600 dark:text-red-400 font-medium"
              >
                Salir
              </button>

            </div>
          </>
        ) : (
          <>
            <div className="flex gap-4 w-full justify-center">
              <GuestLinks />
            </div>

            <div className="mt-2">
              <ThemeToggleButton />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
