import type { FastifyReply } from 'fastify';

import { SESSION_COOKIE_NAME } from './auth.service.js';

export function setSessionCookie(
  reply: FastifyReply,
  sessionToken: string,
  expiresAt: Date,
): void {
  reply.setCookie(SESSION_COOKIE_NAME, sessionToken, {
    expires: expiresAt,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
