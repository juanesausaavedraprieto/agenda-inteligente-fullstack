import prisma from '../lib/prisma.js';

// 1. OBTENER NOTAS
export const getNotes = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' } // Las recién editadas primero
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notas" });
  }
};

// 2. CREAR NOTA
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        userId: req.user.id
      }
    });
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Error al crear nota" });
  }
};

// 3. EDITAR NOTA (Auto-guardado)
export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedNote = await prisma.note.update({
      where: { id: req.params.id },
      data: { title, content }
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar nota" });
  }
};

// 4. BORRAR NOTA
export const deleteNote = async (req, res) => {
  try {
    await prisma.note.delete({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar nota" });
  }
};