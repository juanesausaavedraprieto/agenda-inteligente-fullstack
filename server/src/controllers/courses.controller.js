import prisma from '../lib/prisma.js';

// 1. OBTENER CURSOS (Con cálculo de promedio)
export const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { userId: req.user.id },
      include: { grades: true }, // Traer las notas de cada curso
      orderBy: { cycle: 'desc' } // Lo más actual primero
    });

    // Procesar cada curso para calcular su promedio
    const coursesWithAverage = courses.map(course => {
      let totalWeight = 0;
      let weightedSum = 0;

      course.grades.forEach(grade => {
        weightedSum += grade.score * (grade.weight / 100); // Peso viene en % (ej: 30)
        totalWeight += grade.weight;
      });

      // Si no hay notas, promedio es 0. Si hay, redondeamos a 1 decimal.
      const average = totalWeight > 0 ? (weightedSum).toFixed(1) : 0;
      
      return { ...course, average };
    });

    res.json(coursesWithAverage);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cursos" });
  }
};

// 2. CREAR CURSO
export const createCourse = async (req, res) => {
  try {
    const { name, credits, cycle } = req.body;
    
    const newCourse = await prisma.course.create({
      data: {
        name,
        credits: parseInt(credits),
        cycle: parseInt(cycle),
        userId: req.user.id
      }
    });
    res.json(newCourse);
  } catch (error) {
    res.status(500).json({ message: "Error al crear curso" });
  }
};

// 3. AGREGAR NOTA
export const addGrade = async (req, res) => {
  try {
    const { name, score, weight, courseId } = req.body;

    const newGrade = await prisma.grade.create({
      data: {
        name, // Ej: "Parcial 1"
        score: parseFloat(score),
        weight: parseFloat(weight), // Ej: 30 (porciento)
        courseId
      }
    });
    res.json(newGrade);
  } catch (error) {
    res.status(500).json({ message: "Error al agregar nota" });
  }
};

// 4. BORRAR CURSO
export const deleteCourse = async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar curso" });
  }
};
export const updateCourse = async (req, res) => {
  try {
    const { name, credits, cycle } = req.body;
    const updatedCourse = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        name,
        credits: parseInt(credits),
        cycle: parseInt(cycle)
      }
    });
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar curso" });
  }
};

export const updateGrade = async (req, res) => {
  try {
    const { name, score, weight } = req.body;
    const updatedGrade = await prisma.grade.update({
      where: { id: req.params.id },
      data: {
        name,
        score: parseFloat(score),
        weight: parseFloat(weight)
      }
    });
    res.json(updatedGrade);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar nota" });
  }
};