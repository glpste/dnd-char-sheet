import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CharacterProvider } from './store/CharacterProvider';
import { createLocalStorageAdapter } from './storage/localStorageAdapter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CharacterProvider adapter={createLocalStorageAdapter()}>
      <App />
    </CharacterProvider>
  </React.StrictMode>,
);
