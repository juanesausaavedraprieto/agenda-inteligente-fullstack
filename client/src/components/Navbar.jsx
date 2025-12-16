import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-zinc-700 my-3 px-10 py-5 rounded-lg flex justify-between items-center">

      {/* 🔹 IZQUIERDA: Logo + Links */}
      <div className="flex items-center gap-x-6">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          <h1 className="text-2xl font-bold text-white flex items-center gap-x-2">
            Agenda Inteligente <span>🧠</span>
          </h1>
        </Link>

        {/* Links principales */}
        {isAuthenticated && (
          <ul className="flex gap-x-4">
            <li>
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-white transition"
              >
                Inicio
              </Link>
            </li>

            <li>
              <Link
                to="/tasks"
                className="text-gray-300 hover:text-white transition"
              >
                Tareas
              </Link>
            </li>

            <li>
              <Link
                to="/pets"
                className="text-gray-300 hover:text-white transition"
              >
                Mascotas
              </Link>
            </li>

            {/* 👇 NUEVO LINK */}
            <li>
              <Link
                to="/finance"
                className="text-gray-300 hover:text-white transition"
              >
                Finanzas
              </Link>
            </li>
            <li><Link
              to="/academic"
              className="text-gray-300 hover:text-white transition"
            >
              Académico
            </Link></li>
            <li><Link to="/notes"
              className="text-gray-300 hover:text-white transition"
            >Notas
            </Link></li>
          </ul>
        )}
      </div>

      {/* 🔹 DERECHA: Usuario */}
      <ul className="flex gap-x-3 items-center">
        {isAuthenticated ? (
          <>
            <li className="text-sky-400 font-semibold">
              Hola, {user.name}
            </li>

            <li>
              <Link
                to="/add-task"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-sm transition"
              >
                Añadir Tarea
              </Link>
            </li>

            <li>
              <Link
                to="/"
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-sm transition"
              >
                Salir
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-sm transition"
              >
                Login
              </Link>
            </li>

            <li>
              <Link
                to="/register"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-sm transition"
              >
                Registro
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
