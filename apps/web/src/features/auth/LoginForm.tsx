import { useState, type FormEvent } from 'react';

import { login, type PublicUser } from './register';

interface LoginFormProps {
  onLoggedIn: (user: PublicUser) => void;
}

export function LoginForm({ onLoggedIn }: LoginFormProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const user = await login({
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
      });

      onLoggedIn(user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-copy">
        <h2>Welcome back.</h2>
        <p>Pick up with the habits that matter to you.</p>
      </div>

      <label>
        Email
        <input autoComplete="email" maxLength={254} name="email" required type="email" />
      </label>

      <label>
        Password
        <input
          autoComplete="current-password"
          maxLength={128}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>

      {error ? <p role="alert">{error}</p> : null}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
