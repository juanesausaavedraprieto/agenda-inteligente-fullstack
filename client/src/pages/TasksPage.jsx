import { useEffect } from "react";
import { useTasks } from "../context/TasksContext";
import TaskCard from "../components/planner/TaskCard";
import StatsChart from "../components/planner/StatsChart";
import TaskSkeleton from "../components/ui/TaskSkeleton";
import { Link } from "react-router-dom";

function TasksPage() {
  const { getTasks, tasks, loading, pagination } = useTasks();

  useEffect(() => {
    getTasks();
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <div className="p-4 sm:p-6 md:p-10">
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl h-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <TaskSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (tasks.length === 0 && !loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)] px-4 gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-zinc-400 dark:text-gray-500">
          No hay tareas pendientes 😴
        </h1>
        <Link 
          to="/tasks/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-bold transition-colors shadow-lg shadow-indigo-500/20"
        >
          + Crear mi primera tarea
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10">

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white">Mis Tareas 📝</h1>
        <Link 
          to="/tasks/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <span>+</span> Nueva Tarea
        </Link>
      </div>

      <div className="mb-6 sm:mb-8 flex justify-center">
        <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl">
          <StatsChart tasks={tasks} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tasks.map((task) => (
          <TaskCard task={task} key={task.id} />
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={pagination.page === 1}
            onClick={() => getTasks(pagination.page - 1)}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${
              pagination.page === 1
                ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            ← Anterior
          </button>
          <span className="text-zinc-500 dark:text-gray-400 font-medium">
            Página {pagination.page} de {pagination.last_page}
          </span>
          <button
            disabled={pagination.page === pagination.last_page}
            onClick={() => getTasks(pagination.page + 1)}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${
              pagination.page === pagination.last_page
                ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default TasksPage;