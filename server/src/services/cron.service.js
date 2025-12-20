import cron from 'node-cron';
import { Resend } from 'resend';
import prisma from '../lib/prisma.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const startCronJobs = () => {
  console.log("🕰️ Servicio de Cron Jobs iniciado...");

  // Se ejecuta TODOS LOS DÍAS a las 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log("🔍 Ejecutando análisis diario del asistente...");
    
    // Definir rango de tiempo (MAÑANA)
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    try {
      // ==========================================
      // 1. RECORDATORIO DE TAREAS Y EVENTOS 📝
      // ==========================================
      const tasksDue = await prisma.task.findMany({
        where: {
          dueDate: { gte: tomorrowStart, lte: tomorrowEnd },
          isCompleted: false
        },
        include: { user: true }
      });

      for (const task of tasksDue) {
        if (!task.user.email) continue;
        
        await resend.emails.send({
          from: 'Agenda Inteligente <onboarding@resend.dev>',
          to: [task.user.email],
          subject: `⚡ Pendiente para mañana: ${task.title}`,
          html: `
            <h1>Hola ${task.user.name}, recuerda tu ${task.category.toLowerCase()}:</h1>
            <p><strong>${task.title}</strong> vence mañana.</p>
            <p>${task.description || ""}</p>
          `
        });
        console.log(`✅ Correo Tarea enviado a ${task.user.email}`);
      }

      // ==========================================
      // 2. RECORDATORIO DE VACUNAS 🐾
      // ==========================================
      // Asumiendo que tu schema tiene un modelo Vaccine relacionado con Pet y User
      /* Necesitas que tu Prisma Schema tenga la relación inversa para esto.
         Si no, hacemos la búsqueda en Vaccine e incluimos Pet -> User
      */
      const vaccinesDue = await prisma.vaccine.findMany({
        where: {
          nextDate: { gte: tomorrowStart, lte: tomorrowEnd }
        },
        include: {
          pet: { include: { user: true } } // Accedemos al dueño a través de la mascota
        }
      });

      for (const vaccine of vaccinesDue) {
        if (!vaccine.pet.user.email) continue;

        await resend.emails.send({
          from: 'Agenda Inteligente <onboarding@resend.dev>',
          to: [vaccine.pet.user.email],
          subject: `🐾 Vacuna pendiente para ${vaccine.pet.name}`,
          html: `
            <h1>¡Cuidado con ${vaccine.pet.name}!</h1>
            <p>Mañana le toca su vacuna de: <strong>${vaccine.name}</strong>.</p>
            <p>No olvides llevarlo al veterinario.</p>
          `
        });
        console.log(`✅ Correo Vacuna enviado a ${vaccine.pet.user.email}`);
      }

      // ==========================================
      // 3. ALERTA DE FINANZAS BAJAS 💸
      // ==========================================
      // Esto revisa todos los usuarios y calcula su saldo actual
      const allUsers = await prisma.user.findMany({
        include: { transactions: true }
      });

      for (const user of allUsers) {
        if (!user.email) continue;

        // Calculamos saldo
        const income = user.transactions
          .filter(t => t.type === "INCOME")
          .reduce((acc, t) => acc + Number(t.amount), 0);
          
        const expense = user.transactions
          .filter(t => t.type === "EXPENSE")
          .reduce((acc, t) => acc + Number(t.amount), 0);

        const balance = income - expense;

        // Si el saldo es menor a 50 soles (o la moneda que uses) y es positivo
        if (balance < 50 && balance > 0) {
           await resend.emails.send({
            from: 'Agenda Inteligente <onboarding@resend.dev>',
            to: [user.email],
            subject: `💰 Alerta: Saldo bajo (S/ ${balance.toFixed(2)})`,
            html: `
              <h1>Ojo con tus finanzas 📉</h1>
              <p>Tu saldo actual es de solo <strong>S/ ${balance.toFixed(2)}</strong>.</p>
              <p>Trata de no gastar de más hasta tu próximo ingreso.</p>
            `
          });
          console.log(`✅ Correo Finanzas enviado a ${user.email}`);
        }
      }

    } catch (error) {
      console.error("🔥 Error en Cron Job General:", error);
    }
  });
};