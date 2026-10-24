import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { newCharacter } from '../../model/character';
import { serialize } from '../../store/exportImport';
import { renderWithCharacter } from '../../test/renderWithCharacter';
import { ToastHost } from '../ui/ToastHost';
import { ExportImportMenu, importResultMessage } from './ExportImportMenu';

describe('ExportImportMenu', () => {
  it('closes on Escape', async () => {
    renderWithCharacter(<ExportImportMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Export / import' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  describe('paste JSON import', () => {
    async function openPasteBox() {
      await userEvent.click(screen.getByRole('button', { name: 'Export / import' }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Paste JSON…' }));
      return screen.getByRole('textbox', { name: 'Character JSON' });
    }

    it('imports a pasted export file as a new character', async () => {
      const { store } = renderWithCharacter(
        <>
          <ExportImportMenu />
          <ToastHost />
        </>,
      );
      const box = await openPasteBox();
      await userEvent.click(box);
      await userEvent.paste(serialize([newCharacter('Pasted Pete')]));
      await userEvent.click(screen.getByRole('button', { name: 'Import' }));
      expect(screen.getByRole('dialog', { name: 'Import characters' })).toHaveTextContent('Found 1 character');
      await userEvent.click(screen.getByRole('button', { name: 'Add as new' }));
      expect([...store.chars.values()].map((c) => c.info.name)).toContain('Pasted Pete');
      expect(screen.getByRole('status')).toHaveTextContent('Imported 1 character');
    });

    it('shows the parse error for text that is not JSON', async () => {
      renderWithCharacter(
        <>
          <ExportImportMenu />
          <ToastHost />
        </>,
      );
      const box = await openPasteBox();
      await userEvent.click(box);
      await userEvent.paste('not json');
      await userEvent.click(screen.getByRole('button', { name: 'Import' }));
      expect(screen.getByRole('status')).toHaveTextContent('not valid JSON');
      expect(screen.queryByRole('dialog', { name: 'Import characters' })).not.toBeInTheDocument();
    });
  });
});

describe('importResultMessage', () => {
  it('mentions skipped entries', () => {
    expect(importResultMessage({ ok: true, count: 1, skipped: 0 })).toBe('Imported 1 character');
    expect(importResultMessage({ ok: true, count: 2, skipped: 1 })).toBe('Imported 2 characters, 1 skipped');
    expect(importResultMessage({ ok: false, error: 'bad' })).toBe('bad');
  });
});

describe('ExportImportMenu paste box reset', () => {
  it('clears pasted text when the dialog is cancelled', async () => {
    renderWithCharacter(<ExportImportMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Export / import' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Paste JSON…' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Character JSON' }), 'stale');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Export / import' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Paste JSON…' }));
    expect(screen.getByRole('textbox', { name: 'Character JSON' })).toHaveValue('');
  });
});
