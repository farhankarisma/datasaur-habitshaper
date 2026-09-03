import { ConflictException } from '@nestjs/common';
import { verify } from 'argon2';

import type { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  it('hashes secrets and creates the user and session in one transaction', async () => {
    interface UserCreateArgs {
      data: { email: string; passwordHash: string; timezone: string };
    }

    interface SessionCreateArgs {
      data: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
      };
    }

    const userCreate = vi.fn(async ({ data }: UserCreateArgs) => ({
      id: 'user-1',
      email: data.email,
      timezone: data.timezone,
    }));
    const sessionCreate = vi.fn(async (args: SessionCreateArgs) => {
      void args;
    });
    const transaction = {
      user: { create: userCreate },
      session: { create: sessionCreate },
    };
    const runTransaction = vi.fn(
      async (callback: (value: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );
    const service = new AuthService({
      $transaction: runTransaction,
    } as unknown as PrismaService);

    const result = await service.register({
      email: 'farhan@example.com',
      password: 'correct horse battery staple',
      timezone: 'Asia/Jakarta',
    });

    const userData = userCreate.mock.calls[0]![0].data;
    const sessionData = sessionCreate.mock.calls[0]![0].data;

    expect(runTransaction).toHaveBeenCalledOnce();
    expect(userData.passwordHash).not.toBe('correct horse battery staple');
    await expect(
      verify(userData.passwordHash, 'correct horse battery staple'),
    ).resolves.toBe(true);
    expect(sessionData.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(sessionData.tokenHash).not.toBe(result.sessionToken);
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'farhan@example.com',
      timezone: 'Asia/Jakarta',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('maps a unique email violation to a conflict', async () => {
    const duplicateError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { target: ['email'] },
      },
    );
    const service = new AuthService({
      $transaction: vi.fn().mockRejectedValue(duplicateError),
    } as unknown as PrismaService);

    await expect(
      service.register({
        email: 'farhan@example.com',
        password: 'correct horse battery staple',
        timezone: 'Asia/Jakarta',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
