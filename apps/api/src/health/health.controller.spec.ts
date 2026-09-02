import { ServiceUnavailableException } from '@nestjs/common';

import type { PrismaService } from '../database/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const queryRaw = vi.fn();
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
  const controller = new HealthController(prisma);

  beforeEach(() => {
    queryRaw.mockReset();
  });

  it('reports that the application and database are healthy', async () => {
    queryRaw.mockResolvedValue([{ result: 1 }]);

    await expect(controller.getHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('reports that the application is unavailable when the database fails', async () => {
    queryRaw.mockRejectedValue(new Error('database unavailable'));

    await expect(controller.getHealth()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
