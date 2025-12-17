import { useEffect } from "react";
import { useTasks } from "../context/TasksContext";
import TaskCard from "../components/planner/TaskCard";
import StatsChart from "../components/planner/StatsChart";
import TaskSkeleton from "../components/ui/TaskSkeleton";

function TasksPage() {
  // 1. IMPORTANTE: Traer 'loading' del contexto
  const { getTasks, tasks, loading, pagination } = useTasks();

  useEffect(() => {
    getTasks();
  }, []);

  // 2. PRIMERO: Si está cargando y no hay datos -> Mostrar Skeletons
  if (loading && tasks.length === 0) {
    return (
      <div className="p-4 sm:p-6 md:p-10">
        {/* Skeleton del Chart (opcional, una caja grande) */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl h-64 bg-zinc-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Grid de Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      </div>
    );
  }

  // 3. SEGUNDO: Si YA terminó de cargar y sigue vacío -> Mensaje de "No hay tareas"
  if (tasks.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)] px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-500">
          No hay tareas pendientes 😴
        </h1>
      </div>
    );
  }

  // 4. TERCERO: Si hay tareas -> Mostrar la App normal
  return (
    <div className="p-4 sm:p-6 md:p-10">

      {/* Estadísticas */}
      <div className="mb-6 sm:mb-8 flex justify-center">
        <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl">
          <StatsChart tasks={tasks} />
        </div>
      </div>

      {/* Grid de tareas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tasks.map((task) => (
          <TaskCard task={task} key={task.id} />
        ))}
      </div>

      {/* --- NUEVO: CONTROLES DE PAGINACIÓN --- */}
      {tasks.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">

          <button
            disabled={pagination.page === 1}
            onClick={() => getTasks(pagination.page - 1)}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${pagination.page === 1
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
          >
            ← Anterior
          </button>

          <span className="text-gray-400">
            Página {pagination.page} de {pagination.last_page}
          </span>

          <button
            disabled={pagination.page === pagination.last_page}
            onClick={() => getTasks(pagination.page + 1)}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${pagination.page === pagination.last_page
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
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