import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { HabitsModule } from '../habits/habits.module.js';
import { GoalsController } from './goals.controller.js';
import { GoalsService } from './goals.service.js';

@Module({
  imports: [AuthModule, DatabaseModule, HabitsModule],
  controllers: [GoalsController],
  providers: [GoalsService],
})
export class GoalsModule {}
