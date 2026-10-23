# D&D 5E Character Sheet SPA — Design

## Context

The repo `C:\Dev\repos\dnd-sheet-spa` contains only `res/5E_CharacterSheet_Fillable.pdf` (the official WotC fillable sheet). The PDF is awkward at the table: no auto-calculation, no quick HP adjustments, no room for weapon effects, no spell list structure, and rules lookups need a separate book. We're building a single-page web app that reproduces page 1 of the PDF as a dense landscape sheet, adds a weapons section, a free-text spellbook, and a built-in rules cheat sheet, with everything saved locally in the browser.

Remote: `git@github.com:glpste/dnd-char-sheet.git` — public, currently has one "Initial commit" on `master` containing only `README.md`, default branch `master`, Pages not enabled. Local repo has no commits. Target: default branch `main` built on top of that initial commit; remote `master` deleted afterwards.

## Intent

A desktop/landscape character sheet for use *during play*. Reading and editing are equally important: every number must be legible at a glance and editable in place. Combat-relevant state (AC, HP, initiative, saves, attacks) must fit on one 1920×1080 screen without scrolling.

## Goals

- All page-1 fields of the PDF, auto-calculated where the rules allow, overridable by hand.
- Dedicated weapons section with per-weapon special effects and notes.
- Freeform spellbook: list of free-text spell entries grouped by level, with spell slot tracking and prepared toggles.
- Built-in cheat sheet of core 5E mechanics plus per-character personal notes.
- Multiple characters in one browser with a switcher, plus JSON export/import.
- Autosave on every change. No data loss.
- Deployable to GitHub Pages.

## Non-goals

- No backend, accounts, or sync (storage layer is abstracted so one can be added later).
- No spell/item/monster rules database. Spells and weapons are free text.
- No dice roller, no ammo tracking (not requested; can be added later).
- No PDF page 2/3 (appearance, backstory, allies, spellcasting page). Page-2 spell data is replaced by the freeform spellbook.
- No mobile/portrait layout. The app should not break below 1280px wide, but it may scroll; design target is ≥1440px landscape.

## Anti-goals (what would make this a failure)

- **Losing data.** Autosave every change; destructive actions (delete character, clear spellbook, import overwrite) confirm first; export always one click away; import never silently overwrites.
- Needing to scroll to find AC/HP/attacks mid-combat at 1080p.

## Constraints and stack (my calls, confirmed by user as "use your default")

- Vite + React 18 + TypeScript (strict), Tailwind CSS v3.
- No UI kit, no state library beyond React. Dependencies kept minimal.
- Testing: Vitest + React Testing Library for rules math, storage, and key interactions.
- Persistence: `localStorage`, behind a `StorageAdapter` interface so a remote backend can replace it later.
- Deployment: GitHub Actions workflow builds and publishes `dist/` to GitHub Pages on push to `main`. Vite `base` is set from an env var so local dev and Pages both work. Hash-based routing (`#/sheet`, `#/spellbook`, `#/cheatsheet`) so Pages needs no 404 rewrite.
- Theme: clean utility UI, dark mode default, light/dark toggle persisted.

## Views and navigation

Three top-level views, switched by a button group in the header; the URL hash mirrors the active view so back/forward and bookmarks work.

**Header bar (always visible):** character switcher dropdown (switch, new, duplicate, rename, delete), character summary line (name, race, class & level, background, alignment, XP, player name — editable in a popover or inline), view buttons (Sheet / Spellbook / Cheat sheet), export/import menu, theme toggle, "saved" indicator.

### 1. Sheet view (four-column landscape grid, approved wireframe)

Column A (narrow): six ability score boxes. Each shows the modifier large, the score small below, score editable.

