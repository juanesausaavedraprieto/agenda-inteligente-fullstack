import { createContext, useContext, useState } from "react";
import axios from "../api/axios"; // Tu instancia configurada

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  // 1. Obtener tareas
  const getTasks = async () => {
    try {
      const res = await axios.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Crear tarea
  const createTask = async (task) => {
    try {
      const res = await axios.post("/tasks", task);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 3. Eliminar tarea
  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      // Actualizar el estado local quitando la tarea borrada
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

 // ... dentro de TaskProvider

  // Nueva función: Obtener una tarea para editar
  const getTask = async (id) => {
    try {
      const res = await axios.get(`/tasks/${id}`);
      return res.data; // Devolvemos la tarea al formulario
    } catch (error) {
      console.error(error);
    }
  };

  // Nueva función: Actualizar
  const updateTask = async (id, task) => {
    try {
      await axios.put(`/tasks/${id}`, task);
      // Opcional: Actualizar el estado local para ver el cambio sin recargar
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, getTasks, createTask, deleteTask, getTask, updateTask }}>
      {children}
    </TaskContext.Provider>
  );}