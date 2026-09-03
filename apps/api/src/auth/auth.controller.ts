import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AuthService, type PublicUser } from './auth.service.js';
import { loginSchema } from './login.schema.js';
import { registrationSchema } from './registration.schema.js';
import { setSessionCookie } from './session-cookie.js';
import { SessionGuard } from './session.guard.js';

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

    setSessionCookie(reply, result.sessionToken, result.expiresAt);

    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<RegistrationResponse> {
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The login details are invalid.',
          details: parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            reason: issue.message,
          })),
        },
      });
    }

    const result = await this.authService.login(parsed.data);
    setSessionCookie(reply, result.sessionToken, result.expiresAt);

    return { user: result.user };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() request: FastifyRequest): RegistrationResponse {
    return { user: request.habitShaperUser! };
  }
}
