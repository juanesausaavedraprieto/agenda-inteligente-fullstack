export const validateSchema = (schema) => (req, res, next) => {
  try {
    // Intenta validar lo que llega en req.body contra el esquema (reglas)
    schema.parse(req.body);
    next(); // Si todo está bien, deja pasar a la siguiente función
  } catch (error) {
    // Si hay error, devuelve un array con los mensajes de fallo
    return res.status(400).json(
      error.errors.map((err) => err.message) // Ej: ["El email es inválido", "El título es muy corto"]
    );
  }
};