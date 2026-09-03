import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';
import { createHash, randomBytes } from 'node:crypto';

import { Prisma, type User } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import type { LoginInput } from './login.schema.js';
import type { RegistrationInput } from './registration.schema.js';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = 'habit_shaper_session';

export type PublicUser = Pick<User, 'id' | 'email' | 'timezone'>;

export interface RegistrationResult {
  user: PublicUser;
  sessionToken: string;
  expiresAt: Date;
}

export type LoginResult = RegistrationResult;

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async register(input: RegistrationInput): Promise<RegistrationResult> {
    const passwordHash = await hash(input.password, { type: argon2id });
    const { sessionToken, tokenHash, expiresAt } = this.createSessionValues();

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

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, timezone: true, passwordHash: true },
    });

    if (!user || !(await verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email or password is incorrect.',
        },
      });
    }

    const { sessionToken, tokenHash, expiresAt } = this.createSessionValues();
    await this.prisma.session.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return {
      user: { id: user.id, email: user.email, timezone: user.timezone },
      sessionToken,
      expiresAt,
    };
  }

  async findUserBySessionToken(
    sessionToken: string,
  ): Promise<PublicUser | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        tokenHash: this.hashSessionToken(sessionToken),
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
      select: {
        user: { select: { id: true, email: true, timezone: true } },
      },
    });

    return session?.user ?? null;
  }

  async revokeSession(sessionToken: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        tokenHash: this.hashSessionToken(sessionToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private createSessionValues(): {
    sessionToken: string;
    tokenHash: string;
    expiresAt: Date;
  } {
    const sessionToken = randomBytes(32).toString('base64url');

    return {
      sessionToken,
      tokenHash: this.hashSessionToken(sessionToken),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    };
  }

  private hashSessionToken(sessionToken: string): string {
    return createHash('sha256').update(sessionToken).digest('hex');
  }
}
