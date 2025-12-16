import { useEffect } from "react";
import { useTasks } from "../context/TasksContext";
import TaskCard from "../components/planner/TaskCard";
import StatsChart from "../components/planner/StatsChart";

function TasksPage() {
  const { getTasks, tasks } = useTasks();

  useEffect(() => { getTasks(); }, []);

  // Al cargar la página, traemos las tareas del backend

  if (tasks.length === 0) return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <h1 className="text-3xl font-bold">No hay tareas pendientes 😴</h1>
      </div>
  )

 return (
    <div className="p-10">
      {/* Sección de Estadísticas */}
      <div className="mb-8 flex justify-center">
         <div className="w-full max-w-2xl">
            <StatsChart tasks={tasks} />
         </div>
      </div>

      {/* Grid de Tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard task={task} key={task.id} />
        ))}
      </div>
    </div>
  );
}

export default TasksPage;