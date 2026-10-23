import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastHost } from '../ui/ToastHost';
import { renderWithCharacter } from '../../test/renderWithCharacter';
import { HpBlock } from './HpBlock';

// Ranger fixture: max 44, current 31, temp 5.
function setup() {
  return renderWithCharacter(
    <>
      <HpBlock />
      <ToastHost />
    </>,
  );
}

const current = () => screen.getByLabelText('Current hit points');
const temp = () => screen.getByLabelText('Temporary hit points');
const max = () => screen.getByLabelText('Maximum hit points');

describe('HpBlock', () => {
  it('damage comes off temp hp first', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: '−5' }));
    expect(temp()).toHaveValue('0');
    expect(current()).toHaveValue('31');
    await userEvent.click(screen.getByRole('button', { name: '−5' }));
    expect(current()).toHaveValue('26');
  });

  it('healing clamps to max', async () => {
    setup();
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: '+5' }));
    expect(current()).toHaveValue('44');
  });

  it('offers undo for the last change', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: '−1' }));
    expect(temp()).toHaveValue('4');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(temp()).toHaveValue('5');
    expect(current()).toHaveValue('31');
  });

  it('lowering max clamps current', async () => {
    setup();
    await userEvent.clear(max());
    await userEvent.type(max(), '20{Enter}');
    expect(current()).toHaveValue('20');
  });
});
