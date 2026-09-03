import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { HabitsController } from './habits.controller.js';
import { HabitsService } from './habits.service.js';
@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
