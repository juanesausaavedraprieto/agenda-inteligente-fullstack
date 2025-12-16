// server/src/controllers/dashboard.controller.js
import prisma from '../lib/prisma.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // 1. Tareas Urgentes (Vencen pronto y no están completas)
    const urgentTasks = await prisma.task.findMany({
      where: {
        userId,
        isCompleted: false,
        priority: { in: ['HIGH', 'PANIC'] } // Solo Alta y Pánico
      },
      take: 5, // Solo dame las 5 más importantes
      orderBy: { dueDate: 'asc' }
    });

    // 2. Resumen Financiero (Ingresos vs Gastos del mes actual)
    // (Nota: Esto funcionará cuando tengas datos en la tabla Transaction)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth }
      }
    });

    // Calculamos totales con JS (rápido y fácil)
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Próximas Vacunas (Mascotas)
    const upcomingVaccines = await prisma.vaccine.findMany({
      where: {
        pet: { userId }, // Relación anidada: Vacuna -> Mascota -> Usuario
        nextDate: { gte: now } // Fechas futuras
      },
      take: 3,
      include: { pet: true }, // Incluir el nombre de la mascota
      orderBy: { nextDate: 'asc' }
    });

    // Enviamos el Paquete Completo 📦
    res.json({
      stats: {
        pendingTasks: urgentTasks.length,
        balance: income - expense,
        nextVaccine: upcomingVaccines[0]?.nextDate || null
      },
      urgentTasks,
      upcomingVaccines
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo dashboard" });
  }
};