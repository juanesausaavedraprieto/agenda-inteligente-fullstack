import cron from 'node-cron';
import { Resend } from 'resend';
import prisma from '../lib/prisma.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const startCronJobs = () => {
  console.log("🕰️ Servicio de Cron Jobs iniciado...");

  // Ejecutar TODOS LOS DÍAS a las 8:00 AM ('0 8 * * *')
  // Para pruebas rápidas usa: '*/30 * * * * *' (cada 30 seg)
  cron.schedule('0 8 * * *', async () => {
    console.log("🔍 Buscando tareas por vencer...");
    
    try {
      // Calcular fecha de MAÑANA
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Buscar tareas que vencen MAÑANA y no están completas
      const tasksDue = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: tomorrowStart,
            lte: tomorrowEnd
          },
          isCompleted: false
        },
        include: { user: true } // Necesitamos el email del dueño
      });

      if (tasksDue.length === 0) return console.log("✅ Nada vence mañana.");

      // Enviar correos
      for (const task of tasksDue) {
        if (!task.user.email) continue;

        const { data, error } = await resend.emails.send({
          from: 'Agenda Inteligente <onboarding@resend.dev>', // Usa este email de prueba si no tienes dominio
          to: [task.user.email], // En modo prueba solo puedes enviarte a ti mismo
          subject: `⚠️ URGENTE: ${task.title} vence mañana`,
          html: `
            <h1>¡Hola ${task.user.name}! 👋</h1>
            <p>Te recordamos que tienes una tarea pendiente para mañana:</p>
            <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; border-left: 5px solid #ef4444;">
                <h2 style="margin: 0; color: #333;">${task.title}</h2>
                <p style="color: #666;">${task.description || "Sin descripción"}</p>
                <p><strong>Vence:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
            <p>¡Entra a tu Agenda para completarla!</p>
          `
        });

        if (error) console.error("Error enviando email:", error);
        else console.log(`📧 Correo enviado a ${task.user.email} sobre ${task.title}`);
      }

    } catch (error) {
      console.error("Error en Cron Job:", error);
    }
  });
};