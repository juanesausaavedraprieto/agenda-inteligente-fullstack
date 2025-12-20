import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import { OAuth2Client } from 'google-auth-library';
import { createAccessToken } from '../lib/jwt.js'; 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const TOKEN_SECRET = process.env.JWT_SECRET || 'secret123';

// Función auxiliar para limpiar el usuario antes de enviarlo (Quitar password)
const returnUser = (user) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni,           // <--- ESTO FALTABA
        sex: user.sex,           // <--- ESTO FALTABA
        birthDate: user.birthDate, // <--- ESTO FALTABA
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

// 1. REGISTRO
export const register = async (req, res) => {
  try {
    const { name, email, password, dni, sex, birthDate } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json(["El usuario ya existe"]);

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const token = await createAccessToken({ id: newUser.id });

    res.status(201).json({ 
      message: "Usuario creado exitosamente", 
      token, 
      user: returnUser(newUser) // Usamos la función auxiliar
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json(["Credenciales inválidas"]);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json(["Credenciales inválidas"]);

    const token = await createAccessToken({ id: user.id });

    res.json({ 
      message: "Login exitoso", 
      token, 
      user: returnUser(user) // Usamos la función auxiliar
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. LOGOUT
export const logout = (req, res) => {
    res.sendStatus(200);
};

// 4. PERFIL (Lectura directa)
export const profile = async (req, res) => {
    const userFound = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });

    return res.json(returnUser(userFound));
};

// 5. VERIFICAR TOKEN (Aquí estaba el error principal) 🚨
export const verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No autorizado" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "No autorizado" });

    const userFound = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userFound) return res.status(401).json({ message: "No autorizado" });

    // ANTES: solo devolvías id, name, email. 
    // AHORA: devolvemos todo (dni, sex, birthDate).
    return res.json(returnUser(userFound)); 
  });
};

// 6. LOGIN CON GOOGLE
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email } = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: "", 
        }
      });
    }

    const accessToken = await createAccessToken({ id: user.id });

    res.json({
      token: accessToken,
      user: returnUser(user) // Devolvemos el usuario completo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en autenticación con Google" });
  }
};

// 7. ACTUALIZAR PERFIL
export const updateProfile = async (req, res) => {
  try {
    const { name, dni, sex, birthDate } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        dni,
        // Prisma a veces necesita que null sea explícito si el campo es opcional
        sex: sex || null, 
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    res.json(returnUser(updatedUser));

  } catch (error) {
    console.error(error); // Ver error en consola del backend si falla
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};