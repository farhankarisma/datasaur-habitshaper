import { useState } from 'react';

import { RegistrationForm } from '../features/auth/RegistrationForm';
import type { PublicUser } from '../features/auth/register';

export function App() {
  const [user, setUser] = useState<PublicUser | null>(null);

  if (user) {
    return (
      <main className="app-shell">
        <section className="welcome-card">
          <p className="eyebrow">Account created</p>
          <h1>Welcome to Habit Shaper.</h1>
          <p>Signed in as {user.email}. Your habit dashboard is coming next.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="auth-layout">
        <section className="welcome-card">
          <p className="eyebrow">Habit Shaper</p>

          <h1>Build better habits, one day at a time.</h1>

          <p>
            Track habits you want to build, habits you want to break, and the goals connected to
            them.
          </p>
        </section>

        <RegistrationForm onRegistered={setUser} />
      </div>
    </main>
  );
}
