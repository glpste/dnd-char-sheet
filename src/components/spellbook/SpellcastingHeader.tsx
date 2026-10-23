import { ABILITIES, ABILITY_LABELS, type Ability } from '../../model/character';
import { mod, profBonus } from '../../rules/derive';
import { useCharacter } from '../../store/useCharacter';
import { DerivedField } from '../ui/DerivedField';
import { cx, input, panel, panelTitle } from '../ui/styles';

export function SpellcastingHeader() {
  const { character, dispatch } = useCharacter();
  const sb = character.spellbook;
  const abilityMod = sb.ability ? mod(character, sb.ability) : 0;
  const autoDc = 8 + profBonus(character) + abilityMod;
  const autoAtk = profBonus(character) + abilityMod;
  const box = cx(panel, 'flex flex-col items-center px-3 py-1.5 text-center');
  return (
    <div className="flex items-stretch gap-2">
      <div className={cx(box, 'items-start')}>
        <label className={panelTitle} htmlFor="spell-ability">
          Spellcasting ability
        </label>
        <select
          id="spell-ability"
          value={sb.ability ?? ''}
          onChange={(e) =>
            dispatch({ type: 'patch', patch: { spellbook: { ability: (e.target.value || null) as Ability | null } } })
          }
          className={cx(input, 'mt-1 border-zinc-300 text-sm dark:border-zinc-700 dark:bg-zinc-900')}
        >
          <option value="">None</option>
          {ABILITIES.map((a) => (
            <option key={a} value={a}>
              {ABILITY_LABELS[a]}
            </option>
          ))}
        </select>
      </div>
      <div className={box}>
        <div className={panelTitle}>Spell save DC</div>
        <DerivedField
          label="Spell save DC"
          signed={false}
          auto={autoDc}
          override={sb.saveDcOverride}
          onOverride={(n) => dispatch({ type: 'patch', patch: { spellbook: { saveDcOverride: n } } })}
          inputClassName="w-12 text-2xl font-medium"
        />
      </div>
      <div className={box}>
        <div className={panelTitle}>Spell attack bonus</div>
        <DerivedField
          label="Spell attack bonus"
          auto={autoAtk}
          override={sb.attackOverride}
          onOverride={(n) => dispatch({ type: 'patch', patch: { spellbook: { attackOverride: n } } })}
          inputClassName="w-12 text-2xl font-medium"
        />
      </div>
    </div>
  );
}
