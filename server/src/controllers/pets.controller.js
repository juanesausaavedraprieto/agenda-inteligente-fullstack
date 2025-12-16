import prisma from '../lib/prisma.js';

// 1. Obtener todas mis mascotas (con sus vacunas)
export const getPets = async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { userId: req.user.id },
      include: { vaccines: true } // Traer también el historial médico
    });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener mascotas" });
  }
};

// 2. Registrar nueva mascota
export const createPet = async (req, res) => {
  try {
    const { name, species, breed, birthDate } = req.body;
    const newPet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        birthDate: birthDate ? new Date(birthDate) : null,
        userId: req.user.id
      },
      // --- AGREGA ESTO AQUÍ ---
      include: { 
        vaccines: true 
      } 
      // Esto fuerza a que devuelva "vaccines: []" en lugar de nada
    });
    res.json(newPet);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar mascota" });
  }
};

// 3. Registrar Vacuna
export const addVaccine = async (req, res) => {
  try {
    const { name, appliedDate, nextDate, petId } = req.body;
    
    // Verificar que la mascota sea del usuario (Seguridad)
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso sobre esta mascota" });
    }

    const vaccine = await prisma.vaccine.create({
      data: {
        name,
        appliedDate: new Date(appliedDate),
        nextDate: new Date(nextDate), // ESTA FECHA ES LA IMPORTANTE PARA EL DASHBOARD
        petId
      }
    });
    res.json(vaccine);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al registrar vacuna" });
  }
};

// 4. Borrar Mascota
export const deletePet = async (req, res) => {
    try {
        await prisma.pet.delete({
            where: { id: req.params.id, userId: req.user.id }
        });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
    }
}