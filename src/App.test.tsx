import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('switches view when a nav button is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Spellbook' }));
    expect(window.location.hash).toBe('#/spellbook');
    expect(screen.getByRole('heading', { name: 'Spellbook' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Spellbook' })).toHaveAttribute('aria-pressed', 'true');
  });
});
