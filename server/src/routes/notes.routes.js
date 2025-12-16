import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notes.controller.js';

const router = Router();

router.get('/', authRequired, getNotes);
router.post('/', authRequired, createNote);
router.put('/:id', authRequired, updateNote);
router.delete('/:id', authRequired, deleteNote);

export default router;