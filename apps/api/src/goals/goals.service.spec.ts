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
          updateMany: vi.fn(),
          findMany: vi
            .fn()
            .mockResolvedValueOnce([
              {
                id: 'goal-1',
                habitId: 'habit-1',
                targetDays: 30,
                habit: { id: 'habit-1', name: 'Read', type: 'BUILD' },
              },
            ])
            .mockResolvedValueOnce([]),
        },
      } as unknown as PrismaService,
      {
        list: vi.fn().mockResolvedValue([{ id: 'habit-1', streak: 4 }]),
      } as unknown as HabitsService,
    );

    await expect(service.list('user-1', 'UTC')).resolves.toEqual({
      active: [
        {
          id: 'goal-1',
          targetDays: 30,
          currentStreak: 4,
          habit: { id: 'habit-1', name: 'Read', type: 'BUILD' },
        },
      ],
      achievements: [],
    });
  });

  it('completes a reached active goal only while it remains active', async () => {
    const updateMany = vi.fn();
    const service = new GoalsService(
      { goal: { updateMany } } as unknown as PrismaService,
      {
        getActiveHabitProgress: vi.fn().mockResolvedValue({
          id: 'habit-1',
          streak: 30,
        }),
      } as unknown as HabitsService,
    );

    await service.completeReachedGoal('user-1', 'habit-1', 'UTC');

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        habitId: 'habit-1',
        status: 'ACTIVE',
        targetDays: { lte: 30 },
      },
      data: expect.objectContaining({
        status: 'COMPLETED',
        activeSlot: null,
        achievedAt: expect.any(Date),
      }),
    });
  });

  it('completes a goal when its new target is already met', async () => {
    const update = vi
      .fn()
      .mockResolvedValue({ id: 'goal-1', status: 'COMPLETED' });
    const service = new GoalsService(
      {
        goal: {
          findFirst: vi
            .fn()
            .mockResolvedValue({ id: 'goal-1', habitId: 'habit-1' }),
          update,
        },
      } as unknown as PrismaService,
      {
        getActiveHabitProgress: vi.fn().mockResolvedValue({ streak: 14 }),
      } as unknown as HabitsService,
    );

    await service.update('user-1', 'goal-1', { targetDays: 14 }, 'UTC');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'goal-1' },
      data: expect.objectContaining({
        targetDays: 14,
        status: 'COMPLETED',
        activeSlot: null,
        achievedAt: expect.any(Date),
      }),
    });
  });

  it('soft-removes an owned active goal', async () => {
    const update = vi
      .fn()
      .mockResolvedValue({ id: 'goal-1', status: 'REMOVED' });
    const service = new GoalsService(
      {
        goal: {
          findFirst: vi
            .fn()
            .mockResolvedValue({ id: 'goal-1', habitId: 'habit-1' }),
          update,
        },
      } as unknown as PrismaService,
      {} as HabitsService,
    );

    await service.remove('user-1', 'goal-1');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'goal-1' },
      data: expect.objectContaining({
        status: 'REMOVED',
        activeSlot: null,
        removedAt: expect.any(Date),
      }),
    });
  });
});
