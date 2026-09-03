import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { SessionGuard } from '../auth/session.guard.js';
import { createHabitSchema } from './habit.schema.js';
import { HabitsService } from './habits.service.js';
@Controller('habits')
@UseGuards(SessionGuard)
export class HabitsController {
  constructor(@Inject(HabitsService) private readonly habits: HabitsService) {}
  @Get() list(@Req() r: FastifyRequest) {
    return this.habits.list(r.habitShaperUser!.id);
  }
  @Post() create(@Req() r: FastifyRequest, @Body() body: unknown) {
    return this.habits.create(
      r.habitShaperUser!.id,
      createHabitSchema.parse(body),
    );
  }
  @Put(':id/today') mark(@Req() r: FastifyRequest) {
    return this.habits.markToday(
      r.habitShaperUser!.id,
      (r.params as { id: string }).id,
    );
  }
}
