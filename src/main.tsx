import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { createLocalStorageAdapter } from './storage/localStorageAdapter';
import { getStorage } from './storage/safeStorage';
import { CharacterProvider } from './store/CharacterProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CharacterProvider adapter={createLocalStorageAdapter(getStorage())}>
        <App />
      </CharacterProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
