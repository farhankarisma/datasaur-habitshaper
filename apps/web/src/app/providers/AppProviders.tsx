import { StrictMode, type ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <StrictMode>{children}</StrictMode>;
}
