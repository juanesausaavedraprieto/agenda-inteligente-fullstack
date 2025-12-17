import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware.js";
import { getTasks, getTask, createTask, updateTask, deleteTask } from "../controllers/tasks.controller.js";

// IMPORTAR VALIDATOR Y SCHEMA
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createTaskSchema } from "../schemas/task.schema.js";

const router = Router();

router.get("/", authRequired, getTasks);
router.get("/:id", authRequired, getTask);

// VALIDAR AL CREAR Y AL ACTUALIZAR
router.post("/", authRequired, validateSchema(createTaskSchema), createTask);
router.delete("/:id", authRequired, deleteTask);
router.put("/:id", authRequired, updateTask);

export default router;