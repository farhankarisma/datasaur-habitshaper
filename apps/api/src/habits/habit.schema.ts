import { z } from 'zod';
export const createHabitSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    type: z.enum(['BUILD', 'QUIT']),
  })
  .strict();

export const renameHabitSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
  })
  .strict();

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type RenameHabitInput = z.infer<typeof renameHabitSchema>;
