import { ConflictException } from '@nestjs/common';

import type { PrismaService } from '../database/prisma.service.js';
import type { HabitsService } from '../habits/habits.service.js';
import { GoalsService } from './goals.service.js';

describe('GoalsService', () => {
  it('creates one active goal for an owned active habit', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'goal-1', targetDays: 30 });
    const habits = {
      getActiveHabitProgress: vi.fn().mockResolvedValue({
        id: 'habit-1',
        name: 'Read',
        type: 'BUILD',
        streak: 4,
      }),
    } as unknown as HabitsService;
    const service = new GoalsService(
      {
        goal: { findFirst: vi.fn().mockResolvedValue(null), create },
      } as unknown as PrismaService,
      habits,
    );

    await expect(
      service.create(
        'user-1',
        { habitId: 'habit-1', targetDays: 30 },
        'Asia/Jakarta',
      ),
    ).resolves.toEqual({
      id: 'goal-1',
      targetDays: 30,
      currentStreak: 4,
      habit: { id: 'habit-1', name: 'Read', type: 'BUILD' },
    });
    expect(create).toHaveBeenCalledWith({
      data: { habitId: 'habit-1', targetDays: 30, activeSlot: 1 },
    });
  });

  it('rejects a second active goal for the same habit', async () => {
    const service = new GoalsService(
      {
        goal: { findFirst: vi.fn().mockResolvedValue({ id: 'goal-1' }) },
      } as unknown as PrismaService,
      {
        getActiveHabitProgress: vi.fn().mockResolvedValue({ id: 'habit-1' }),
      } as unknown as HabitsService,
    );

    await expect(
      service.create('user-1', { habitId: 'habit-1', targetDays: 30 }, 'UTC'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns progress derived from the habits module', async () => {
    const service = new GoalsService(
      {
        goal: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'goal-1',
              habitId: 'habit-1',
              targetDays: 30,
              habit: { id: 'habit-1', name: 'Read', type: 'BUILD' },
            },
          ]),
        },
      } as unknown as PrismaService,
      {
        list: vi.fn().mockResolvedValue([{ id: 'habit-1', streak: 4 }]),
      } as unknown as HabitsService,
    );

    await expect(service.list('user-1', 'UTC')).resolves.toEqual([
      {
        id: 'goal-1',
        targetDays: 30,
        currentStreak: 4,
        habit: { id: 'habit-1', name: 'Read', type: 'BUILD' },
      },
    ]);
  });
});
