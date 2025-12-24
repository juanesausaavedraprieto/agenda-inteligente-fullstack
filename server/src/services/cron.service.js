import cron from 'node-cron';
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma.js';

// CONFIGURACIÓN DE GMAIL (Transporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.error("🚨 ERROR DE CONEXIÓN GMAIL:", error);
  } else {
    console.log("✅ Servidor de Correo listo y conectado.");
  }
});
// --- PLANTILLA BASE PARA CORREOS ---
const getHtmlTemplate = (title, color, content) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: ${color}; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">${title}</h1>
      </div>
      
      <div style="padding: 30px; color: #374151;">
        ${content}
      </div>

      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          © 2025 Agenda Inteligente - Asistente Personal Automatizado
        </p>
      </div>
    </div>
  `;
};

export const startCronJobs = () => {
  console.log("🕰️ Servicio de Cron Jobs iniciado (Zona Horaria: Lima)...");

  // SE EJECUTA A LAS 8:00 AM (HORA PERÚ)
  cron.schedule('* * * * *', async () => {
    console.log("🔍 Ejecutando análisis diario del asistente...");

    // Calcular rango de "Mañana"
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    try {
      // ==========================================
      // 1. RECORDATORIO DE TAREAS 📝 (Azul)
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

        const htmlContent = `
          <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong>${task.user.name}</strong>, tienes una actividad pendiente para mañana:</p>
          
          <div style="background-color: #eff6ff; border-left: 5px solid #3b82f6; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 18px;">${task.title}</h3>
            <p style="margin: 0; color: #4b5563;">${task.description || "Sin descripción adicional."}</p>
            <div style="margin-top: 15px; font-size: 14px; color: #3b82f6; font-weight: bold;">
              📅 Vence: ${new Date(task.dueDate).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/tasks" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver Tarea</a>
          </div>
        `;

        await transporter.sendMail({
          from: '"Agenda Inteligente 📅" <' + process.env.EMAIL_USER + '>',
          to: task.user.email,
          subject: `🔔 Recordatorio: ${task.title}`,
          html: getHtmlTemplate('Recordatorio de Tarea', '#3b82f6', htmlContent)
        });
        console.log(`✅ Correo Tarea enviado a ${task.user.email}`);
      }

      // ==========================================
      // 2. RECORDATORIO DE VACUNAS 🐾 (Verde)
      // ==========================================
      const vaccinesDue = await prisma.vaccine.findMany({
        where: {
          nextDate: { gte: tomorrowStart, lte: tomorrowEnd }
        },
        include: {
          pet: { include: { user: true } }
        }
      });

      for (const vaccine of vaccinesDue) {
        if (!vaccine.pet.user.email) continue;

        const htmlContent = `
          <p style="font-size: 16px;">¡Hola! Es importante cuidar la salud de <strong>${vaccine.pet.name}</strong>.</p>
          
          <div style="background-color: #ecfdf5; border-left: 5px solid #10b981; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin: 0 0 5px 0; color: #065f46;">💉 Vacuna: ${vaccine.name}</h3>
            <p style="margin: 0; color: #047857;">Mascota: ${vaccine.pet.name} (${vaccine.pet.species})</p>
            <p style="margin-top: 10px; font-weight: bold; color: #059669;">
              📅 Fecha programada: Mañana
            </p>
          </div>
          
          <p style="text-align: center; color: #6b7280; font-size: 14px;">Por favor, no olvides llevarlo al veterinario.</p>
        `;

        await transporter.sendMail({
          from: '"Veterinaria Agenda 🐾" <' + process.env.EMAIL_USER + '>',
          to: vaccine.pet.user.email,
          subject: `🐾 Vacuna pendiente para ${vaccine.pet.name}`,
          html: getHtmlTemplate('Salud de Mascota', '#10b981', htmlContent)
        });
        console.log(`✅ Correo Vacuna enviado a ${vaccine.pet.user.email}`);
      }

      // ==========================================
      // 3. ALERTA DE FINANZAS 💰 (Naranja/Rojo)
      // ==========================================
      const allUsers = await prisma.user.findMany({
        include: { finances: true }
      });

      for (const user of allUsers) {
        if (!user.email) continue;

        const income = user.finances
          .filter(t => t.type === "INCOME")
          .reduce((acc, t) => acc + Number(t.amount), 0);
          
        const expense = user.finances
          .filter(t => t.type === "EXPENSE")
          .reduce((acc, t) => acc + Number(t.amount), 0);

        const balance = income - expense;

        if (balance < 50 && balance > 0) {
           const htmlContent = `
            <p style="font-size: 16px;">Hemos detectado que tu balance está bajando.</p>
            
            <div style="background-color: #fffbeb; border-left: 5px solid #f59e0b; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #92400e; font-size: 14px; text-transform: uppercase; font-weight: bold;">Saldo Actual</p>
              <h2 style="margin: 5px 0; color: #b45309; font-size: 36px;">S/ ${balance.toFixed(2)}</h2>
              <p style="margin: 0; color: #b45309; font-size: 14px;">Ten cuidado con los gastos hormiga 🐜</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/finance" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver Finanzas</a>
            </div>
          `;

          await transporter.sendMail({
            from: '"Finanzas Agenda 📉" <' + process.env.EMAIL_USER + '>',
            to: user.email,
            subject: `⚠️ Alerta: Saldo bajo (S/ ${balance.toFixed(2)})`,
            html: getHtmlTemplate('Control Financiero', '#f59e0b', htmlContent)
          });
          console.log(`✅ Correo Finanzas enviado a ${user.email}`);
        }
      }

    } catch (error) {
      console.error("🔥 Error en Cron Job General:", error);
    }
  }, {
    timezone: "America/Lima" // <--- MEJORA 1: Zona Horaria Forzada
  });
};