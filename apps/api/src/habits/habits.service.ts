import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HabitType } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  buildStreak,
  cleanStreak,
  weeklyBuildProgress,
} from './domain/habit-statistics.js';
import { localCalendarDate } from './domain/local-calendar-date.js';
import type { CreateHabitInput, RenameHabitInput } from './dto/habit.schema.js';

export interface ActiveHabitProgress {
  id: string;
  name: string;
  streak: number;
  type: HabitType;
}

@Injectable()
export class HabitsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async list(userId: string, timezone: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      include: {
        periods: {
          where: { endedOn: null },
          orderBy: { startedOn: 'desc' },
          take: 1,
        },
        buildCompletions: true,
        relapses: true,
      },
    });
    const today = this.today(timezone);
    return habits.map((habit) => {
      const startedOn = habit.periods[0]?.startedOn ?? habit.createdAt;
      const buildCompletions = habit.buildCompletions.map(
        (item) => item.completedOn,
      );
      const isBuildHabit = habit.type === HabitType.BUILD;

      return {
        id: habit.id,
        name: habit.name,
        type: habit.type,
        streak: isBuildHabit
          ? buildStreak(buildCompletions, startedOn, today)
          : cleanStreak(
              habit.relapses.map((item) => item.relapsedOn),
              startedOn,
              today,
            ),
        completedToday:
          isBuildHabit &&
          habit.buildCompletions.some(
            (item) => item.completedOn.getTime() === today.getTime(),
          ),
        relapsedToday:
          !isBuildHabit &&
          habit.relapses.some(
            (item) => item.relapsedOn.getTime() === today.getTime(),
          ),
        weekly: isBuildHabit
          ? weeklyBuildProgress(buildCompletions, startedOn, today)
          : null,
      };
    });
  }
  async create(userId: string, input: CreateHabitInput, timezone: string) {
    const today = this.today(timezone);
    return this.prisma.habit.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        periods: { create: { startedOn: today } },
      },
    });
  }

  async getActiveHabitProgress(
    userId: string,
    habitId: string,
    timezone: string,
  ): Promise<ActiveHabitProgress> {
    const habit = (await this.list(userId, timezone)).find(
      (item) => item.id === habitId,
    );

    if (!habit) {
      throw new NotFoundException();
    }

    return {
      id: habit.id,
      name: habit.name,
      streak: habit.streak,
      type: habit.type,
    };
  }
  async markToday(userId: string, habitId: string, timezone: string) {
    const today = this.today(timezone);
    const habit = await this.prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
        status: 'ACTIVE',
        periods: { some: { startedOn: { lte: today }, endedOn: null } },
      },
    });
    if (!habit) throw new NotFoundException();
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
  async undoToday(userId: string, habitId: string, timezone: string) {
    const today = this.today(timezone);
    const habit = await this.prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
        status: 'ACTIVE',
        periods: { some: { startedOn: { lte: today }, endedOn: null } },
      },
    });
    if (!habit) throw new NotFoundException();

    if (habit.type === HabitType.BUILD) {
      await this.prisma.buildCompletion.deleteMany({
        where: { habitId: habit.id, completedOn: today },
      });
    } else {
      await this.prisma.relapse.deleteMany({
        where: { habitId: habit.id, relapsedOn: today },
      });
    }
  }
  async rename(userId: string, habitId: string, input: RenameHabitInput) {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId, status: 'ACTIVE' },
    });
    if (!habit) throw new NotFoundException();

    return this.prisma.habit.update({
      where: { id: habit.id },
      data: { name: input.name },
    });
  }
  async archive(userId: string, habitId: string, timezone: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId, status: 'ACTIVE' },
    });
    if (!habit) throw new NotFoundException();

    const today = localCalendarDate(timezone);
    return this.prisma.$transaction(async (tx) => {
      await tx.habitPeriod.updateMany({
        where: { habitId: habit.id, endedOn: null },
        data: { endedOn: today },
      });
      return tx.habit.update({
        where: { id: habit.id },
        data: { status: 'ARCHIVED' },
      });
    });
  }
  private today(timezone: string): Date {
    return localCalendarDate(timezone);
  }
}
