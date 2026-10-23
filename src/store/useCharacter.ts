import { useContext } from 'react';
import { CharacterContext, type CharacterContextValue } from './CharacterProvider';

function useStore(): CharacterContextValue {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be used inside <CharacterProvider>');
  return ctx;
}

export function useCharacter() {
  const { character, dispatch, saveState, undoHp } = useStore();
  return { character, dispatch, saveState, undoHp };
}

export function useRoster() {
  const { summaries, activeId, create, duplicate, rename, remove, select, exportAll, exportOne, importJson } =
    useStore();
  return { summaries, activeId, create, duplicate, rename, remove, select, exportAll, exportOne, importJson };
}

export function useToast() {
  const { toasts, pushToast, dismissToast } = useStore();
  return { toasts, pushToast, dismissToast };
}
