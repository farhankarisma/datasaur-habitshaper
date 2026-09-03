import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { argon2id, hash } from 'argon2';
import { createHash, randomBytes } from 'node:crypto';

import { Prisma, type User } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import type { RegistrationInput } from './registration.schema.js';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = 'habit_shaper_session';

export type PublicUser = Pick<User, 'id' | 'email' | 'timezone'>;

export interface RegistrationResult {
  user: PublicUser;
  sessionToken: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async register(input: RegistrationInput): Promise<RegistrationResult> {
    const passwordHash = await hash(input.password, { type: argon2id });
    const sessionToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        const createdUser = await transaction.user.create({
          data: {
            email: input.email,
            passwordHash,
            timezone: input.timezone,
          },
          select: { id: true, email: true, timezone: true },
        });

        await transaction.session.create({
          data: {
            userId: createdUser.id,
            tokenHash,
            expiresAt,
          },
        });

        return createdUser;
      });

      return { user, sessionToken, expiresAt };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          error: {
            code: 'EMAIL_ALREADY_REGISTERED',
            message: 'An account with this email already exists.',
          },
        });
      }

      throw error;
    }
  }
}
