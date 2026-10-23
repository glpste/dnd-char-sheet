import { SKILLS, type SkillKey } from './skills';

export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export const ABILITIES: readonly Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
export const ABILITY_LABELS: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export type Proficiency = 'none' | 'proficient' | 'expertise';
export type WeaponAbility = Ability | 'finesse' | 'none';
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SlotLevel = Exclude<SpellLevel, 0>;
export const SLOT_LEVELS: readonly SlotLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const SPELL_LEVELS: readonly SpellLevel[] = [0, ...SLOT_LEVELS];

export interface Weapon {
  id: string;
  name: string;
  ability: WeaponAbility;
  proficient: boolean;
  magicBonus: number;
  attackOverride?: number;
  damageDice: string;
  damageType: string;
  damageBonusOverride?: number;
  range: string;
  properties: string;
  effects: string;
  notes: string;
}

export interface Spell {
  id: string;
  name: string;
  level: SpellLevel;
  prepared: boolean;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
}

export interface SlotState {
  total: number;
  used: number;
}

export interface Character {
  id: string;
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  info: {
    name: string;
    playerName: string;
    race: string;
    class: string;
    level: number;
    background: string;
    alignment: string;
    xp: number;
  };
  abilities: Record<Ability, number>;
  inspiration: boolean;
  proficiencyBonusOverride?: number;
  saves: Record<Ability, { proficient: boolean; override?: number }>;
  skills: Record<SkillKey, { proficiency: Proficiency; override?: number }>;
  passivePerceptionOverride?: number;
  otherProficiencies: string;
  combat: {
    ac: number;
    initiativeOverride?: number;
    speed: string;
    hp: { max: number; current: number; temp: number };
    hitDice: { total: string; current: number };
    deathSaves: { successes: 0 | 1 | 2 | 3; failures: 0 | 1 | 2 | 3 };
  };
  weapons: Weapon[];
  equipment: { cp: number; sp: number; ep: number; gp: number; pp: number; text: string };
  personality: { traits: string; ideals: string; bonds: string; flaws: string };
  features: string;
  spellbook: {
    ability: Ability | null;
    saveDcOverride?: number;
    attackOverride?: number;
    slots: Record<SlotLevel, SlotState>;
    spells: Spell[];
  };
  notes: string;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function newWeapon(): Weapon {
  return {
    id: newId(),
    name: '',
    ability: 'str',
    proficient: true,
    magicBonus: 0,
    damageDice: '',
    damageType: '',
    range: '',
    properties: '',
    effects: '',
    notes: '',
  };
}

export function newSpell(level: SpellLevel): Spell {
  return {
    id: newId(),
    name: '',
    level,
    prepared: false,
    castingTime: '',
    range: '',
    components: '',
    duration: '',
    description: '',
  };
}

export function newCharacter(name = 'New character'): Character {
  const now = new Date().toISOString();
  const saves = Object.fromEntries(
    ABILITIES.map((a) => [a, { proficient: false }]),
  ) as Character['saves'];
  const skills = Object.fromEntries(
    SKILLS.map((s) => [s.key, { proficiency: 'none' as Proficiency }]),
  ) as Character['skills'];
  const slots = Object.fromEntries(
    SLOT_LEVELS.map((l) => [l, { total: 0, used: 0 }]),
  ) as Character['spellbook']['slots'];
  return {
    id: newId(),
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    info: {
      name,
      playerName: '',
      race: '',
      class: '',
      level: 1,
      background: '',
      alignment: '',
      xp: 0,
    },
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    inspiration: false,
    saves,
    skills,
    otherProficiencies: '',
    combat: {
      ac: 10,
      speed: '30 ft',
      hp: { max: 10, current: 10, temp: 0 },
      hitDice: { total: '1d8', current: 1 },
      deathSaves: { successes: 0, failures: 0 },
    },
    weapons: [],
    equipment: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, text: '' },
    personality: { traits: '', ideals: '', bonds: '', flaws: '' },
    features: '',
    spellbook: { ability: null, slots, spells: [] },
    notes: '',
  };
}
