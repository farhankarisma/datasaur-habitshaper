import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { SessionGuard } from '../auth/session.guard.js';
import { createHabitSchema, renameHabitSchema } from './dto/habit.schema.js';
import { HabitsService } from './habits.service.js';
import { GoalsService } from '../goals/goals.service.js';
@Controller('habits')
@UseGuards(SessionGuard)
export class HabitsController {
  constructor(
    @Inject(HabitsService) private readonly habits: HabitsService,
    @Inject(forwardRef(() => GoalsService))
    private readonly goals: GoalsService,
  ) {}
  @Get() list(@Req() r: FastifyRequest) {
    return this.habits.list(r.habitShaperUser!.id, r.habitShaperUser!.timezone);
  }
  @Post() create(@Req() r: FastifyRequest, @Body() body: unknown) {
    return this.habits.create(
      r.habitShaperUser!.id,
      createHabitSchema.parse(body),
      r.habitShaperUser!.timezone,
    );
  }
  @Put(':id/today')
  async mark(@Req() r: FastifyRequest) {
    const habit = await this.habits.markToday(
      r.habitShaperUser!.id,
      (r.params as { id: string }).id,
      r.habitShaperUser!.timezone,
    );
    await this.goals.completeReachedGoal(
      r.habitShaperUser!.id,
      habit.id,
      r.habitShaperUser!.timezone,
    );
    return habit;
  }
  @Delete(':id/today')
  undoToday(@Req() r: FastifyRequest) {
    return this.habits.undoToday(
      r.habitShaperUser!.id,
      (r.params as { id: string }).id,
      r.habitShaperUser!.timezone,
    );
  }
  @Patch(':id')
  rename(
    @Req() r: FastifyRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.habits.rename(
      r.habitShaperUser!.id,
      id,
      renameHabitSchema.parse(body),
    );
  }
  @Delete(':id')
  archive(@Req() r: FastifyRequest, @Param('id') id: string) {
    return this.habits.archive(
      r.habitShaperUser!.id,
      id,
      r.habitShaperUser!.timezone,
    );
  }
}
