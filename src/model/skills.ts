import type { Ability } from './character';

export type SkillKey =
  | 'acrobatics' | 'animalHandling' | 'arcana' | 'athletics' | 'deception' | 'history'
  | 'insight' | 'intimidation' | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleightOfHand' | 'stealth' | 'survival';

export interface SkillDef {
  key: SkillKey;
  label: string;
  ability: Ability;
}

/** PDF page-1 order (alphabetical). */
export const SKILLS: readonly SkillDef[] = [
  { key: 'acrobatics', label: 'Acrobatics', ability: 'dex' },
  { key: 'animalHandling', label: 'Animal handling', ability: 'wis' },
  { key: 'arcana', label: 'Arcana', ability: 'int' },
  { key: 'athletics', label: 'Athletics', ability: 'str' },
  { key: 'deception', label: 'Deception', ability: 'cha' },
  { key: 'history', label: 'History', ability: 'int' },
  { key: 'insight', label: 'Insight', ability: 'wis' },
  { key: 'intimidation', label: 'Intimidation', ability: 'cha' },
  { key: 'investigation', label: 'Investigation', ability: 'int' },
  { key: 'medicine', label: 'Medicine', ability: 'wis' },
  { key: 'nature', label: 'Nature', ability: 'int' },
  { key: 'perception', label: 'Perception', ability: 'wis' },
  { key: 'performance', label: 'Performance', ability: 'cha' },
  { key: 'persuasion', label: 'Persuasion', ability: 'cha' },
  { key: 'religion', label: 'Religion', ability: 'int' },
  { key: 'sleightOfHand', label: 'Sleight of hand', ability: 'dex' },
  { key: 'stealth', label: 'Stealth', ability: 'dex' },
  { key: 'survival', label: 'Survival', ability: 'wis' },
];
