import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { getCourses, createCourse, deleteCourse, addGrade, updateCourse, updateGrade } from '../controllers/courses.controller.js';

const router = Router();

router.get('/', authRequired, getCourses);
router.post('/', authRequired, createCourse);
router.delete('/:id', authRequired, deleteCourse);
router.put('/:id', authRequired, updateCourse);
router.put('/grade/:id', authRequired, updateGrade);

// Ruta especial para agregar notas
router.post('/grade', authRequired, addGrade);

export default router;