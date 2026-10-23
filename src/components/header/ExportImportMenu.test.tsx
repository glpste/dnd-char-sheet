import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithCharacter } from '../../test/renderWithCharacter';
import { ExportImportMenu, importResultMessage } from './ExportImportMenu';

describe('ExportImportMenu', () => {
  it('closes on Escape', async () => {
    renderWithCharacter(<ExportImportMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Export / import' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('importResultMessage', () => {
  it('mentions skipped entries', () => {
    expect(importResultMessage({ ok: true, count: 1, skipped: 0 })).toBe('Imported 1 character');
    expect(importResultMessage({ ok: true, count: 2, skipped: 1 })).toBe('Imported 2 characters, 1 skipped');
    expect(importResultMessage({ ok: false, error: 'bad' })).toBe('bad');
  });
});
