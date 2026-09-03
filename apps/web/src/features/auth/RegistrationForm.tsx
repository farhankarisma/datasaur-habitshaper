import { useState, type FormEvent } from 'react';

import { register, type PublicUser } from './register';

interface RegistrationFormProps {
  onRegistered: (user: PublicUser) => void;
}

export function RegistrationForm({ onRegistered }: RegistrationFormProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const user = await register({
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        timezone: String(formData.get('timezone') ?? ''),
      });

      onRegistered(user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Create account</p>
        <h2>Start shaping your habits</h2>
      </div>

      <label>
        Email
        <input autoComplete="email" maxLength={254} name="email" required type="email" />
      </label>

      <label>
        Password
        <input
          autoComplete="new-password"
          maxLength={128}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>

      <label>
        Timezone
        <input
          defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
          maxLength={64}
          name="timezone"
          required
          type="text"
        />
      </label>

      {error ? <p role="alert">{error}</p> : null}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
