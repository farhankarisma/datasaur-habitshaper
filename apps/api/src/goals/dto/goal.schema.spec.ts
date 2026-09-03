import { createGoalSchema, updateGoalSchema } from './goal.schema.js';

describe('createGoalSchema', () => {
  it.each([
    { habitId: 'b12e3e0e-4fa8-4f14-a1f2-1098d63de112', targetDays: 1 },
    { habitId: 'b12e3e0e-4fa8-4f14-a1f2-1098d63de112', targetDays: 30 },
  ])('accepts a positive integer target', (input) => {
    expect(createGoalSchema.safeParse(input).success).toBe(true);
  });

  it.each([0, -1, 1.5])('rejects an invalid target', (targetDays) => {
    expect(
      createGoalSchema.safeParse({
        habitId: 'b12e3e0e-4fa8-4f14-a1f2-1098d63de112',
        targetDays,
      }).success,
    ).toBe(false);
  });
});

describe('updateGoalSchema', () => {
  it('accepts a positive integer target without a habit id', () => {
    expect(updateGoalSchema.safeParse({ targetDays: 14 }).success).toBe(true);
  });
});
