import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import {
  AuthService,
  SESSION_COOKIE_NAME,
  type PublicUser,
} from './auth.service.js';
import { registrationSchema } from './registration.schema.js';

export interface RegistrationResponse {
  user: PublicUser;
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<RegistrationResponse> {
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The registration details are invalid.',
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            reason: issue.message,
          })),
        },
      });
    }

    const result = await this.authService.register(parsed.data);

    reply.setCookie(SESSION_COOKIE_NAME, result.sessionToken, {
      expires: result.expiresAt,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { user: result.user };
  }
}
