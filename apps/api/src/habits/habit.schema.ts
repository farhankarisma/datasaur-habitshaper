import { z } from 'zod';
export const createHabitSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    type: z.enum(['BUILD', 'QUIT']),
  })
  .strict();
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