Column B: Inspiration toggle · proficiency bonus (auto from level, overridable) · saving throws (six rows, proficiency checkbox, total) · skills (18 rows in the PDF's alphabetical order, proficiency checkbox, total; expertise supported via a second click state) · passive perception (auto) · other proficiencies & languages (textarea).

Column C: AC / Initiative / Speed boxes (AC and speed manual; initiative auto from DEX, overridable) · HP block (visually emphasized: current / max, temp HP, quick ±1 / ±5 buttons, direct edit; current HP clamped to [0, max]) · hit dice (current / total, total free text like "5d10") · death saves (3 success + 3 failure toggles) · **Weapons** table · equipment & coin (CP/SP/EP/GP/PP numeric + textarea).

Column D: personality traits, ideals, bonds, flaws (textareas) · features & traits (large textarea, fills remaining height).

Textareas auto-grow within their column; the column may scroll internally if prose outgrows the screen, but the combat column never scrolls.

**Column C overflow (my call):** AC/init/speed, HP, hit dice and death saves are pinned. The weapons list has a max height of roughly five collapsed rows and scrolls internally beyond that; expanding a row pushes content within that scroll region, never overlays. The equipment textarea is height-capped (~4 lines) and scrolls internally. Thus the column as a whole never scrolls.

### 2. Weapons section (inside Sheet view)

Rows, add/remove/reorder (up/down buttons). Each row:

- Name
- Ability used: STR / DEX / finesse (max of both) / none, plus proficient checkbox → **attack bonus** auto = ability mod + prof (if proficient) + magic bonus field; overridable.
- Damage: dice string (free text, e.g. "1d8") + damage type (free text) + damage bonus auto = ability mod + magic bonus, overridable. Displayed as "1d8+4 piercing".
- Range (free text, e.g. "5 ft" or "150/600").
- Properties (free text).
- Special effects (free text, multi-line; e.g. "Hunter's Mark +1d6", "on crit: …").
- Notes (free text).

Compact table row shows name / atk / damage / range; an expand chevron reveals properties, effects, notes, and the ability/proficiency/magic controls.

### 3. Spellbook view

- Header: spellcasting ability (dropdown), spell save DC (auto = 8 + prof + ability mod, overridable), spell attack bonus (auto, overridable).
- Spell slots: levels 1–9, each with total (editable) and used (click pips to toggle); "long rest" button resets used to 0 after confirm. Levels with total 0 are hidden.
- Spell entries grouped by level 0–9 (cantrips = 0). Each entry: name, level, prepared toggle, optional casting time / range / components / duration, free-text description (multi-line). Add / edit inline / delete / move.
- Filter: show prepared only; text search by name.
- No rules database; everything typed by the user.

### 4. Cheat sheet view

- Left: built-in, read-only condensed reference written from the **SRD 5.1 (2014 rules)**, CC-BY-4.0, attribution in footer. Covers: ability checks & DCs; attack rolls (d20 + ability mod + prof vs AC), damage, crits; advantage/disadvantage; saving throws; proficiency bonus by level table; actions in combat (attack, cast, dash, disengage, dodge, help, hide, ready, search, use object); bonus actions & reactions; opportunity attacks; cover; conditions (one line each); death saves & stabilizing; HP/temp HP rules; resting (short/long); two-weapon fighting; grapple/shove; spellcasting basics (slots, concentration, ritual, components); common DCs; travel pace; light/vision.
- Right: per-character personal notes (free text, autosaved).
- Sections collapsible, with an in-page search box that filters headings.

## Data model (v1)

```ts
interface Character {
  id: string; schemaVersion: 1;
  createdAt: string; updatedAt: string;
  info: { name; playerName; race; class; level: number; background; alignment; xp: number };
  abilities: Record<'str'|'dex'|'con'|'int'|'wis'|'cha', number>;
  inspiration: boolean;
  proficiencyBonusOverride?: number;
  saves: Record<Ability, { proficient: boolean; override?: number }>;
  skills: Record<SkillKey, { proficiency: 'none'|'proficient'|'expertise'; override?: number }>;
  passivePerceptionOverride?: number;
  otherProficiencies: string;
  combat: { ac: number; initiativeOverride?: number; speed: string;
            hp: { max: number; current: number; temp: number };
            hitDice: { total: string; current: number };
            deathSaves: { successes: 0|1|2|3; failures: 0|1|2|3 } };
  weapons: Weapon[];
  equipment: { cp; sp; ep; gp; pp: number; text: string };
  personality: { traits; ideals; bonds; flaws: string };
  features: string;
  spellbook: { ability: Ability|null; saveDcOverride?: number; attackOverride?: number;
               slots: Record<1..9, { total: number; used: number }>; spells: Spell[] };
  notes: string; // cheat sheet personal notes
}
```

Storage: `dnd-sheet:v1:index` (list of {id, name, updatedAt}, activeId) and `dnd-sheet:v1:char:<id>` per character. Writes are debounced ~300ms and flushed on `beforeunload`. A migration function keyed by `schemaVersion` runs on load. Export = JSON file of one or all characters; import validates shape, then asks "add as new" vs "replace existing with same id".

**Multi-tab (my call):** `StorageAdapter` exposes `subscribe(onChange)`. The localStorage adapter forwards `storage` events. When another tab writes the active character, the store adopts the external version if this tab has no pending (undebounced) edits; if it does, this tab's write wins and a toast says "Another tab changed this character; your edit was kept". Good enough for v1; the subscribe hook is what a remote backend would also need.

**Spell slot editing (my call):** levels with total 0 are hidden in the pip view; an "edit slots" toggle shows all nine levels with total inputs.

## Derivation rules (pure functions, unit-tested)

- mod(score) = floor((score − 10) / 2)
- proficiency bonus = 2 + floor((level − 1) / 4), level clamped 1–20
- save = mod + (proficient ? prof : 0)
- skill = mod(skill ability) + prof × {none: 0, proficient: 1, expertise: 2}
- passive perception = 10 + Perception skill total
- initiative = DEX mod
- weapon attack = chosen ability mod + (proficient ? prof : 0) + magic; finesse picks max(STR, DEX)
- weapon damage bonus = chosen ability mod + magic
- spell save DC = 8 + prof + mod(spellcasting ability); spell attack = prof + mod
- Any field with `…Override` set shows the override and a small "reset to auto" affordance.

## UX details

- Every number is an input styled as a display value; focus reveals the edit affordance. Number inputs select-all on focus, accept arrow keys.
- HP current clamps to [0, max]; damage applies to temp HP first when using the −buttons.
- Undo for the last HP change (single-level) shown as a toast for 5s.
- Keyboard: `1/2/3` switch views when no input is focused.
- "Saved" indicator in the header turns from "saving…" to "saved" after debounce flush.
- Confirm dialogs for: delete character, long rest (slot reset), import-replace, delete spell/weapon (weapon/spell delete is instead undoable via toast; no confirm).

## Left to the builder

- Exact Tailwind palette and spacing; component file structure; icon choice (inline SVG, no icon lib).
- Whether skills render as one or two sub-columns inside column B.
- Popover vs inline editing for the header summary fields.
- Test selection beyond the required rules-math and storage tests.
