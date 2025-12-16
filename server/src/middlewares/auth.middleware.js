// server/src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
  try {
    // 1. Buscar el token en los headers (o cookies)
    // Normalmente viene como "Bearer eyJhb..."
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token, autorización denegada" });
    }
    
    // Limpiamos el string "Bearer " si viene así, si no, usamos el token directo
    const tokenClean = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

    // 2. Verificar el token
    jwt.verify(tokenClean, process.env.JWT_SECRET || 'secret123', (err, user) => {
      if (err) return res.status(403).json({ message: "Token inválido" });

      // 3. ¡ÉXITO! Guardamos al usuario en el objeto req
      req.user = user; 
      next(); // Continúa a la siguiente función (el controlador)
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};