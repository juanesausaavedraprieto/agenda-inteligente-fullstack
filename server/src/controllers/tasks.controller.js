// server/src/controllers/tasks.controller.js
import prisma from '../lib/prisma.js';

// 1. OBTENER TODAS LAS TAREAS (Solo del usuario logueado)
export const getTasks = async (req, res) => {
  try {
    // 1. LEER PARÁMETROS DE LA URL (ej: /tasks?page=1&limit=5)
    // Si no envían nada, usamos valores por defecto (Página 1, 5 tareas)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit; // Fórmula mágica: (1-1)*5 = 0 (Empieza al inicio)

    // 2. BUSCAR CON LÍMITES (Prisma)
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      skip: skip, // Saltar los anteriores
      take: limit, // Tomar solo estos
      orderBy: { dueDate: 'asc' } // Ordenar por fecha
    });

    // 3. CONTAR TOTAL (Para saber si hay página siguiente)
    const totalTasks = await prisma.task.count({
      where: { userId: req.user.id }
    });

    // 4. RESPONDER CON METADATOS
    res.json({
      data: tasks,
      meta: {
        total: totalTasks,
        page: page,
        last_page: Math.ceil(totalTasks / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas" });
  }
};

// 2. CREAR UNA TAREA
export const createTask = async (req, res) => {
  try {
    // 1. AGREGA 'type' AQUÍ vvv
    const { title, description, dueDate, priority, category, type } = req.body;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || "MEDIUM",
        category: category || "PERSONAL",

        // 2. Y AGREGA ESTA LÍNEA PARA GUARDARLO EN LA DB vvv
        type: type || "TASK",

        userId: req.user.id,
      },
    });

    res.json(newTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al guardar la tarea" });
  }
};

// 3. ELIMINAR TAREA
export const deleteTask = async (req, res) => {
  try {
    // Primero verificamos que la tarea exista y sea del usuario
    const task = await prisma.task.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user.id // Seguridad extra: solo borras si es tuya
      }
    });

    if (task.count === 0) return res.status(404).json({ message: "Tarea no encontrada" });

    res.sendStatus(204); // 204 = No Content (Borrado exitoso)
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};
export const getTask = async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id, // 🔐 seguridad
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la tarea" });
  }
};
export const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body // Actualiza con lo que le mandemos
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};