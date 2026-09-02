import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the Habit Shaper heading', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /build better habits, one day at a time/i,
      }),
    ).toBeInTheDocument();
  });
});
