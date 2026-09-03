import { z } from 'zod';

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const registrationSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(8).max(128),
    timezone: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .refine(isValidTimeZone, 'Must be a valid IANA timezone'),
  })
  .strict();

export type RegistrationInput = z.infer<typeof registrationSchema>;
