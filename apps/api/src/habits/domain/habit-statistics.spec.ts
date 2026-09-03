import { cleanStreak } from './habit-statistics.js';

describe('cleanStreak', () => {
  const day = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

  it('counts clean days inclusively from the habit start when there is no relapse', () => {
    expect(cleanStreak([], day('2026-09-01'), day('2026-09-03'))).toBe(3);
  });

  it('returns zero on a relapse day and one on the following clean day', () => {
    expect(
      cleanStreak([day('2026-09-03')], day('2026-09-01'), day('2026-09-03')),
    ).toBe(0);
    expect(
      cleanStreak([day('2026-09-03')], day('2026-09-01'), day('2026-09-04')),
    ).toBe(1);
  });
});
