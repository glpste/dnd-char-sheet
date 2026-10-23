import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SKILLS } from '../../model/skills';
import { renderWithCharacter } from '../../test/renderWithCharacter';
import { SavesSkillsColumn } from './SavesSkillsColumn';

describe('SkillList', () => {
  it('renders all 18 skills in PDF order', () => {
    renderWithCharacter(<SavesSkillsColumn />);
    const rows = screen.getAllByTestId(/^skill-row-/);
    expect(rows.map((r) => r.dataset['testid'])).toEqual(SKILLS.map((s) => `skill-row-${s.key}`));
  });

  it('cycles proficiency to expertise on the second click', async () => {
    renderWithCharacter(<SavesSkillsColumn />);
    const row = screen.getByTestId('skill-row-stealth');
    const dot = within(row).getByRole('button', { name: /Stealth proficiency/ });
    const total = within(row).getByLabelText('Stealth total');
    expect(total).toHaveValue('+4');
    await userEvent.click(dot);
    expect(total).toHaveValue('+7');
    await userEvent.click(dot);
    expect(total).toHaveValue('+10');
    await userEvent.click(dot);
    expect(total).toHaveValue('+4');
  });

  it('updates passive perception when perception proficiency changes', async () => {
    renderWithCharacter(<SavesSkillsColumn />);
    expect(screen.getByLabelText('Passive perception')).toHaveValue('12');
    const row = screen.getByTestId('skill-row-perception');
    await userEvent.click(within(row).getByRole('button', { name: /Perception proficiency/ }));
    expect(screen.getByLabelText('Passive perception')).toHaveValue('15');
  });

  it('allows overriding a skill total and resetting it to auto', async () => {
    renderWithCharacter(<SavesSkillsColumn />);
    const row = screen.getByTestId('skill-row-stealth');
    const total = within(row).getByLabelText('Stealth total');
    expect(total).toHaveValue('+4');
    await userEvent.clear(total);
    await userEvent.type(total, '9{Enter}');
    expect(total).toHaveValue('+9');
    await userEvent.click(within(row).getByRole('button', { name: 'Reset Stealth total to auto' }));
    expect(total).toHaveValue('+4');
  });

  it('allows overriding a saving throw and passive perception with reset', async () => {
    renderWithCharacter(<SavesSkillsColumn />);
    const row = screen.getByTestId('save-row-con');
    const total = within(row).getByLabelText('Constitution save total');
    await userEvent.clear(total);
    await userEvent.type(total, '5{Enter}');
    expect(total).toHaveValue('+5');
    expect(within(row).getByRole('button', { name: 'Reset Constitution save total to auto' })).toBeInTheDocument();
    const pp = screen.getByLabelText('Passive perception');
    await userEvent.clear(pp);
    await userEvent.type(pp, '20{Enter}');
    expect(pp).toHaveValue('20');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Passive perception to auto' }));
    expect(pp).toHaveValue('12');
  });

  it('toggles saving throw proficiency', async () => {
    renderWithCharacter(<SavesSkillsColumn />);
    const row = screen.getByTestId('save-row-str');
    expect(within(row).getByLabelText('Strength save total')).toHaveValue('+3');
    await userEvent.click(within(row).getByRole('button', { name: /Strength save proficiency/ }));
    expect(within(row).getByLabelText('Strength save total')).toHaveValue('+6');
  });
});
