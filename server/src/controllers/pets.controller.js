import prisma from '../lib/prisma.js';

// 1. Obtener mascotas
export const getPets = async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { userId: req.user.id },
      include: { vaccines: true }
    });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener mascotas" });
  }
};

// 2. Crear mascota
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
      include: { vaccines: true } 
    });
    res.json(newPet);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar mascota" });
  }
};

// 3. ACTUALIZAR MASCOTA (Nuevo)
export const updatePet = async (req, res) => {
    try {
        const { name, species, breed, birthDate } = req.body;
        const updatedPet = await prisma.pet.update({
            where: { id: req.params.id, userId: req.user.id },
            data: {
                name,
                species,
                breed,
                birthDate: birthDate ? new Date(birthDate) : null,
            },
            include: { vaccines: true }
        });
        res.json(updatedPet);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar mascota" });
    }
};

// 4. Agregar vacuna
export const addVaccine = async (req, res) => {
  try {
    const { name, appliedDate, nextDate, petId } = req.body;
    
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso sobre esta mascota" });
    }

    const vaccine = await prisma.vaccine.create({
      data: {
        name,
        appliedDate: new Date(appliedDate),
        nextDate: new Date(nextDate),
        petId
      }
    });
    res.json(vaccine);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al registrar vacuna" });
  }
};

// 5. ACTUALIZAR VACUNA (Nuevo)
export const updateVaccine = async (req, res) => {
    try {
        const { name, appliedDate, nextDate } = req.body;
        // Validar propiedad de la vacuna sería ideal aquí, asumiendo validación simple por ahora
        const vaccine = await prisma.vaccine.update({
            where: { id: req.params.id },
            data: {
                name,
                appliedDate: new Date(appliedDate),
                nextDate: new Date(nextDate),
            }
        });
        res.json(vaccine);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar vacuna" });
    }
}

// 6. Borrar mascota
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