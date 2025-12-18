import { z } from "zod";

export const healthProfileSchema = z.object({
  weight: z.number({
    required_error: "El peso es requerido",
    invalid_type_error: "El peso debe ser un número",
  }).min(1, "El peso debe ser mayor a 0"),
  
  height: z.number({
    required_error: "La altura es requerida",
    invalid_type_error: "La altura debe ser un número (cm)",
  }).min(30, "La altura debe ser válida (min 30cm)"),
});

export const diseaseSchema = z.object({
  name: z.string({
    required_error: "El nombre de la condición es requerido",
  }).min(2, "El nombre es muy corto"),
  
  description: z.string().optional(),
  
  diagnosedDate: z.string().optional(), // Puede venir como string ISO
});