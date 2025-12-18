import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { healthProfileSchema, diseaseSchema } from "../schemas/health.schema.js";
import { 
    getHealthData, 
    updateHealthProfile, 
    addDisease, 
    deleteDisease,
    updateDisease
} from "../controllers/health.controller.js";

const router = Router();

// Obtener todo (Perfil + Historial)
router.get("/", authRequired, getHealthData);

// Guardar/Actualizar Peso y Altura
router.post("/profile", authRequired, validateSchema(healthProfileSchema), updateHealthProfile);

// Agregar Enfermedad
router.post("/diseases", authRequired, validateSchema(diseaseSchema), addDisease);

// actualiza
router.put("/diseases/:id", authRequired, validateSchema(diseaseSchema), updateDisease);

// Eliminar Enfermedad
router.delete("/diseases/:id", authRequired, deleteDisease);

export default router;