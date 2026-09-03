import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { GoalsModule } from './goals/goals.module.js';
import { HabitsModule } from './habits/habits.module.js';

@Module({
  imports: [AuthModule, HealthModule, HabitsModule, GoalsModule],
})
export class AppModule {}
