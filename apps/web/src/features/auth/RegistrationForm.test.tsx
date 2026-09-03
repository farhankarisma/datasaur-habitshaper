import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RegistrationForm } from './RegistrationForm';

describe('RegistrationForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('registers with the detected timezone', async () => {
    const user = {
      id: 'user-1',
      email: 'farhan@example.com',
      timezone: 'Asia/Jakarta',
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ user }),
    });
    const onRegistered = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<RegistrationForm onRegistered={onRegistered} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'farhan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'correct horse battery staple' },
    });
    fireEvent.change(screen.getByLabelText('Timezone'), {
      target: { value: 'Asia/Jakarta' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    await vi.waitFor(() => expect(onRegistered).toHaveBeenCalledWith(user));
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'farhan@example.com',
        password: 'correct horse battery staple',
        timezone: 'Asia/Jakarta',
      }),
    });
  });

  it('shows a safe server error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: {
            code: 'EMAIL_ALREADY_REGISTERED',
            message: 'An account with this email already exists.',
          },
        }),
      }),
    );

    render(<RegistrationForm onRegistered={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'farhan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'correct horse battery staple' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists.',
    );
  });
});
