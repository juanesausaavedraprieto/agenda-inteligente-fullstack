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
        priority: { in: ['HIGH', 'PANIC'] }
      },
      take: 5,
      orderBy: { dueDate: 'asc' }
    });

    // 2. Resumen Financiero (Ingresos vs Gastos del mes actual)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth }
      }
    });

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Próximas Vacunas (Mascotas)
    const upcomingVaccines = await prisma.vaccine.findMany({
      where: {
        pet: { userId },
        nextDate: { gte: now }
      },
      take: 3,
      include: { pet: true },
      orderBy: { nextDate: 'asc' }
    });

    // --- NUEVO: BUSCAR LA PRIMERA MASCOTA (Para mostrar en la tarjeta grande) ---
    const firstPet = await prisma.pet.findFirst({
      where: { userId },     // Solo mis mascotas
      orderBy: { createdAt: 'asc' }, // La más antigua (la primera que registraste)
      include: { vaccines: true }    // Traer sus vacunas para ver si le toca alguna
    });
    // ---------------------------------------------------------------------------

    // Enviamos el Paquete Completo 📦
    res.json({
      stats: {
        pendingTasks: urgentTasks.length,
        balance: income - expense,
        nextVaccine: upcomingVaccines[0]?.nextDate || null
      },
      urgentTasks,
      upcomingVaccines,
      firstPet // <--- ¡AQUÍ ESTÁ EL DATO NUEVO!
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo dashboard" });
  }
};