import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
  try {
    // 1. Buscamos el token en Cookies O en Headers
    const { token } = req.cookies; // Gracias a cookie-parser
    const authHeader = req.headers.authorization;

    // Decidimos cuál usar
    let tokenToVerify = null;

    if (token) {
        tokenToVerify = token;
    } else if (authHeader) {
        // Limpiamos "Bearer " si viene en el header
        tokenToVerify = authHeader.startsWith("Bearer ") 
            ? authHeader.slice(7) 
            : authHeader;
    }

    // 2. Si no encontramos nada en ningún lado -> Error
    if (!tokenToVerify) {
      return res.status(401).json({ message: "Autorización denegada: No hay token" });
    }

    // 3. Verificar el token
    jwt.verify(tokenToVerify, process.env.JWT_SECRET || 'secret123', (err, user) => {
      if (err) return res.status(403).json({ message: "Token inválido" });

      req.user = user;
      next();
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};