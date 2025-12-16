import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/transactions.controller.js';

const router = Router();

router.get('/', authRequired, getTransactions);
router.post('/', authRequired, createTransaction);
router.delete('/:id', authRequired, deleteTransaction);

export default router;