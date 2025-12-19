import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Necesario solo para verifyToken
import { OAuth2Client } from 'google-auth-library';
import { createAccessToken } from '../lib/jwt.js'; // 👈 IMPORTANTE: Tu nueva función

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const TOKEN_SECRET = process.env.JWT_SECRET || 'secret123';

// 1. REGISTRO
export const register = async (req, res) => {
  try {
    const { name, email, password, dni, sex, birthDate } = req.body;

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json(["El usuario ya existe"]);

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar en DB
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dni, 
        sex,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    // ✅ MEJORA: Usamos la función helper
    const token = await createAccessToken({ id: newUser.id });

    res.status(201).json({ 
      message: "Usuario creado exitosamente", 
      token, 
      user: { id: newUser.id, name: newUser.name, email: newUser.email } 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json(["Credenciales inválidas"]);

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json(["Credenciales inválidas"]);

    // ✅ MEJORA: Usamos la función helper
    const token = await createAccessToken({ id: user.id });

    res.json({ 
      message: "Login exitoso", 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. LOGOUT
export const logout = (req, res) => {
    res.sendStatus(200);
};

// 4. PERFIL
export const profile = async (req, res) => {
    const userFound = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });

    return res.json({
        id: userFound.id,
        name: userFound.name,
        email: userFound.email,
        dni: userFound.dni,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
    });
};

// 5. VERIFICAR TOKEN
export const verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No autorizado" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "No autorizado" });

    const userFound = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userFound) return res.status(401).json({ message: "No autorizado" });

    return res.json({
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
    });
  });
};

// 6. LOGIN CON GOOGLE
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // Verificar token con Google
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email } = ticket.getPayload();

    // Buscar o Crear usuario
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name, // Asegúrate de que tu modelo use 'name' o 'username'
          email: email,
          password: "", 
          // Si tienes username en tu schema y es unique, genera uno o usa el email
          // username: email.split('@')[0] 
        }
      });
    }

    // ✅ MEJORA: Usamos la función helper
    const accessToken = await createAccessToken({ id: user.id });

    // NOTA: Si usas cookies, descomenta esto, si usas headers, manda el token en el json
    // res.cookie("token", accessToken);

    res.json({
      token: accessToken, // Devolvemos el token para que el front lo guarde
      user: {
          id: user.id,
          name: user.name,
          email: user.email,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en autenticación con Google" });
  }
};