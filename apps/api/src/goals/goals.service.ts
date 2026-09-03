import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalStatus } from '../generated/prisma/client.js';
import type { HabitType } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { HabitsService } from '../habits/habits.service.js';
import type { CreateGoalInput, UpdateGoalInput } from './dto/goal.schema.js';

export interface ActiveGoal {
  currentStreak: number;
  habit: {
    id: string;
    name: string;
    type: HabitType;
  };
  id: string;
  targetDays: number;
}

@Injectable()
export class GoalsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(HabitsService) private readonly habits: HabitsService,
  ) {}

  async list(userId: string, timezone: string): Promise<ActiveGoal[]> {
    const [goals, habits] = await Promise.all([
      this.prisma.goal.findMany({
        where: {
          status: GoalStatus.ACTIVE,
          habit: { userId, status: 'ACTIVE' },
        },
        include: { habit: { select: { id: true, name: true, type: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.habits.list(userId, timezone),
    ]);
    const streaks = new Map(habits.map((habit) => [habit.id, habit.streak]));

    return goals.flatMap((goal) => {
      const currentStreak = streaks.get(goal.habitId);

      return currentStreak === undefined
        ? []
        : [
            {
              id: goal.id,
              targetDays: goal.targetDays,
              currentStreak,
              habit: goal.habit,
            },
          ];
    });
  }

  async create(
    userId: string,
    input: CreateGoalInput,
    timezone: string,
  ): Promise<ActiveGoal> {
    const habit = await this.habits.getActiveHabitProgress(
      userId,
      input.habitId,
      timezone,
    );
    const existingGoal = await this.prisma.goal.findFirst({
      where: { habitId: habit.id, status: GoalStatus.ACTIVE },
    });

    if (existingGoal) {
      throw new ConflictException('This habit already has an active goal.');
    }

    const goal = await this.prisma.goal.create({
      data: { habitId: habit.id, targetDays: input.targetDays, activeSlot: 1 },
    });

    return {
      id: goal.id,
      targetDays: goal.targetDays,
      currentStreak: habit.streak,
      habit: { id: habit.id, name: habit.name, type: habit.type },
    };
  }

  async update(
    userId: string,
    goalId: string,
    input: UpdateGoalInput,
    timezone: string,
  ) {
    const goal = await this.findActiveGoal(userId, goalId);
    const habit = await this.habits.getActiveHabitProgress(
      userId,
      goal.habitId,
      timezone,
    );
    const completed = input.targetDays <= habit.streak;

    return this.prisma.goal.update({
      where: { id: goal.id },
      data: completed
        ? {
            targetDays: input.targetDays,
            status: GoalStatus.COMPLETED,
            activeSlot: null,
            achievedAt: new Date(),
          }
        : { targetDays: input.targetDays },
    });
  }

  async remove(userId: string, goalId: string) {
    const goal = await this.findActiveGoal(userId, goalId);

    return this.prisma.goal.update({
      where: { id: goal.id },
      data: {
        status: GoalStatus.REMOVED,
        activeSlot: null,
        removedAt: new Date(),
      },
    });
  }

  private async findActiveGoal(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        status: GoalStatus.ACTIVE,
        habit: { userId, status: 'ACTIVE' },
      },
    });

    if (!goal) {
      throw new NotFoundException();
    }

    return goal;
  }
}
