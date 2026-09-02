import { z } from 'zod';

const environmentSchema = z.object({
  DATABASE_URL: z
    .url()
    .refine((value) => new URL(value).protocol === 'mysql:', {
      message: 'must use the mysql:// protocol',
    }),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
});

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(source: NodeJS.ProcessEnv): Environment {
  const result = environmentSchema.safeParse({
    DATABASE_URL: source.DATABASE_URL,
    NODE_ENV: source.NODE_ENV,
    PORT: source.PORT,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment: ${details}`);
  }

  return result.data;
}
