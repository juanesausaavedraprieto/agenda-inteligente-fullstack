import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware.js";
import { getTasks, getTask, createTask, updateTask, deleteTask } from "../controllers/tasks.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createTaskSchema } from "../schemas/task.schema.js";

const router = Router();

router.get("/", authRequired, getTasks);
router.get("/:id", authRequired, getTask);

router.post("/", authRequired, validateSchema(createTaskSchema), createTask);
router.delete("/:id", authRequired, deleteTask);

// AGREGAR VALIDACIÓN AQUÍ TAMBIÉN (Recomendado) 👇
router.put("/:id", authRequired, validateSchema(createTaskSchema), updateTask);

export default router;