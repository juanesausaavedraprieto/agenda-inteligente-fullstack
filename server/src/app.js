// server/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js'; // <--- IMPORTAR
import taskRoutes from './routes/tasks.routes.js';
import { startScheduler } from './services/scheduler.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import petsRoutes from './routes/pets.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import notesRoutes from './routes/notes.routes.js';
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://agenda-inteligente-fullstack.vercel.app' // <--- Adivinando tu futura URL (o pon '*' por ahora para probar)
  ],
  credentials: true // <--- Permite el envío de cookies/tokens
}));
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/finance', transactionRoutes);
app.use('/api/academic', coursesRoutes);
app.use('/api/notes', notesRoutes);
app.get('/', (req, res) => {
  res.json({ message: '🚀 API de Agenda Inteligente funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler().catch(err => console.error(err)); 
});

