import { loginSchema } from './login.schema.js';

describe('loginSchema', () => {
  it('normalizes a valid login request', () => {
    expect(
      loginSchema.parse({
        email: ' FARHAN@example.com ',
        password: 'correct horse battery staple',
      }),
    ).toEqual({
      email: 'farhan@example.com',
      password: 'correct horse battery staple',
    });
  });

  it('rejects invalid and unknown fields', () => {
    expect(
      loginSchema.safeParse({ email: 'bad', password: 'short', role: 'admin' })
        .success,
    ).toBe(false);
  });
});
