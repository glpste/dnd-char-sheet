import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useHashRoute } from '../router/useHashRoute';
import { useViewShortcuts } from './useViewShortcuts';

function Harness() {
  const [view, setView] = useHashRoute();
  useViewShortcuts(setView);
  return (
    <div>
      <span data-testid="view">{view}</span>
      <input aria-label="field" />
    </div>
  );
}

describe('useViewShortcuts', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('switches views with 1, 2, 3 when nothing is focused', async () => {
    render(<Harness />);
    await userEvent.keyboard('2');
    expect(window.location.hash).toBe('#/spellbook');
    await userEvent.keyboard('3');
    expect(window.location.hash).toBe('#/cheatsheet');
    await userEvent.keyboard('1');
    expect(window.location.hash).toBe('#/sheet');
  });

  it('ignores keys typed into inputs', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('field'), '2');
    expect(window.location.hash).toBe('');
  });

  it('ignores keys with modifiers', async () => {
    render(<Harness />);
    await userEvent.keyboard('{Control>}2{/Control}');
    expect(window.location.hash).toBe('');
  });
});
