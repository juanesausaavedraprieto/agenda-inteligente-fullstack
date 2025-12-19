import { useTasks } from "../../context/TasksContext";
import { Link } from "react-router-dom";
import { toast } from 'sonner';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TaskCard({ task }) {
  const { deleteTask } = useTasks();

  const typeColors = {
    EXAM: "bg-red-500",
    HOMEWORK: "bg-blue-500",
    EVENT: "bg-green-500",
    TASK: "bg-gray-500",
  };
  
  const isOverdue = new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);

  const handleDelete = (id) => {
    toast.custom(
      (t) => (
        // Toast adaptado a modo claro/oscuro
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-lg shadow-xl w-full max-w-sm">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-zinc-800 dark:text-white">
              ¿Seguro que quieres borrar esta tarea? 🗑️
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white px-3 py-1 rounded text-sm transition-colors border border-zinc-200 dark:border-transparent"
                onClick={() => toast.dismiss(t)}
              >
                Cancelar
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors shadow-sm"
                onClick={async () => {
                  try {
                    toast.dismiss(t);
                    await deleteTask(id);
                    toast.success("Tarea eliminada correctamente");
                  } catch (error) {
                    toast.error("Error al eliminar la tarea");
                  }
                }}
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    // CARD PRINCIPAL: Fondo blanco/oscuro, Borde claro/oscuro
    <div className="bg-white dark:bg-zinc-800 w-full p-4 sm:p-6 rounded-lg shadow-md transition-all active:scale-[0.98] border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <h1 className="text-lg sm:text-xl font-bold break-words text-zinc-800 dark:text-white">
          {task.title}
        </h1>

        <div className="flex flex-wrap gap-2">
          <span
            className={`text-xs font-bold px-2 py-1 rounded text-white shadow-sm ${typeColors[task.type] || "bg-gray-500"}`}
          >
            {task.type}
          </span>

          {/* Botón Editar: Adaptado para verse bien en blanco (gris suave) y negro (gris medio) */}
          <Link
            to={`/tasks/${task.id}`}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-500 dark:text-white px-2 py-1 rounded-md text-xs border border-zinc-200 dark:border-transparent transition-colors"
            title="Editar"
          >
            ✏️
          </Link>

          {/* Botón Borrar */}
          <button
            onClick={() => handleDelete(task.id)}
            className="bg-zinc-100 hover:bg-red-100 text-zinc-600 hover:text-red-600 dark:bg-zinc-700 dark:hover:bg-red-500 dark:text-white px-2 py-1 rounded-md text-xs transition-colors border border-zinc-200 dark:border-transparent"
            title="Borrar"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* DESCRIPCIÓN */}
      {task.description && (
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* FECHA: Borde superior adaptado */}
      <p className={`text-xs mt-4 pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center ${isOverdue ? "text-red-500 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
        <span>📅 Vence: {formatDate(task.dueDate)}</span>
        {isOverdue && <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded text-[10px] border border-red-200 dark:border-red-500/50">VENCIDA</span>}
      </p>
    </div>
  );
}

export default TaskCard;