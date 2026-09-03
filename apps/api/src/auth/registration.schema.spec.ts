import { registrationSchema } from './registration.schema.js';

describe('registrationSchema', () => {
  it('normalizes a valid registration', () => {
    expect(
      registrationSchema.parse({
        email: '  FARHAN@example.com ',
        password: 'correct horse battery staple',
        timezone: 'Asia/Jakarta',
      }),
    ).toEqual({
      email: 'farhan@example.com',
      password: 'correct horse battery staple',
      timezone: 'Asia/Jakarta',
    });
  });

  it.each([
    { email: 'not-an-email', password: 'password', timezone: 'Asia/Jakarta' },
    { email: 'a@example.com', password: 'short', timezone: 'Asia/Jakarta' },
    {
      email: 'a@example.com',
      password: 'valid-password',
      timezone: 'Mars/Olympus',
    },
    {
      email: 'a@example.com',
      password: 'valid-password',
      timezone: 'UTC',
      admin: true,
    },
  ])('rejects invalid registration input', (input) => {
    expect(registrationSchema.safeParse(input).success).toBe(false);
  });
});
