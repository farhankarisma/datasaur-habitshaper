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
});
