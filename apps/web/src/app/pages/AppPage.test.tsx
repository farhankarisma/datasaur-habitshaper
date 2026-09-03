import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppPage } from './AppPage';

describe('AppPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('restores no user into a focused registration screen', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401 }));

    render(<AppPage />);

    expect(
      await screen.findByRole('heading', { name: /a quieter way to return to your day/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /start with today/i })).toBeInTheDocument();
  });

  it('switches to the sign-in form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401 }));

    render(<AppPage />);

    await screen.findByRole('button', { name: 'Sign in' });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});
