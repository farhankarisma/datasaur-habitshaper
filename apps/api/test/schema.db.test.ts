import { PrismaMariaDb } from '@prisma/adapter-mariadb';

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

async function clearDatabase(): Promise<void> {
  await prisma.goal.deleteMany();
  await prisma.relapse.deleteMany();
  await prisma.buildCompletion.deleteMany();
  await prisma.habitPeriod.deleteMany();
  await prisma.session.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(email: string) {
  return prisma.user.create({
    data: {
      email,
      passwordHash: 'argon2id-hash-placeholder',
      timezone: 'Asia/Jakarta',
    },
  });
}

describe('initial database schema', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('rejects duplicate normalized emails and session token hashes', async () => {
    const user = await createUser('person@example.com');

    await expect(createUser('person@example.com')).rejects.toThrow();

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: 'a'.repeat(64),
        expiresAt: new Date('2026-09-03T00:00:00.000Z'),
      },
    });

    await expect(
      prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: 'a'.repeat(64),
          expiresAt: new Date('2026-09-04T00:00:00.000Z'),
        },
      }),
    ).rejects.toThrow();
  });

  it('rejects orphaned records through foreign keys', async () => {
    await expect(
      prisma.session.create({
        data: {
          userId: '00000000-0000-0000-0000-000000000000',
          tokenHash: 'b'.repeat(64),
          expiresAt: new Date('2026-09-03T00:00:00.000Z'),
        },
      }),
    ).rejects.toThrow();
  });

  it('rejects duplicate build completions and relapses per local date', async () => {
    const user = await createUser('tracking@example.com');
    const buildHabit = await prisma.habit.create({
      data: { userId: user.id, name: 'Read', type: 'BUILD' },
    });
    const quitHabit = await prisma.habit.create({
      data: { userId: user.id, name: 'Doomscrolling', type: 'QUIT' },
    });
    const localDate = new Date('2026-09-02T00:00:00.000Z');

    await prisma.buildCompletion.create({
      data: { habitId: buildHabit.id, completedOn: localDate },
    });
    await prisma.relapse.create({
      data: { habitId: quitHabit.id, relapsedOn: localDate },
    });

    await expect(
      prisma.buildCompletion.create({
        data: { habitId: buildHabit.id, completedOn: localDate },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.relapse.create({
        data: { habitId: quitHabit.id, relapsedOn: localDate },
      }),
    ).rejects.toThrow();
  });

  it('allows only one active goal slot per habit', async () => {
    const user = await createUser('goals@example.com');
    const habit = await prisma.habit.create({
      data: { userId: user.id, name: 'Meditate', type: 'BUILD' },
    });

    await prisma.goal.create({
      data: { habitId: habit.id, targetDays: 7, activeSlot: 1 },
    });

    await expect(
      prisma.goal.create({
        data: { habitId: habit.id, targetDays: 14, activeSlot: 1 },
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid goal targets, active slots, and tracking periods', async () => {
    const user = await createUser('checks@example.com');
    const habit = await prisma.habit.create({
      data: { userId: user.id, name: 'Exercise', type: 'BUILD' },
    });

    await expect(
      prisma.goal.create({
        data: { habitId: habit.id, targetDays: 0, activeSlot: 1 },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.goal.create({
        data: { habitId: habit.id, targetDays: 7, activeSlot: 2 },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.habitPeriod.create({
        data: {
          habitId: habit.id,
          startedOn: new Date('2026-09-02T00:00:00.000Z'),
          endedOn: new Date('2026-09-01T00:00:00.000Z'),
        },
      }),
    ).rejects.toThrow();
  });
});
