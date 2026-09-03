import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import {
  AuthService,
  SESSION_COOKIE_NAME,
  type PublicUser,
} from './auth.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    habitShaperUser?: PublicUser;
  }
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const sessionToken = request.cookies[SESSION_COOKIE_NAME];
    const user = sessionToken
      ? await this.authService.findUserBySessionToken(sessionToken)
      : null;

    if (!user) {
      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Please sign in to continue.',
        },
      });
    }

    request.habitShaperUser = user;
    return true;
  }
}
