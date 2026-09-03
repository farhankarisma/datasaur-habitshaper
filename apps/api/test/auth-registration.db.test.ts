import { ConflictException } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { verify } from 'argon2';

import { AuthService } from '../src/auth/auth.service.js';
import { registrationSchema } from '../src/auth/registration.schema.js';
import type { PrismaService } from '../src/database/prisma.service.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

function requiredEnvironment(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for database tests`);
  }

  return value;
}

const adapter = new PrismaMariaDb({
  host: requiredEnvironment('DATABASE_HOST'),
  port: Number(requiredEnvironment('DATABASE_PORT')),
  user: requiredEnvironment('DATABASE_USER'),
  password: requiredEnvironment('DATABASE_PASSWORD'),
  database: requiredEnvironment('DATABASE_NAME'),
  connectionLimit: 1,
});
const prisma = new PrismaClient({ adapter });
const service = new AuthService(prisma as unknown as PrismaService);

describe('user registration', () => {
  let userId: string | undefined;

  afterEach(async () => {
    if (userId) {
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
      userId = undefined;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('persists a normalized user and hashed session token atomically', async () => {
    const input = registrationSchema.parse({
      email: ' AUTH-INTEGRATION@example.com ',
      password: 'correct horse battery staple',
      timezone: 'Asia/Jakarta',
    });
    const result = await service.register(input);
    userId = result.user.id;

    const persisted = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { sessions: true },
    });

    expect(persisted.email).toBe('auth-integration@example.com');
    await expect(
      verify(persisted.passwordHash, 'correct horse battery staple'),
    ).resolves.toBe(true);
    expect(persisted.sessions).toHaveLength(1);
    expect(persisted.sessions[0]?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(persisted.sessions[0]?.tokenHash).not.toBe(result.sessionToken);

    await expect(service.register(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
