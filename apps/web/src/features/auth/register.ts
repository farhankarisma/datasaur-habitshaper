export interface PublicUser {
  id: string;
  email: string;
  timezone: string;
}

export interface RegistrationInput {
  email: string;
  password: string;
  timezone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: PublicUser;
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (!value || typeof value !== 'object' || !('user' in value)) {
    return false;
  }

  const { user } = value;

  return (
    !!user &&
    typeof user === 'object' &&
    'id' in user &&
    typeof user.id === 'string' &&
    'email' in user &&
    typeof user.email === 'string' &&
    'timezone' in user &&
    typeof user.timezone === 'string'
  );
}

function errorMessage(value: unknown): string {
  if (!value || typeof value !== 'object' || !('error' in value)) {
    return 'Registration failed. Please try again.';
  }

  const { error } = value;

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Registration failed. Please try again.';
}

export async function register(input: RegistrationInput): Promise<PublicUser> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json();

  if (!response.ok) {
    throw new Error(errorMessage(body));
  }

  if (!isAuthResponse(body)) {
    throw new Error('The server returned an invalid response.');
  }

  return body.user;
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json();

  if (!response.ok) {
    throw new Error(errorMessage(body));
  }

  if (!isAuthResponse(body)) {
    throw new Error('The server returned an invalid response.');
  }

  return body.user;
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const response = await fetch('/api/auth/me', { credentials: 'include' });

  if (response.status === 401) {
    return null;
  }

  const body: unknown = await response.json();

  if (!response.ok || !isAuthResponse(body)) {
    throw new Error('Unable to restore your session.');
  }

  return body.user;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
