import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { 
    getPets, 
    createPet, 
    addVaccine, 
    deletePet,
    // 👇 IMPORTANTE: Faltaban importar estas dos funciones
    updatePet,
    updateVaccine
} from '../controllers/pets.controller.js';

const router = Router();

// --- RUTAS DE MASCOTAS ---
router.get('/', authRequired, getPets);
router.post('/', authRequired, createPet);
router.delete('/:id', authRequired, deletePet);

// 👇 ESTA ES LA QUE FALTABA PARA EDITAR MASCOTA (PUT /api/pets/:id)
router.put('/:id', authRequired, updatePet);


// --- RUTAS DE VACUNAS ---
router.post('/vaccines', authRequired, addVaccine);

// 👇 ESTA ES LA QUE FALTABA PARA EDITAR VACUNA (PUT /api/pets/vaccines/:id)
router.put('/vaccines/:id', authRequired, updateVaccine);

export default router;