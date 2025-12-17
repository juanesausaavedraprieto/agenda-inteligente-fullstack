import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. REGISTRO
export const register = async (req, res) => {
  try {
    const { name, email, password, dni, sex, birthDate } = req.body;

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json(["El usuario ya existe"]); // Array para que Zod lo maneje igual en el front

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

    // Crear Token JWT
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '7d',
    });

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

    // Generar Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '7d',
    });

    res.json({ 
      message: "Login exitoso", 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. LOGOUT (Cierre de sesión)
export const logout = (req, res) => {
    // Como el token se guarda en el Frontend (localStorage), 
    // el backend solo responde OK. Si usaras cookies, aquí se borrarían.
    res.sendStatus(200);
};

// 4. PERFIL (Profile)
export const profile = async (req, res) => {
    // req.user lo pone el middleware authRequired
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

// 5. VERIFICAR TOKEN (Para que el frontend sepa si sigues logueado al recargar)
export const verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No autorizado" });

  jwt.verify(token, process.env.JWT_SECRET || 'secret123', async (err, user) => {
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