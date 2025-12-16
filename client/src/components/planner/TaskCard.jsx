import { useTasks } from "../../context/TasksContext";
import { Link } from "react-router-dom";

// Función auxiliar para formatear fechas
// Si instalaste dayjs o date-fns úsalos, si no, usaremos JS nativo
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function TaskCard({ task }) {
  const { deleteTask } = useTasks();

  // Colores según el tipo (puedes personalizarlos más)
  const typeColors = {
    EXAM: "bg-red-500",
    HOMEWORK: "bg-blue-500",
    EVENT: "bg-green-500",
    TASK: "bg-gray-500"
  }

  return (
    <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <div className="flex gap-x-2 items-center">
          {/* Badge de Tipo */}
          <span className={`text-xs font-bold px-2 py-1 rounded text-white ${typeColors[task.type] || "bg-gray-500"}`}>
            {task.type}
          </span>
          <Link
            to={`/tasks/${task.id}`}
            className="bg-zinc-600 hover:bg-zinc-500 text-white px-2 py-1 rounded-md text-sm"
          >
            Editar ✏️
          </Link>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
            onClick={() => deleteTask(task.id)}
          >
            Borrar
          </button>
        </div>
      </header>
      <p className="text-slate-300 my-2">{task.description}</p>
      <p className="text-slate-400 text-sm mb-4">
        Vence: {formatDate(task.dueDate)}
      </p>
    </div>
  );
}

export default TaskCard;