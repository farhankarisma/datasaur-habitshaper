import { createHabitSchema, renameHabitSchema } from './dto/habit.schema.js';

describe('habit schemas', () => {
  it('trims valid habit names', () => {
    expect(
      createHabitSchema.parse({ name: '  Read daily  ', type: 'BUILD' }),
    ).toEqual({ name: 'Read daily', type: 'BUILD' });
  });

  it.each(['', '   ', 'x'.repeat(101)])(
    'rejects an invalid rename name',
    (name) => {
      expect(renameHabitSchema.safeParse({ name }).success).toBe(false);
    },
  );
});
