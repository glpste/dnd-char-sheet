import type { Ability, Character, Weapon } from '../model/character';
import { SKILLS, type SkillKey } from '../model/skills';

export function clampScore(n: number): number {
  if (Number.isNaN(n)) return 10;
  return Math.min(30, Math.max(1, Math.trunc(n)));
}

export function abilityMod(score: number): number {
  return Math.floor((clampScore(score) - 10) / 2);
}

export function proficiencyBonus(level: number): number {
  const l = Number.isNaN(level) ? 1 : Math.min(20, Math.max(1, Math.trunc(level)));
  return 2 + Math.floor((l - 1) / 4);
}

export function profBonus(c: Character): number {
  return c.proficiencyBonusOverride ?? proficiencyBonus(c.info.level);
}

export function mod(c: Character, a: Ability): number {
  return abilityMod(c.abilities[a]);
}

export function saveTotal(c: Character, a: Ability): number {
  const s = c.saves[a];
  if (s.override !== undefined) return s.override;
  return mod(c, a) + (s.proficient ? profBonus(c) : 0);
}

const PROF_MULT = { none: 0, proficient: 1, expertise: 2 } as const;

export function skillTotal(c: Character, k: SkillKey): number {
  const s = c.skills[k];
  if (s.override !== undefined) return s.override;
  const def = SKILLS.find((d) => d.key === k);
  if (!def) return 0;
  return mod(c, def.ability) + profBonus(c) * PROF_MULT[s.proficiency];
}

export function passivePerception(c: Character): number {
  return c.passivePerceptionOverride ?? 10 + skillTotal(c, 'perception');
}

export function initiative(c: Character): number {
  return c.combat.initiativeOverride ?? mod(c, 'dex');
}

function weaponAbilityMod(c: Character, w: Weapon): number {
  switch (w.ability) {
    case 'none':
      return 0;
    case 'finesse':
      return Math.max(mod(c, 'str'), mod(c, 'dex'));
    default:
      return mod(c, w.ability);
  }
}

export function weaponAttackBonus(c: Character, w: Weapon): number {
  if (w.attackOverride !== undefined) return w.attackOverride;
  return weaponAbilityMod(c, w) + (w.proficient ? profBonus(c) : 0) + w.magicBonus;
}

export function weaponDamageBonus(c: Character, w: Weapon): number {
  if (w.damageBonusOverride !== undefined) return w.damageBonusOverride;
  return weaponAbilityMod(c, w) + w.magicBonus;
}

export function spellSaveDc(c: Character): number | null {
  if (c.spellbook.saveDcOverride !== undefined) return c.spellbook.saveDcOverride;
  if (!c.spellbook.ability) return null;
  return 8 + profBonus(c) + mod(c, c.spellbook.ability);
}

export function spellAttackBonus(c: Character): number | null {
  if (c.spellbook.attackOverride !== undefined) return c.spellbook.attackOverride;
  if (!c.spellbook.ability) return null;
  return profBonus(c) + mod(c, c.spellbook.ability);
}

export function formatMod(n: number): string {
  return n < 0 ? `${n}` : `+${n}`;
}
