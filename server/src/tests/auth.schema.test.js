import { describe, it, expect } from 'vitest';
import { registerSchema } from '../schemas/auth.schema.js';

describe('Validación de Registro (Zod)', () => {
  
  it('Debe fallar si el email es inválido', () => {
    // Datos de prueba incorrectos
    const badData = {
      name: "Juan",
      email: "juan-sin-arroba", // Email malo
      password: "password123"
    };

    // Intentamos validar
    const result = registerSchema.safeParse(badData);

    // Esperamos que falle (success: false)
    expect(result.success).toBe(false);
    // Esperamos que el error mencione el email
    expect(result.error.issues[0].message).toBe("Email inválido");
  });

  it('Debe fallar si la contraseña es muy corta', () => {
    const badData = {
      name: "Juan",
      email: "juan@gmail.com",
      password: "123" // Muy corta (definimos min 6)
    };

    const result = registerSchema.safeParse(badData);

    expect(result.success).toBe(false);
    // Zod por defecto devuelve un mensaje, verificamos que falle
    expect(result.error).toBeDefined();
  });

  it('Debe pasar si los datos son correctos', () => {
    const goodData = {
      name: "Juan Senior",
      email: "juan@senior.com",
      password: "PasswordSeguro123",
      dni: "12345678",
      sex: "M",
      birthDate: "2000-01-01"
    };

    const result = registerSchema.safeParse(goodData);

    // Esperamos éxito
    expect(result.success).toBe(true);
  });
});