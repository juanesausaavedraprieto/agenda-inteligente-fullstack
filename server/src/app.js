import "dotenv/config";
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Rutas
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import petsRoutes from './routes/pets.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import notesRoutes from './routes/notes.routes.js';
import aiRoutes from './routes/ai.routes.js';
import healthRoutes from './routes/health.routes.js';

import { startCronJobs } from './services/cron.service.js';

const app = express();

// 1. RATE LIMIT (Aumentado para evitar bloqueos en demos)
// En producción, si mucha gente entra desde la misma oficina/wifi, 100 es muy poco.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, // Aumentado a 500 para evitar problemas en presentaciones
  message: "Demasiadas peticiones, calma un poco.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. HELMET (Permite Popups de Google)
app.use(
  helmet({
    contentSecurityPolicy: false, // Desactiva CSP que a veces choca con scripts de Google
    crossOriginOpenerPolicy: { policy: "unsafe-none" }, // Permite popups externos
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(limiter);

// 3. CORS INTELIGENTE (Crucial para Vercel)
// Esto permite localhost Y cualquier despliegue en Vercel
const whitelist = [
  'http://localhost:5173', 
  'http://localhost:3000',
  // Tu dominio principal de producción:
  'https://agenda-inteligente-fullstack.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (como Postman o Server-to-Server)
    if (!origin) return callback(null, true);

    // Si el origen está en la lista blanca O termina en .vercel.app (para previews)
    if (whitelist.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("Bloqueado por CORS:", origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true // Permite cookies/tokens entre dominios
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// --- RUTAS ---
app.use('/api/auth', authRoutes); 
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/finance', transactionRoutes);
app.use('/api/academic', coursesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);

// Ruta de prueba para verificar estado
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Agenda Inteligente funcionando',
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- MANEJO DE ERRORES GLOBAL (Anti-Caídas) ---
// Esto evita que el servidor se apague si algo falla inesperadamente
app.use((err, req, res, next) => {
  console.error("🔥 Error Global:", err.stack);
  res.status(500).json({ 
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  try {
    startCronJobs();
    console.log("⏰ Cron Jobs activos");
  } catch (e) {
    console.error("Error iniciando CronJobs", e);
  }
});

export default app;