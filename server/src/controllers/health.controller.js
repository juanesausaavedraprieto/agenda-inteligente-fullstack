import prisma from '../lib/prisma.js';

// 1. OBTENER TODO (Perfil + Enfermedades)
export const getHealthData = async (req, res) => {
  try {
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user.id },
      include: { diseases: true } // Traemos también las enfermedades
    });

    // Si no tiene perfil aún, devolvemos null o un objeto vacío controlado
    if (!healthProfile) {
      return res.json({ 
        profile: null, 
        diseases: [] 
      });
    }

    res.json({
      profile: {
        weight: healthProfile.weight,
        height: healthProfile.height,
        bloodType: healthProfile.bloodType,
        imc: (healthProfile.weight / ((healthProfile.height/100) ** 2)).toFixed(1) // Calculamos IMC aquí también
      },
      diseases: healthProfile.diseases
    });

  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos de salud" });
  }
};

// 2. ACTUALIZAR O CREAR PERFIL (Peso/Altura)
export const updateHealthProfile = async (req, res) => {
  try {
    const { weight, height, bloodType } = req.body;

    // UPSERT: Magia pura. Crea si no existe, Actualiza si existe.
    const profile = await prisma.healthProfile.upsert({
      where: { userId: req.user.id },
      update: { 
        weight: parseFloat(weight), 
        height: parseFloat(height),
        bloodType 
      },
      create: { 
        userId: req.user.id,
        weight: parseFloat(weight), 
        height: parseFloat(height),
        bloodType 
      },
    });

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar perfil de salud" });
  }
};

// 3. AGREGAR ENFERMEDAD
export const addDisease = async (req, res) => {
  try {
    const { name, description, diagnosedDate } = req.body;

    // Primero necesitamos saber el ID del perfil de salud del usuario
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!healthProfile) {
      return res.status(400).json(["Primero debes guardar tu Peso y Altura"]);
    }

    const newDisease = await prisma.disease.create({
      data: {
        name,
        description,
        diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : null,
        healthProfileId: healthProfile.id
      }
    });

    res.json(newDisease);
  } catch (error) {
    res.status(500).json({ message: "Error al agregar condición" });
  }
};

// 4. ELIMINAR ENFERMEDAD
export const deleteDisease = async (req, res) => {
  try {
    // Verificamos que la enfermedad pertenezca al usuario (Seguridad)
    const disease = await prisma.disease.findFirst({
        where: { 
            id: req.params.id,
            healthProfile: { userId: req.user.id } // Join implícito para verificar dueño
        }
    });

    if (!disease) return res.status(404).json({ message: "Registro no encontrado" });

    await prisma.disease.delete({
      where: { id: req.params.id }
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};
// 5. ACTUALIZAR ENFERMEDAD (NUEVO)
export const updateDisease = async (req, res) => {
  try {
    const { name, description, diagnosedDate } = req.body;
    const { id } = req.params;

    // Verificar que el registro exista y pertenezca al usuario
    const existingDisease = await prisma.disease.findFirst({
        where: { 
            id: id,
            healthProfile: { userId: req.user.id } 
        }
    });

    if (!existingDisease) return res.status(404).json({ message: "Registro no encontrado" });

    const updatedDisease = await prisma.disease.update({
      where: { id },
      data: {
        name,
        description,
        diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : null,
      }
    });

    res.json(updatedDisease);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar condición" });
  }
};