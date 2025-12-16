// 1. CORRECCIÓN DE IMPORTACIÓN: Usamos destructuración { PgBoss }
import { PgBoss } from 'pg-boss';
import prisma from '../lib/prisma.js';

const boss = new PgBoss(process.env.DATABASE_URL);

boss.on('error', error => console.error('Error en PgBoss:', error));

export const startScheduler = async () => {
  // Iniciamos el servicio
  await boss.start();

  // 2. CORRECCIÓN DE BASE DE DATOS: Crear la cola si no existe
  // Esto inserta 'check-deadlines' en la tabla pgboss.queue para evitar el error de Foreign Key
  await boss.createQueue('check-deadlines');

  // Programar el trabajo
  await boss.schedule('check-deadlines', '*/1 * * * *'); 

  console.log('⏰ Cron Job iniciado: Revisando tareas cada minuto...');

  // Definir la lógica del trabajo
  await boss.work('check-deadlines', async (job) => {
    try {
      console.log('🔍 Escaneando tareas pendientes...');
      
      const twentyFourHoursLater = new Date();
      twentyFourHoursLater.setHours(twentyFourHoursLater.getHours() + 24);

      const tasksDueSoon = await prisma.task.findMany({
        where: {
          dueDate: {
            lte: twentyFourHoursLater,
            gte: new Date()
          },
          reminderSent: false,
          isCompleted: false
        },
        include: {
          user: true
        }
      });

      for (const task of tasksDueSoon) {
        console.log(`⚠️ ALERTA PARA ${task.user.name}: La tarea "${task.title}" vence pronto (${task.dueDate})`);
        
        await prisma.task.update({
          where: { id: task.id },
          data: { reminderSent: true }
        });
      }

    } catch (error) {
      console.error("Error dentro del job:", error);
    }
  });
};