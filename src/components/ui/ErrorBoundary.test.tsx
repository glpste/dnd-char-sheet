import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders a recovery screen instead of a white page', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export all characters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start with a new character' })).toBeInTheDocument();
  });

  it('starting fresh clears the active character pointer but keeps the records', async () => {
    localStorage.setItem('dnd-sheet:v1:index', JSON.stringify({ activeId: 'bad', characters: [{ id: 'bad', name: 'B', updatedAt: 't' }] }));
    localStorage.setItem('dnd-sheet:v1:char:bad', '{"id":"bad"}');
    const reload = vi.fn();
    render(
      <ErrorBoundary reload={reload}>
        <Boom />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Start with a new character' }));
    expect(JSON.parse(localStorage.getItem('dnd-sheet:v1:index')!).activeId).toBeNull();
    expect(localStorage.getItem('dnd-sheet:v1:char:bad')).not.toBeNull();
    expect(reload).toHaveBeenCalled();
  });
});
