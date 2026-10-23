import { ABILITIES, ABILITY_LABELS, type Ability } from '../../model/character';
import { SKILLS, type SkillKey } from '../../model/skills';
import { formatMod, passivePerception, profBonus, proficiencyBonus, saveTotal, skillTotal } from '../../rules/derive';
import { useCharacter } from '../../store/useCharacter';
import { DerivedField } from '../ui/DerivedField';
import { NumberField } from '../ui/NumberField';
import { Panel } from '../ui/StatBox';
import { TextArea } from '../ui/TextArea';
import { Toggle } from '../ui/Toggle';
import { cx, panel, panelTitle } from '../ui/styles';
import { ProficiencyDot } from './ProficiencyDot';

function Row({
  testId,
  label,
  abilityTag,
  total,
  dot,
}: {
  testId: string;
  label: string;
  abilityTag?: string;
  total: number;
  dot: React.ReactNode;
}) {
  return (
    <div data-testid={testId} className="flex items-center gap-1.5 py-[1px] text-sm leading-tight">
      {dot}
      <span className="truncate">{label}</span>
      {abilityTag && <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500">{abilityTag}</span>}
      <span data-testid="total" className="ml-auto tabular-nums font-medium">
        {formatMod(total)}
      </span>
    </div>
  );
}

export function SavingThrows() {
  const { character, dispatch } = useCharacter();
  return (
    <Panel title="Saving throws">
      <div className="grid grid-cols-2 gap-x-3">
        {ABILITIES.map((a: Ability) => (
          <Row
            key={a}
            testId={`save-row-${a}`}
            label={ABILITY_LABELS[a]}
            total={saveTotal(character, a)}
            dot={
              <ProficiencyDot
                label={`${ABILITY_LABELS[a]} save`}
                allowExpertise={false}
                value={character.saves[a].proficient ? 'proficient' : 'none'}
                onChange={(p) => dispatch({ type: 'patch', patch: { saves: { [a]: { proficient: p !== 'none' } } } })}
              />
            }
          />
        ))}
      </div>
    </Panel>
  );
}

export function SkillList() {
  const { character, dispatch } = useCharacter();
  return (
    <Panel title="Skills" className="flex-1">
      <div className="grid grid-cols-2 gap-x-3">
        {SKILLS.map((s) => (
          <Row
            key={s.key}
            testId={`skill-row-${s.key}`}
            label={s.label}
            abilityTag={s.ability}
            total={skillTotal(character, s.key)}
            dot={
              <ProficiencyDot
                label={s.label}
                value={character.skills[s.key].proficiency}
                onChange={(proficiency) =>
                  dispatch({ type: 'patch', patch: { skills: { [s.key as SkillKey]: { proficiency } } } })
                }
              />
            }
          />
        ))}
      </div>
    </Panel>
  );
}

export function SavesSkillsColumn() {
  const { character, dispatch } = useCharacter();
  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <div className={cx(panel, 'flex items-center justify-between px-2 py-1.5')}>
          <span className={panelTitle}>Inspiration</span>
          <Toggle
            label="Inspiration"
            hideLabel
            checked={character.inspiration}
            onChange={(inspiration) => dispatch({ type: 'patch', patch: { inspiration } })}
          />
        </div>
        <div className={cx(panel, 'flex items-center justify-between px-2 py-1.5')}>
          <span className={panelTitle}>Proficiency bonus</span>
          <DerivedField
            label="Proficiency bonus"
            auto={proficiencyBonus(character.info.level)}
            override={character.proficiencyBonusOverride}
            onOverride={(n) => dispatch({ type: 'patch', patch: { proficiencyBonusOverride: n } })}
          />
        </div>
      </div>
      <SavingThrows />
      <SkillList />
      <div className={cx(panel, 'flex items-center justify-between px-2 py-1.5')}>
        <span className={panelTitle}>Passive perception</span>
        <NumberField
          aria-label="Passive perception"
          value={passivePerception(character)}
          min={0}
          max={50}
          onChange={(n) =>
            dispatch({
              type: 'patch',
              patch: { passivePerceptionOverride: n === 10 + skillTotal(character, 'perception') ? undefined : n },
            })
          }
          className={cx(
            'w-10 text-center font-medium',
            character.passivePerceptionOverride !== undefined && 'border-dashed border-amber-500/70',
          )}
        />
      </div>
      <Panel title="Other proficiencies and languages" className="max-h-40">
        <TextArea
          aria-label="Other proficiencies and languages"
          value={character.otherProficiencies}
          onChange={(v) => dispatch({ type: 'patch', patch: { otherProficiencies: v } })}
          autoGrow={false}
          minRows={3}
          className="h-full min-h-0 flex-1 overflow-y-auto"
          placeholder={`Common, Elvish · light armor · prof. bonus +${profBonus(character)}`}
        />
      </Panel>
    </div>
  );
}
