import { useCharacter } from '../../store/useCharacter';
import { Panel } from '../ui/StatBox';
import { btn, cx } from '../ui/styles';
import { WeaponRow } from './WeaponRow';
import { WEAPON_GRID } from './weaponGrid';

/** Weapons list; the scroll region caps height so column C never grows past the viewport. */
export function WeaponsTable() {
  const { character, dispatch } = useCharacter();
  const weapons = character.weapons;
  return (
    <Panel
      title="Weapons"
      className="min-h-0"
      right={
        <button type="button" className={btn} onClick={() => dispatch({ type: 'weapon/add' })}>
          Add weapon
        </button>
      }
    >
      <div className={cx(WEAPON_GRID, 'border-b border-zinc-200 pb-0.5 text-[10px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500')}>
        <span />
        <span>Name</span>
        <span>Atk</span>
        <span>Damage</span>
        <span>Range</span>
      </div>
      <ul data-testid="weapons-scroll" className="max-h-[18rem] min-h-0 overflow-y-auto">
        {weapons.length === 0 && (
          <li className="py-2 text-sm text-zinc-400 dark:text-zinc-500">No weapons yet. Add one to see its attack bonus.</li>
        )}
        {weapons.map((w, i) => (
          <WeaponRow key={w.id} weapon={w} index={i} count={weapons.length} />
        ))}
      </ul>
    </Panel>
  );
}
