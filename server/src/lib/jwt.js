import jwt from "jsonwebtoken";

// Usa tu clave secreta del .env o una por defecto
const TOKEN_SECRET = process.env.JWT_SECRET || 'secret123';

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      {
        expiresIn: "7d", // La duración que prefieras
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}