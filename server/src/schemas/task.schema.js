import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string({
    required_error: "El título es requerido",
  }).min(1, {
    message: "El título no puede estar vacío",
  }),

  description: z.string().optional(),

  date: z.string().datetime().optional(), // Validar que sea formato fecha ISO si viene
  
  // Enums para asegurar que no manden tipos inventados
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "PANIC"]).optional(),
  type: z.enum(["TASK", "EXAM", "EVENT", "HOMEWORK"]).optional(),
});