import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ranger, renderWithCharacter } from '../../test/renderWithCharacter';
import { SlotTracker } from './SlotTracker';
import { SpellcastingHeader } from './SpellcastingHeader';

function setup() {
  const c = ranger();
  c.spellbook.ability = 'wis';
  c.spellbook.slots[1] = { total: 4, used: 1 };
  c.spellbook.slots[2] = { total: 2, used: 0 };
  return renderWithCharacter(
    <>
      <SpellcastingHeader />
      <SlotTracker />
    </>,
    c,
  );
}

describe('SpellcastingHeader', () => {
  it('shows DC and attack bonus from the chosen ability', () => {
    setup();
    expect(screen.getByLabelText('Spell save DC')).toHaveValue('13');
    expect(screen.getByLabelText('Spell attack bonus')).toHaveValue('+5');
  });

  it('shows a dash when no spellcasting ability is chosen', () => {
    renderWithCharacter(<SpellcastingHeader />);
    expect(screen.getByTestId('spell-dc')).toHaveTextContent('—');
    expect(screen.getByTestId('spell-attack')).toHaveTextContent('—');
    expect(screen.queryByLabelText('Spell save DC')).not.toBeInTheDocument();
  });
});

describe('SlotTracker', () => {
  it('hides levels without slots until edit mode', async () => {
    setup();
    expect(screen.getByTestId('slots-1')).toBeInTheDocument();
    expect(screen.queryByTestId('slots-3')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Edit slots' }));
    expect(screen.getByLabelText('Level 3 slots')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Level \d slots/)).toHaveLength(9);
  });

  it('toggles used slots by clicking pips', async () => {
    setup();
    const row = screen.getByTestId('slots-1');
    const pips = within(row).getAllByRole('button', { name: /Level 1 slot \d/ });
    expect(pips.filter((p) => p.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    await userEvent.click(pips[2]!);
    expect(within(row).getAllByRole('button', { pressed: true })).toHaveLength(3);
    await userEvent.click(pips[2]!);
    expect(within(row).getAllByRole('button', { pressed: true })).toHaveLength(2);
  });

  it('long rest resets used slots after confirmation', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Long rest' }));
    expect(within(screen.getByTestId('slots-1')).getAllByRole('button', { pressed: true })).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Reset slots' }));
    expect(within(screen.getByTestId('slots-1')).queryAllByRole('button', { pressed: true })).toHaveLength(0);
  });
});
