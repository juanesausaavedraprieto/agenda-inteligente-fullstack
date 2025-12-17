import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware.js";
import { magicNote } from "../controllers/ai.controller.js";

const router = Router();

router.post("/magic", authRequired, magicNote);

export default router;