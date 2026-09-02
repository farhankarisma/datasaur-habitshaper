import { parseEnvironment } from './environment.js';

describe('parseEnvironment', () => {
  it('parses valid values', () => {
    expect(
      parseEnvironment({
        DATABASE_URL: 'mysql://user:password@db:3306/habit_shaper',
        NODE_ENV: 'production',
        PORT: '4000',
      }),
    ).toEqual({
      DATABASE_URL: 'mysql://user:password@db:3306/habit_shaper',
      NODE_ENV: 'production',
      PORT: 4000,
    });
  });

  it('applies local defaults', () => {
    expect(
      parseEnvironment({
        DATABASE_URL: 'mysql://user:password@localhost:3307/habit_shaper',
      }),
    ).toMatchObject({ NODE_ENV: 'development', PORT: 3000 });
  });

  it.each([
    [{}, 'DATABASE_URL'],
    [{ DATABASE_URL: 'postgresql://localhost/habit_shaper' }, 'DATABASE_URL'],
    [{ DATABASE_URL: 'mysql://localhost/habit_shaper', PORT: '70000' }, 'PORT'],
    [
      { DATABASE_URL: 'mysql://localhost/habit_shaper', NODE_ENV: 'staging' },
      'NODE_ENV',
    ],
  ])('rejects invalid configuration: %s', (source, field) => {
    expect(() => parseEnvironment(source)).toThrow(field);
  });
});
