const DAY_MS = 86_400_000;

export interface WeeklyBuildProgress {
  eligibleDays: number;
  completedDays: number;
  missedDays: number;
  percent: number;
}

export function buildStreak(
  completions: Date[],
  startedOn: Date,
  today: Date,
): number {
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

export function cleanStreak(
  relapses: Date[],
  startedOn: Date,
  today: Date,
): number {
  const latestRelapse = relapses.reduce<Date | null>(
    (latest, relapse) =>
      relapse.getTime() <= today.getTime() &&
      (!latest || relapse.getTime() > latest.getTime())
        ? relapse
        : latest,
    null,
  );

  if (latestRelapse) {
    return Math.floor((today.getTime() - latestRelapse.getTime()) / DAY_MS);
  }

  return Math.floor((today.getTime() - startedOn.getTime()) / DAY_MS) + 1;
}

export function weeklyBuildProgress(
  completions: Date[],
  startedOn: Date,
  today: Date,
): WeeklyBuildProgress {
  const weekStart = new Date(today);
  weekStart.setUTCDate(
    weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7),
  );
  const firstEligibleDay =
    startedOn.getTime() > weekStart.getTime() ? startedOn : weekStart;
  if (firstEligibleDay.getTime() > today.getTime()) {
    return { eligibleDays: 0, completedDays: 0, missedDays: 0, percent: 0 };
  }

  const completedDates = new Set(
    completions.map((date) => date.toISOString().slice(0, 10)),
  );
  let eligibleDays = 0;
  let completedDays = 0;
  const day = new Date(firstEligibleDay);
  while (day.getTime() <= today.getTime()) {
    eligibleDays += 1;
    if (completedDates.has(day.toISOString().slice(0, 10))) {
      completedDays += 1;
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }

  return {
    eligibleDays,
    completedDays,
    missedDays: eligibleDays - completedDays,
    percent: Math.round((completedDays / eligibleDays) * 100),
  };
}
