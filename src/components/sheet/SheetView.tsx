import { AbilityColumn } from './AbilityBox';
import { CombatColumn } from './CombatColumn';
import { SavesSkillsColumn } from './SavesSkillsColumn';

/** Four-column landscape layout: abilities · saves/skills · combat · prose. */
export function SheetView() {
  return (
    <div className="grid h-full min-h-0 grid-cols-[4.5rem_1.1fr_1.5fr_1.2fr] gap-2">
      <AbilityColumn />
      <SavesSkillsColumn />
      <CombatColumn />
      <div className="min-h-0" data-testid="prose-column" />
    </div>
  );
}
