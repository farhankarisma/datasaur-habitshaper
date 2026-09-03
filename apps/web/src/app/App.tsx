import { useEffect, useState } from 'react';

import { LoginForm } from '../features/auth/LoginForm';
import { RegistrationForm } from '../features/auth/RegistrationForm';
import { getCurrentUser, type PublicUser } from '../features/auth/register';

type AuthMode = 'login' | 'register';
type SessionStatus = 'loading' | 'signed-in' | 'signed-out';

export function App() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [mode, setMode] = useState<AuthMode>('register');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');

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
      <main className="app-shell">
        <section className="daybook daybook--signed-in">
          <p className="wordmark">Habit Shaper</p>
          <h1>Your daybook is ready.</h1>
          <p>Signed in as {user.email}. Your habit dashboard is coming next.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="daybook">
        <header className="daybook-header">
          <p className="wordmark">Habit Shaper</p>
          <p className="date-mark">One day at a time</p>
        </header>

        <div className="daybook-intro">
          <h1>A quieter way to return to your day.</h1>
          <p>Build what helps. Leave behind what does not. Keep it private.</p>
        </div>

        <div className="auth-switch" aria-label="Authentication options">
          <button
            aria-pressed={mode === 'register'}
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => setMode('register')}
            type="button"
          >
            Create account
          </button>
          <button
            aria-pressed={mode === 'login'}
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => setMode('login')}
            type="button"
          >
            Sign in
          </button>
        </div>

        {mode === 'register' ? (
          <RegistrationForm onRegistered={setUser} />
        ) : (
          <LoginForm onLoggedIn={setUser} />
        )}
      </section>
    </main>
  );
}
