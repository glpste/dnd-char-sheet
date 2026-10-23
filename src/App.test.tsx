import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { createLocalStorageAdapter } from './storage/localStorageAdapter';
import { CharacterProvider } from './store/CharacterProvider';

export function renderApp() {
  return render(
    <CharacterProvider adapter={createLocalStorageAdapter()}>
      <App />
    </CharacterProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '';
    localStorage.clear();
  });

  it('switches view when a nav button is clicked', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: /^Spellbook/ }));
    expect(window.location.hash).toBe('#/spellbook');
    expect(screen.getByRole('heading', { name: 'Spellbook' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Spellbook/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the active character name in the header', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /New character/ })).toBeInTheDocument();
  });
});
