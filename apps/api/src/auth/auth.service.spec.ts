import { ConflictException } from '@nestjs/common';
import { hash, verify } from 'argon2';

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

  it('creates a new opaque session after verifying valid credentials', async () => {
    const passwordHash = await hash('correct horse battery staple');
    const findUnique = vi.fn().mockResolvedValue({
      id: 'user-1',
      email: 'farhan@example.com',
      timezone: 'Asia/Jakarta',
      passwordHash,
    });
    const create = vi.fn();
    const service = new AuthService({
      user: { findUnique },
      session: { create },
    } as unknown as PrismaService);

    const result = await service.login({
      email: 'farhan@example.com',
      password: 'correct horse battery staple',
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'farhan@example.com' },
      select: { id: true, email: true, timezone: true, passwordHash: true },
    });
    expect(create.mock.calls[0]![0].data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(create.mock.calls[0]![0].data.tokenHash).not.toBe(
      result.sessionToken,
    );
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'farhan@example.com',
      timezone: 'Asia/Jakarta',
    });
  });

  it('returns the same generic failure for a missing user or bad password', async () => {
    const missingUserService = new AuthService({
      user: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaService);
    const wrongPasswordService = new AuthService({
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'farhan@example.com',
          timezone: 'Asia/Jakarta',
          passwordHash: await hash('correct horse battery staple'),
        }),
      },
    } as unknown as PrismaService);

    await expect(
      missingUserService.login({
        email: 'farhan@example.com',
        password: 'incorrect password',
      }),
    ).rejects.toMatchObject({
      response: { error: { code: 'INVALID_CREDENTIALS' } },
    });
    await expect(
      wrongPasswordService.login({
        email: 'farhan@example.com',
        password: 'incorrect password',
      }),
    ).rejects.toMatchObject({
      response: { error: { code: 'INVALID_CREDENTIALS' } },
    });
  });

  it('returns a user only for an active, unrevoked session', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'farhan@example.com',
        timezone: 'Asia/Jakarta',
      },
    });
    const service = new AuthService({
      session: { findFirst },
    } as unknown as PrismaService);

    await expect(
      service.findUserBySessionToken('raw-session-token'),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'farhan@example.com',
      timezone: 'Asia/Jakarta',
    });
    expect(findFirst.mock.calls[0]![0].where).toMatchObject({
      revokedAt: null,
    });
    expect(findFirst.mock.calls[0]![0].where.tokenHash).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(findFirst.mock.calls[0]![0].where.expiresAt.gt).toBeInstanceOf(Date);
  });
});
