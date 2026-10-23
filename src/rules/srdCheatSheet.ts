/**
 * Condensed core mechanics, summarised from the Systems Reference Document 5.1
 * (2014 rules) by Wizards of the Coast, licensed under CC-BY-4.0.
 * Keep each section to a dozen one-liners: this is a glance-at-the-table reference.
 */
export interface CheatSection {
  id: string;
  title: string;
  lines: string[];
}

export const SRD_ATTRIBUTION =
  'Rules summarised from the Systems Reference Document 5.1 by Wizards of the Coast, CC-BY-4.0.';

export const CHEAT_SHEET: readonly CheatSection[] = [
  {
    id: 'checks',
    title: 'Ability checks and DCs',
    lines: [
      'Roll d20 + ability modifier (+ proficiency bonus if the skill or tool is proficient). Meet or beat the DC.',
      'Very easy 5 · Easy 10 · Medium 15 · Hard 20 · Very hard 25 · Nearly impossible 30.',
      'Contest: both roll a check; higher wins, ties keep the status quo.',
      'Passive check = 10 + all modifiers (+5 with advantage, −5 with disadvantage).',
      'Group check: succeeds if at least half the group succeeds.',
      'Working together: one rolls with advantage; only if the helper could attempt it alone.',
    ],
  },
  {
    id: 'advantage',
    title: 'Advantage and disadvantage',
    lines: [
      'Roll two d20s: take the higher (advantage) or lower (disadvantage).',
      'They never stack. If you have both, roll one d20 normally, no matter how many sources.',
      'Inspiration: spend it to gain advantage on one attack, check or save.',
      'Common advantage: attacking a prone/restrained/stunned/paralysed/unconscious target in melee, unseen attacker, Help action.',
      'Common disadvantage: attacking at long range, ranged attack within 5 ft of a hostile, prone attacker, heavily obscured target, exhaustion.',
    ],
  },
  {
    id: 'attack',
    title: 'Attack rolls and damage',
    lines: [
      'Attack: d20 + ability mod + proficiency bonus (if proficient) + magic bonus vs target AC.',
      'Melee uses STR; ranged uses DEX; finesse weapons choose either; thrown uses the melee ability.',
      'Damage: weapon dice + the same ability mod (+ magic). Off-hand attack adds no ability mod unless it is negative.',
      'Natural 20 always hits and is a critical hit: roll all damage dice twice, add modifiers once.',
      'Natural 1 always misses.',
      'Unseen target: attack with disadvantage; if you guess the wrong square you miss.',
      'Unarmed strike: 1 + STR mod bludgeoning, always proficient.',
      'Resistance halves damage; vulnerability doubles; apply after all other modifiers.',
    ],
  },
  {
    id: 'saves',
    title: 'Saving throws',
    lines: [
      'd20 + ability mod + proficiency bonus (if proficient in that save) vs the DC.',
      'Spell save DC = 8 + proficiency bonus + spellcasting ability mod.',
      'Half damage on a successful save is the norm for area spells.',
      'Concentration save: CON save DC 10 or half the damage taken, whichever is higher, each time you take damage.',
    ],
  },
  {
    id: 'proficiency',
    title: 'Proficiency bonus by level',
    lines: [
      'Levels 1–4: +2',
      'Levels 5–8: +3',
      'Levels 9–12: +4',
      'Levels 13–16: +5',
      'Levels 17–20: +6',
      'Expertise doubles it for the chosen skill or tool. It is never added twice otherwise.',
    ],
  },
  {
    id: 'turn',
    title: 'Your turn',
    lines: [
      'Move up to your speed (can split around actions) + one action + possibly one bonus action + free object interaction.',
      'One reaction per round, regained at the start of your turn.',
      'Initiative: DEX check at the start of combat; ties are broken by the GM or by DEX score.',
      'Surprise: a surprised creature cannot move or act on its first turn and cannot react until that turn ends.',
      'Difficult terrain: each foot costs 2 ft. Standing from prone costs half your speed.',
      'Dropping to 0 HP, grappled, or speed 0 ends movement.',
    ],
  },
  {
    id: 'actions',
    title: 'Actions in combat',
    lines: [
      'Attack: one melee or ranged attack (more with Extra Attack).',
      'Cast a Spell: casting time of 1 action.',
      'Dash: extra movement equal to your speed.',
      'Disengage: your movement does not provoke opportunity attacks this turn.',
      'Dodge: attacks against you have disadvantage and you have advantage on DEX saves until your next turn (lost if incapacitated or speed 0).',
      'Help: give an ally advantage on their next check, or on their next attack against a creature within 5 ft of you.',
      'Hide: DEX (Stealth) check vs passive Perception; you must be unseen.',
      'Ready: choose a trigger and an action (or movement); it uses your reaction. Readied spells require concentration.',
      'Search: WIS (Perception) or INT (Investigation) check.',
      'Use an Object: interact with a second object or one that needs an action.',
      'Improvise: anything else; the GM sets the check.',
    ],
  },
  {
    id: 'bonus-reaction',
    title: 'Bonus actions and reactions',
    lines: [
      'Bonus action only if a feature or spell grants one; one per turn.',
      'Casting a bonus-action spell means your only other spell this turn must be a cantrip with a casting time of 1 action.',
      'Two-weapon fighting: after attacking with a light melee weapon, bonus action to attack with another light melee weapon in the other hand; no ability mod to that damage unless negative.',
      'Opportunity attack: reaction, one melee attack when a hostile you can see leaves your reach. Not triggered by teleport, forced movement, or Disengage.',
      'Readied action and spells like Shield or Counterspell also use your reaction.',
    ],
  },
  {
    id: 'cover',
    title: 'Cover',
    lines: [
      'Half cover: +2 to AC and DEX saves (low wall, furniture, another creature).',
      'Three-quarters cover: +5 to AC and DEX saves (portcullis, arrow slit, thick tree trunk).',
      'Total cover: cannot be targeted directly; area effects can still reach if they wrap around.',
      'Only the highest cover applies.',
    ],
  },
  {
    id: 'conditions',
    title: 'Conditions',
    lines: [
      'Blinded: auto-fail sight checks; your attacks have disadvantage, attacks on you have advantage.',
      'Charmed: cannot attack the charmer; charmer has advantage on social checks against you.',
      'Deafened: auto-fail hearing checks.',
      'Frightened: disadvantage on checks and attacks while the source is in sight; cannot willingly approach it.',
      'Grappled: speed 0; ends if the grappler is incapacitated or you are moved out of reach.',
      'Incapacitated: no actions or reactions.',
      'Invisible: heavily obscured; attacks on you have disadvantage, yours have advantage.',
      'Paralysed: incapacitated, cannot move or speak, auto-fail STR/DEX saves; attacks on you have advantage and hit within 5 ft are crits.',
      'Petrified: as paralysed, weight ×10, resistance to all damage, immune to poison and disease.',
      'Poisoned: disadvantage on attacks and checks.',
      'Prone: crawl only; disadvantage on your attacks; melee attacks on you have advantage, ranged have disadvantage.',
      'Restrained: speed 0; disadvantage on your attacks and DEX saves; attacks on you have advantage.',
      'Stunned: incapacitated, cannot move, auto-fail STR/DEX saves; attacks on you have advantage.',
      'Unconscious: as stunned plus prone and you drop what you hold; melee hits within 5 ft are crits.',
      'Exhaustion 1–6: disadvantage on checks · speed halved · disadvantage on attacks and saves · HP max halved · speed 0 · death.',
    ],
  },
  {
    id: 'hp',
    title: 'Hit points, temp HP, dropping to 0',
    lines: [
      'Damage reduces temporary HP first, then current HP. Temp HP does not stack: keep the higher value.',
      'Healing cannot exceed your maximum; temp HP is not healing and is lost on a long rest.',
      'At 0 HP you fall unconscious; damage left over equal to or above your max HP kills you outright.',
      'Taking damage at 0 HP = one death save failure (two on a crit).',
      'Knock out instead of kill: declare it on a melee hit that drops the target to 0.',
    ],
  },
  {
    id: 'death',
    title: 'Death saves and stabilising',
    lines: [
      'Start of your turn at 0 HP: roll d20, no modifiers. 10+ success, 9− failure.',
      'Three successes: stable. Three failures: dead. Counters reset when you regain HP or stabilise.',
      'Natural 20: regain 1 HP. Natural 1: two failures.',
      'Stabilise an ally: action, WIS (Medicine) DC 10, or a healer’s kit (no check), or any healing.',
      'Stable creature regains 1 HP after 1d4 hours if not healed.',
    ],
  },
  {
    id: 'rest',
    title: 'Resting',
    lines: [
      'Short rest: at least 1 hour. Spend hit dice: roll each + CON mod, regain that many HP.',
      'Long rest: at least 8 hours (6 sleeping), once per 24 h. Regain all HP and half your total hit dice (minimum 1).',
      'A long rest is interrupted by 1+ hour of walking, fighting, casting or similar.',
      'Long rest also resets spell slots and most class features; exhaustion drops by one level if you have food and drink.',
    ],
  },
  {
    id: 'grapple',
    title: 'Grapple and shove',
    lines: [
      'Both replace one attack of your Attack action; target must be no more than one size larger and within reach.',
      'Grapple: your STR (Athletics) vs their STR (Athletics) or DEX (Acrobatics). Success: target is grappled; you can drag it at half speed.',
      'Escape a grapple: action, same contest in reverse.',
      'Shove: same contest. Success: knock prone or push 5 ft away.',
    ],
  },
  {
    id: 'spellcasting',
    title: 'Spellcasting basics',
    lines: [
      'Spell slots: casting expends one slot of the spell’s level or higher; cantrips never use a slot.',
      'Known or prepared spells: casters prepare from their list after a long rest (ability mod + level, minimum 1).',
      'Components: V (speak), S (free hand), M (focus or pouch unless a cost is listed; a costly component is consumed only if the spell says so).',
      'Concentration: one spell at a time; ends when you cast another concentration spell, fail a concentration save, or are incapacitated.',
      'Ritual: cast in 10 extra minutes without using a slot, if the spell has the ritual tag and your class allows it.',
      'Spell attack: d20 + proficiency + casting ability mod. Spell save DC: 8 + proficiency + casting ability mod.',
      'Targets need a clear path; total cover blocks. Area origin points are not blocked by the caster.',
      'Reaction spells (Shield, Counterspell, Feather Fall) can be cast on another creature’s turn; the bonus-action spell limit only applies to spells cast on your own turn.',
    ],
  },
  {
    id: 'dcs',
    title: 'Common DCs and checks',
    lines: [
      'Long jump: STR score in feet with a 10 ft run-up (half from standing). High jump: 3 + STR mod feet.',
      'Climb or swim: 1 extra foot of movement per foot; checks only in hard conditions.',
      'Falling: 1d6 bludgeoning per 10 ft, max 20d6; land prone unless you avoid damage.',
      'Suffocating: hold breath 1 + CON mod minutes (min 30 s); then CON mod rounds (min 1) before dropping to 0 HP.',
      'Food: 3 + CON mod days without food before exhaustion; water: 1 gallon per day or a DC 15 CON save.',
      'Tracking, recalling lore, haggling: Medium (15) is the default if nothing else fits.',
    ],
  },
  {
    id: 'travel',
    title: 'Travel pace',
    lines: [
      'Fast: 400 ft/min, 4 mi/h, 30 mi/day; −5 to passive Perception.',
      'Normal: 300 ft/min, 3 mi/h, 24 mi/day.',
      'Slow: 200 ft/min, 2 mi/h, 18 mi/day; can use Stealth.',
      'Forced march: beyond 8 hours, CON save DC 10 + 1 per extra hour or gain one level of exhaustion.',
      'Difficult terrain halves pace; mounts can gallop for 1 hour at double speed.',
    ],
  },
  {
    id: 'vision',
    title: 'Light and vision',
    lines: [
      'Bright light: normal vision. Dim light: lightly obscured, disadvantage on Perception by sight.',
      'Darkness: heavily obscured, effectively blinded for sight.',
      'Darkvision: see dim light as bright and darkness as dim (shades of grey) within range.',
      'Blindsight: perceive without sight within range. Truesight: see invisible, through illusions and darkness, into the Ethereal.',
      'Torch 20 ft bright/20 ft dim, 1 h · Lamp 15/30 ft, 6 h · Bullseye lantern 60 ft cone/60 ft · Hooded lantern 30/30 ft, 6 h.',
    ],
  },
];
