import { NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../database/prisma.service.js';
import { HabitsService } from './habits.service.js';

describe('HabitsService', () => {
  it('renames an active habit owned by the current user', async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: 'habit-1' });
    const update = vi.fn().mockResolvedValue({
      id: 'habit-1',
      name: 'Read a chapter',
    });
    const service = new HabitsService({
      habit: { findFirst, update },
    } as unknown as PrismaService);

    await expect(
      service.rename('user-1', 'habit-1', { name: 'Read a chapter' }),
    ).resolves.toMatchObject({ name: 'Read a chapter' });
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'habit-1', userId: 'user-1', status: 'ACTIVE' },
    });
  });

  it('does not expose or mutate a habit owned by another user', async () => {
    const update = vi.fn();
    const service = new HabitsService({
      habit: { findFirst: vi.fn().mockResolvedValue(null), update },
    } as unknown as PrismaService);

    await expect(
      service.archive('user-1', 'other-users-habit'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(update).not.toHaveBeenCalled();
  });

  it('uses the authenticated user timezone for an idempotent build completion', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-03T17:30:00.000Z'));
    const findFirst = vi
      .fn()
      .mockResolvedValue({ id: 'habit-1', type: 'BUILD' });
    const upsert = vi.fn();
    const service = new HabitsService({
      habit: { findFirst },
      buildCompletion: { upsert },
    } as unknown as PrismaService);

    await service.markToday('user-1', 'habit-1', 'Asia/Jakarta');

    expect(upsert).toHaveBeenCalledWith({
      where: {
        habitId_completedOn: {
          habitId: 'habit-1',
          completedOn: new Date('2026-09-04T00:00:00.000Z'),
        },
      },
      create: {
        habitId: 'habit-1',
        completedOn: new Date('2026-09-04T00:00:00.000Z'),
      },
      update: {},
    });
    vi.useRealTimers();
  });

  it('keeps yesterday’s streak alive until today closes', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
    const service = new HabitsService({
      habit: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'habit-1',
            name: 'Read',
            type: 'BUILD',
            createdAt: new Date('2026-09-01T00:00:00.000Z'),
            periods: [{ startedOn: new Date('2026-09-01T00:00:00.000Z') }],
            buildCompletions: [
              { completedOn: new Date('2026-09-02T00:00:00.000Z') },
              { completedOn: new Date('2026-09-03T00:00:00.000Z') },
            ],
            relapses: [],
          },
        ]),
      },
    } as unknown as PrismaService);

    await expect(service.list('user-1', 'UTC')).resolves.toEqual([
      {
        id: 'habit-1',
        name: 'Read',
        type: 'BUILD',
        streak: 2,
        completedToday: false,
      },
    ]);
    vi.useRealTimers();
  });

  it('does not count completions before the active habit period', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
    const service = new HabitsService({
      habit: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'habit-1',
            name: 'Read',
            type: 'BUILD',
            createdAt: new Date('2026-09-03T00:00:00.000Z'),
            periods: [{ startedOn: new Date('2026-09-03T00:00:00.000Z') }],
            buildCompletions: [
              { completedOn: new Date('2026-09-02T00:00:00.000Z') },
              { completedOn: new Date('2026-09-03T00:00:00.000Z') },
            ],
            relapses: [],
          },
        ]),
      },
    } as unknown as PrismaService);

    await expect(service.list('user-1', 'UTC')).resolves.toMatchObject([
      { streak: 1 },
    ]);
    vi.useRealTimers();
  });
});
