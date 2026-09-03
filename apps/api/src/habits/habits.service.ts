import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HabitType } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import type { CreateHabitInput, RenameHabitInput } from './habit.schema.js';
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
    return habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      type: habit.type,
      streak:
        habit.type === HabitType.BUILD
          ? this.buildStreak(
              habit.buildCompletions.map((item) => item.completedOn),
              habit.periods[0]?.startedOn ?? habit.createdAt,
              today,
            )
          : this.cleanStreak(
              habit.relapses.map((item) => item.relapsedOn),
              habit.createdAt,
              today,
            ),
      completedToday:
        habit.type === HabitType.BUILD &&
        habit.buildCompletions.some(
          (item) => item.completedOn.getTime() === today.getTime(),
        ),
    }));
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
  async undoBuildCompletion(userId: string, habitId: string, timezone: string) {
    const today = this.today(timezone);
    const habit = await this.prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
        type: HabitType.BUILD,
        status: 'ACTIVE',
        periods: { some: { startedOn: { lte: today }, endedOn: null } },
      },
    });
    if (!habit) throw new NotFoundException();

    await this.prisma.buildCompletion.deleteMany({
      where: { habitId: habit.id, completedOn: today },
    });
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
  async archive(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId, status: 'ACTIVE' },
    });
    if (!habit) throw new NotFoundException();

    const today = this.today('UTC');
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
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts();
    const part = (type: Intl.DateTimeFormatPartTypes): string =>
      parts.find((item) => item.type === type)!.value;

    return new Date(
      Date.UTC(
        Number(part('year')),
        Number(part('month')) - 1,
        Number(part('day')),
      ),
    );
  }
  private buildStreak(completions: Date[], startedOn: Date, today: Date) {
    const dates = new Set(
      completions.map((date) => date.toISOString().slice(0, 10)),
    );
    let streak = 0;
    const day = new Date(today);
    if (!dates.has(day.toISOString().slice(0, 10))) {
      day.setUTCDate(day.getUTCDate() - 1);
    }
    while (
      day.getTime() >= startedOn.getTime() &&
      dates.has(day.toISOString().slice(0, 10))
    ) {
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
