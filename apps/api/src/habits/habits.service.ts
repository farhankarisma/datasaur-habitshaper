import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HabitType } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import type { CreateHabitInput } from './habit.schema.js';
@Injectable()
export class HabitsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async list(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      include: { buildCompletions: true, relapses: true },
    });
    const today = this.today();
    return habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      type: habit.type,
      streak:
        habit.type === HabitType.BUILD
          ? this.buildStreak(
              habit.buildCompletions.map((item) => item.completedOn),
              today,
            )
          : this.cleanStreak(
              habit.relapses.map((item) => item.relapsedOn),
              habit.createdAt,
              today,
            ),
    }));
  }
  async create(userId: string, input: CreateHabitInput) {
    const today = this.today();
    return this.prisma.habit.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        periods: { create: { startedOn: today } },
      },
    });
  }
  async markToday(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
    });
    if (!habit) throw new NotFoundException();
    if (habit.userId !== userId) throw new ForbiddenException();
    const today = this.today();
    if (habit.type === HabitType.BUILD)
      await this.prisma.buildCompletion.upsert({
        where: { habitId_completedOn: { habitId, completedOn: today } },
        create: { habitId, completedOn: today },
        update: {},
      });
    else
      await this.prisma.relapse.upsert({
        where: { habitId_relapsedOn: { habitId, relapsedOn: today } },
        create: { habitId, relapsedOn: today },
        update: {},
      });
    return habit;
  }
  private today() {
    const d = new Date();
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }
  private buildStreak(completions: Date[], today: Date) {
    const dates = new Set(
      completions.map((date) => date.toISOString().slice(0, 10)),
    );
    let streak = 0;
    const day = new Date(today);
    while (dates.has(day.toISOString().slice(0, 10))) {
      streak += 1;
      day.setUTCDate(day.getUTCDate() - 1);
    }
    return streak;
  }
  private cleanStreak(relapses: Date[], createdAt: Date, today: Date) {
    const latest =
      relapses.sort((a, b) => b.getTime() - a.getTime())[0] ?? createdAt;
    return Math.max(
      0,
      Math.floor((today.getTime() - latest.getTime()) / 86_400_000),
    );
  }
}
