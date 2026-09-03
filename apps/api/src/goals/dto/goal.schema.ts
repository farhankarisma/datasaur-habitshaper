import { z } from 'zod';

export const createGoalSchema = z
  .object({
    habitId: z.uuid(),
    targetDays: z.number().int().min(1).max(36_500),
  })
  .strict();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
