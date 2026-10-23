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
    expect(within(row).getByTestId('total')).toHaveTextContent('+4');
    await userEvent.click(dot);
    expect(within(row).getByTestId('total')).toHaveTextContent('+7');
    await userEvent.click(dot);
    expect(within(row).getByTestId('total')).toHaveTextContent('+10');
    await userEvent.click(dot);
    expect(within(row).getByTestId('total')).toHaveTextContent('+4');
  });

  it('updates passive perception when perception proficiency changes', async () => {
    renderWithCharacter(<SavesSkillsColumn />);
    expect(screen.getByLabelText('Passive perception')).toHaveValue('12');
    const row = screen.getByTestId('skill-row-perception');
    await userEvent.click(within(row).getByRole('button', { name: /Perception proficiency/ }));
    expect(screen.getByLabelText('Passive perception')).toHaveValue('15');
  });

  it('toggles saving throw proficiency', async () => {
    renderWithCharacter(<SavesSkillsColumn />);
    const row = screen.getByTestId('save-row-str');
    expect(within(row).getByTestId('total')).toHaveTextContent('+3');
    await userEvent.click(within(row).getByRole('button', { name: /Strength save proficiency/ }));
    expect(within(row).getByTestId('total')).toHaveTextContent('+6');
  });
});
