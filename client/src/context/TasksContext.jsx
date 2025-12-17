import { createContext, useContext, useState } from "react";
import axios from "../api/axios";

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // NUEVO: Estado para la paginación
  const [pagination, setPagination] = useState({ page: 1, last_page: 1 });

  // Modificamos getTasks para aceptar el número de página
  const getTasks = async (page = 1) => {
    try {
      setLoading(true);
      // Enviamos el parámetro ?page=X
      const res = await axios.get(`/tasks?page=${page}&limit=6`);

      // AHORA LA RESPUESTA TIENE .data Y .meta
      setTasks(res.data.data);
      setPagination({
        page: res.data.meta.page,
        last_page: res.data.meta.last_page
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Crear tarea
  const createTask = async (task) => {
    try {
      const res = await axios.post("/tasks", task);
      // MEJORA UX: Agregamos la tarea a la lista localmente para verla al instante
      setTasks([...tasks, res.data]);
    } catch (error) {
      console.log(error);
    }
  };

  // Eliminar tarea
  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  // Obtener una tarea para editar
  const getTask = async (id) => {
    try {
      const res = await axios.get(`/tasks/${id}`);
      return res.data;
    } catch (error) {
      console.error(error);
    }
  };

  // Actualizar
  const updateTask = async (id, task) => {
    try {
      const res = await axios.put(`/tasks/${id}`, task);
      // MEJORA UX: Actualizar el estado local para ver el cambio sin recargar
      setTasks(tasks.map(t => (t.id === id ? res.data : t)));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // 2. IMPORTANTE: Exportamos 'loading' en el value
    <TaskContext.Provider value={{
      tasks,
      createTask,
      deleteTask,
      getTasks,
      getTask,
      updateTask,
      loading,// <--- Aquí va
      pagination
    }}>
      {children}
    </TaskContext.Provider>
  );
}