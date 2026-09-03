import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { HabitsModule } from './habits/habits.module.js';

@Module({
  imports: [AuthModule, HealthModule, HabitsModule],
})
export class AppModule {}
