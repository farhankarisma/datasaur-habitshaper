import type { ReactNode } from 'react';

import { Button } from '../../shared/components/Button';

interface AppLayoutProps {
  children: ReactNode;
  onSignOut?: () => void;
}

export function AppLayout({ children, onSignOut }: AppLayoutProps) {
  return (
    <main className="app-shell">
      <section className={`daybook${onSignOut ? ' daybook--signed-in' : ''}`}>
        <header className="daybook-header">
          <p className="wordmark">Habit Shaper</p>
          {onSignOut ? (
            <Button onClick={onSignOut} type="button" variant="quiet">
              Sign out
            </Button>
          ) : (
            <p className="date-mark">One day at a time</p>
          )}
        </header>
        {children}
      </section>
    </main>
  );
}
