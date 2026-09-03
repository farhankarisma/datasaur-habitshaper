import { createRoot } from 'react-dom/client';

import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/600.css';

import { AppPage } from './app/pages/AppPage';
import { AppProviders } from './app/providers/AppProviders';
import './shared/styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found');
}

createRoot(rootElement).render(
  <AppProviders>
    <AppPage />
  </AppProviders>,
);
