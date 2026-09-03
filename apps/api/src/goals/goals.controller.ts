import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { SessionGuard } from '../auth/session.guard.js';
import { createGoalSchema, updateGoalSchema } from './dto/goal.schema.js';
import { GoalsService } from './goals.service.js';

@Controller('goals')
@UseGuards(SessionGuard)
export class GoalsController {
  constructor(@Inject(GoalsService) private readonly goals: GoalsService) {}

  @Get()
  list(@Req() request: FastifyRequest) {
    return this.goals.list(
      request.habitShaperUser!.id,
      request.habitShaperUser!.timezone,
    );
  }

  @Post()
  create(@Req() request: FastifyRequest, @Body() body: unknown) {
    return this.goals.create(
      request.habitShaperUser!.id,
      createGoalSchema.parse(body),
      request.habitShaperUser!.timezone,
    );
  }

  @Patch(':id')
  update(
    @Req() request: FastifyRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.goals.update(
      request.habitShaperUser!.id,
      id,
      updateGoalSchema.parse(body),
      request.habitShaperUser!.timezone,
    );
  }

  @Delete(':id')
  remove(@Req() request: FastifyRequest, @Param('id') id: string) {
    return this.goals.remove(request.habitShaperUser!.id, id);
  }
}
