import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = Router();

// GET /api/dashboard
router.get('/', authRequired, getDashboardSummary);

export default router;