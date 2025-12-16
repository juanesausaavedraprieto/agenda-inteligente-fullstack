// server/src/routes/tasks.routes.js
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { getTasks,getTask, createTask, deleteTask, updateTask } from '../controllers/tasks.controller.js';

const router = Router();

// Todas estas rutas están protegidas por "authRequired"
router.get('/', authRequired, getTasks);
router.post('/', authRequired, createTask);
router.delete('/:id', authRequired, deleteTask);
router.get('/:id', authRequired, getTask); // Obtener una
router.put('/:id', authRequired, updateTask); // Actualizar (PUT)

export default router;