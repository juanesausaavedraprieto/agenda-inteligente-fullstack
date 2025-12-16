import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { getPets, createPet, addVaccine, deletePet } from '../controllers/pets.controller.js';

const router = Router();

router.get('/', authRequired, getPets);
router.post('/', authRequired, createPet);
router.delete('/:id', authRequired, deletePet);

// Ruta especial para vacunas
router.post('/vaccines', authRequired, addVaccine);

export default router;