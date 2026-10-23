import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { newWeapon } from '../../model/character';
import { ranger, renderWithCharacter } from '../../test/renderWithCharacter';
import { ToastHost } from '../ui/ToastHost';
import { WeaponsTable } from './WeaponsTable';

function setup() {
  const c = ranger();
  c.weapons = [
    { ...newWeapon(), name: 'Longbow', ability: 'dex', damageDice: '1d8', damageType: 'piercing', range: '150/600', properties: 'ammunition, heavy, two-handed' },
  ];
  return renderWithCharacter(
    <>
      <WeaponsTable />
      <ToastHost />
    </>,
    c,
  );
}

describe('WeaponsTable', () => {
  it('shows name, attack, damage and range when collapsed', () => {
    setup();
    const row = screen.getByTestId('weapon-row');
    expect(within(row).getByLabelText('Weapon name')).toHaveValue('Longbow');
    expect(within(row).getByLabelText('Attack bonus')).toHaveValue('+7');
    expect(within(row).getByTestId('damage')).toHaveTextContent('1d8+4 piercing');
    expect(within(row).getByLabelText('Range')).toHaveValue('150/600');
    expect(within(row).queryByLabelText('Special effects')).not.toBeInTheDocument();
  });

  it('expands to show details and recalculates for finesse', async () => {
    setup();
    const row = screen.getByTestId('weapon-row');
    await userEvent.click(within(row).getByRole('button', { name: 'Expand Longbow' }));
    expect(within(row).getByLabelText('Special effects')).toBeInTheDocument();
    expect(within(row).getByLabelText('Properties')).toHaveValue('ammunition, heavy, two-handed');
    await userEvent.selectOptions(within(row).getByLabelText('Ability'), 'str');
    expect(within(row).getByLabelText('Attack bonus')).toHaveValue('+6');
    await userEvent.selectOptions(within(row).getByLabelText('Ability'), 'finesse');
    expect(within(row).getByLabelText('Attack bonus')).toHaveValue('+7');
    await userEvent.click(within(row).getByRole('checkbox', { name: 'Proficient' }));
    expect(within(row).getByLabelText('Attack bonus')).toHaveValue('+4');
  });

  it('allows overriding the attack bonus and resetting it', async () => {
    setup();
    const row = screen.getByTestId('weapon-row');
    const atk = within(row).getByLabelText('Attack bonus');
    await userEvent.clear(atk);
    await userEvent.type(atk, '9{Enter}');
    expect(atk).toHaveValue('+9');
    await userEvent.click(within(row).getByRole('button', { name: 'Reset Attack bonus to auto' }));
    expect(atk).toHaveValue('+7');
  });

  it('removes with undo', async () => {
    setup();
    const row = screen.getByTestId('weapon-row');
    await userEvent.click(within(row).getByRole('button', { name: 'Expand Longbow' }));
    await userEvent.click(within(row).getByRole('button', { name: 'Remove Longbow' }));
    expect(screen.queryByTestId('weapon-row')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(within(screen.getByTestId('weapon-row')).getByLabelText('Weapon name')).toHaveValue('Longbow');
  });

  it('adds a weapon', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Add weapon' }));
    expect(screen.getAllByTestId('weapon-row')).toHaveLength(2);
  });
});
