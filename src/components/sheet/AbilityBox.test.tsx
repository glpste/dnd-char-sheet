import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithCharacter } from '../../test/renderWithCharacter';
import { AbilityBox } from './AbilityBox';

describe('AbilityBox', () => {
  it('shows the modifier and updates when the score changes', async () => {
    renderWithCharacter(<AbilityBox ability="dex" />);
    expect(screen.getByTestId('mod-dex')).toHaveTextContent('+4');
    const score = screen.getByLabelText('Dexterity score');
    await userEvent.clear(score);
    await userEvent.type(score, '8{Enter}');
    expect(screen.getByTestId('mod-dex')).toHaveTextContent('-1');
  });
});
