import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends credentials and returns the signed-in user', async () => {
    const user = { id: 'user-1', email: 'farhan@example.com', timezone: 'Asia/Jakarta' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ user }),
    });
    const onLoggedIn = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<LoginForm onLoggedIn={onLoggedIn} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'farhan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'correct horse battery staple' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }));

    await vi.waitFor(() => expect(onLoggedIn).toHaveBeenCalledWith(user));
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'farhan@example.com',
        password: 'correct horse battery staple',
      }),
    });
  });
});
