import prisma from '../lib/prisma.js';

// 1. OBTENER LISTA (Del mes actual)
export const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' } // Lo más reciente primero
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener movimientos" });
  }
};

// 2. CREAR MOVIMIENTO
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    // Convertir el monto a número (por si viene como string)
    const amountFloat = parseFloat(amount);

    const newTransaction = await prisma.transaction.create({
      data: {
        amount: amountFloat,
        type, // "INCOME" o "EXPENSE"
        category,
        description,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id
      }
    });

    res.json(newTransaction);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al guardar movimiento" });
  }
};

// 3. BORRAR
export const deleteTransaction = async (req, res) => {
  try {
    await prisma.transaction.delete({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, date, type, category } = req.body;

    // Verificar que la transacción exista y sea del usuario
    const transaction = await prisma.transaction.findFirst({
        where: { id: id, userId: req.user.id }
    });

    if (!transaction) return res.status(404).json({ message: "Movimiento no encontrado" });

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        description,
        amount: parseFloat(amount), // Asegurar que sea número
        date: new Date(date),       // Asegurar formato fecha
        type,
        category
      },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar movimiento" });
  }
};