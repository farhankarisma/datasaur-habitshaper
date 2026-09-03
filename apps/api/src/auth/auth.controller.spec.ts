import { BadRequestException } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { AuthController } from './auth.controller.js';
import { type AuthService, SESSION_COOKIE_NAME } from './auth.service.js';

describe('AuthController', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets a protected cookie and returns only the public user', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const expiresAt = new Date('2026-10-03T00:00:00.000Z');
    const register = vi.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'farhan@example.com',
        timezone: 'Asia/Jakarta',
      },
      sessionToken: 'raw-session-token',
      expiresAt,
    });
    const setCookie = vi.fn();
    const controller = new AuthController({
      register,
    } as unknown as AuthService);

    const response = await controller.register(
      {
        email: ' FARHAN@example.com ',
        password: 'correct horse battery staple',
        timezone: 'Asia/Jakarta',
      },
      { setCookie } as unknown as FastifyReply,
    );

    expect(register).toHaveBeenCalledWith({
      email: 'farhan@example.com',
      password: 'correct horse battery staple',
      timezone: 'Asia/Jakarta',
    });
    expect(setCookie).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      'raw-session-token',
      {
        expires: expiresAt,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
    );
    expect(response).toEqual({
      user: {
        id: 'user-1',
        email: 'farhan@example.com',
        timezone: 'Asia/Jakarta',
      },
    });
  });

  it('rejects invalid input before calling the service', async () => {
    const register = vi.fn();
    const controller = new AuthController({
      register,
    } as unknown as AuthService);

    await expect(
      controller.register(
        { email: 'bad', password: 'short', timezone: 'invalid' },
        { setCookie: vi.fn() } as unknown as FastifyReply,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(register).not.toHaveBeenCalled();
  });
});
