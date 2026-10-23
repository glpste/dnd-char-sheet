import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CHEAT_SHEET } from '../../rules/srdCheatSheet';
import { renderWithCharacter } from '../../test/renderWithCharacter';
import { CheatSheetView } from './CheatSheetView';

describe('CheatSheetView', () => {
  it('renders every section title and the attribution', () => {
    renderWithCharacter(<CheatSheetView />);
    for (const s of CHEAT_SHEET) {
      expect(screen.getByRole('button', { name: s.title })).toBeInTheDocument();
    }
    expect(screen.getByText(/Systems Reference Document 5\.1/)).toBeInTheDocument();
  });

  it('search filters sections by title or line text', async () => {
    renderWithCharacter(<CheatSheetView />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cheat sheet' }), 'half cover');
    const titles = screen.getAllByTestId('cheat-section').map((s) => s.dataset['title']);
    expect(titles).toEqual(['Cover']);
  });

  it('collapses a section on header click', async () => {
    renderWithCharacter(<CheatSheetView />);
    const section = screen.getAllByTestId('cheat-section')[0]!;
    const header = within(section).getByRole('button');
    expect(within(section).getByRole('list')).toBeInTheDocument();
    await userEvent.click(header);
    expect(within(section).queryByRole('list')).not.toBeInTheDocument();
  });

  it('personal notes are bound to the character', async () => {
    const { store, character } = renderWithCharacter(<CheatSheetView />);
    const notes = screen.getByLabelText('Personal notes');
    await userEvent.type(notes, 'Remember Hunter');
    expect(notes).toHaveValue('Remember Hunter');
    await new Promise((r) => setTimeout(r, 400));
    expect(store.chars.get(character.id)?.notes).toBe('Remember Hunter');
  });
});
