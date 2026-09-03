import { useEffect, useState } from 'react';

import { AppLayout } from '../layouts/AppLayout';
import { LoginForm } from '../../features/auth/LoginForm';
import { HabitsPanel } from '../../features/habits/HabitsPanel';
import { GoalsPanel } from '../../features/goals/GoalsPanel';
import { RegistrationForm } from '../../features/auth/RegistrationForm';
import { getCurrentUser, logout, type PublicUser } from '../../features/auth/register';
import { Button } from '../../shared/components/Button';

type AuthMode = 'login' | 'register';
type SessionStatus = 'loading' | 'signed-in' | 'signed-out';

function formatLocalDate(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: timezone,
    weekday: 'long',
  }).format(new Date());
}

export function AppPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [mode, setMode] = useState<AuthMode>('register');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');
  const [progressRevision, setProgressRevision] = useState(0);

  useEffect(() => {
    let active = true;

    void getCurrentUser()
      .then((restoredUser) => {
        if (!active) {
          return;
        }

        setUser(restoredUser);
        setSessionStatus(restoredUser ? 'signed-in' : 'signed-out');
      })
      .catch(() => {
        if (active) {
          setSessionStatus('signed-out');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (sessionStatus === 'loading') {
    return (
      <main className="app-shell app-shell--loading">
        <p className="loading-note">Restoring your daybook…</p>
      </main>
    );
  }

  if (user) {
    return (
      <AppLayout
        onSignOut={() => {
          void logout().finally(() => setUser(null));
        }}
      >
        <div className="dashboard-intro">
          <h1>{formatLocalDate(user.timezone)}</h1>
          <p>Your private daybook for today. Signed in as {user.email}.</p>
        </div>
        <HabitsPanel onProgressChange={() => setProgressRevision((current) => current + 1)} />
        <GoalsPanel refreshKey={progressRevision} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="daybook-intro">
        <h1>A quieter way to return to your day.</h1>
        <p>Build what helps. Leave behind what does not. Keep it private.</p>
      </div>

      <div className="auth-switch" aria-label="Authentication options">
        <Button
          aria-pressed={mode === 'register'}
          className={mode === 'register' ? 'is-active' : ''}
          onClick={() => setMode('register')}
          type="button"
          variant="quiet"
        >
          Create account
        </Button>
        <Button
          aria-pressed={mode === 'login'}
          className={mode === 'login' ? 'is-active' : ''}
          onClick={() => setMode('login')}
          type="button"
          variant="quiet"
        >
          Sign in
        </Button>
      </div>

      {mode === 'register' ? (
        <RegistrationForm onRegistered={setUser} />
      ) : (
        <LoginForm onLoggedIn={setUser} />
      )}
    </AppLayout>
  );
}
