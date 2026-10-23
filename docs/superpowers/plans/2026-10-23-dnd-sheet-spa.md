# D&D Sheet SPA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A GitHub-Pages-deployable React SPA reproducing page 1 of the 5E sheet with auto-calc, a weapons section, a freeform spellbook, and an SRD 5.1 cheat sheet, persisted in localStorage.

**Architecture:** Pure rules math in `src/rules/`, a typed `Character` model in `src/model/`, persistence behind `StorageAdapter` in `src/storage/`, a single React context store (`useReducer` + debounced persist) in `src/store/`, and three hash-routed views under `src/components/`. No state library, no UI kit.

**Tech Stack:** Vite 6, React 18, TypeScript 5 (strict), Tailwind CSS 3, Vitest + @testing-library/react + jsdom, GitHub Actions → GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-23-dnd-sheet-spa-design.md`

**Execution method (chosen by user):** Native — implemented in this session via superpowers:executing-plans, with one fresh whole-branch code review at the end (Task 14, Step 4).

## Global Constraints

- Node 24 / npm 11 locally. Package manager: npm; commit `package-lock.json`.
- Dependencies limited to: react, react-dom, and dev deps vite, @vitejs/plugin-react, typescript, tailwindcss, postcss, autoprefixer, vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @types/react, @types/react-dom. Nothing else without noting it in the plan.
- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`.
- Dark mode via Tailwind `darkMode: 'class'`; default dark.
- Routing by URL hash only: `#/sheet`, `#/spellbook`, `#/cheatsheet`. Unknown → `#/sheet`.
- localStorage keys: `dnd-sheet:v1:index`, `dnd-sheet:v1:char:<id>`. Persist debounce 300 ms, flushed on `beforeunload`.
- Combat column (AC/HP/hit dice/death saves) must be fully visible at 1920×1080 with browser chrome (viewport ≥ 1000 px tall) without page scroll.
- Copy: sentence case, no "please", no exclamation marks.
- Commit messages: Conventional Commits; each ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Default branch `main`. All work committed directly on `main` (greenfield, single developer).

## Review Focus

1. Ability score outside 1–30 or empty input → clamp to 1–30, never NaN in derived fields. (Task 2 test `clamps ability scores`.)
2. HP current set above max after max is lowered → current clamps to new max; temp HP never negative. (Task 7 test `lowering max clamps current`.)
3. Corrupt or foreign JSON in localStorage / import → store ignores the bad record, logs, and still loads the rest; import shows an error, nothing written. (Task 3 `skips corrupt character`, Task 4 `rejects invalid import`.)
4. Two tabs editing the same character → external write adopted when idle; local pending edit wins with a toast. (Task 4 `adopts external change when idle`, `keeps local pending edit`.)
5. Six-plus weapons or long equipment text → column C does not grow past the viewport; the weapons region scrolls internally. (Task 9 test `weapons region has max height class`, plus manual check.)

---

### Task 0: Git bootstrap and docs

**Files:**
- Create: `docs/superpowers/specs/2026-10-23-dnd-sheet-spa-design.md` (the design spec)
- Create: `docs/superpowers/plans/2026-10-23-dnd-sheet-spa.md` (this plan)
- Create: `.gitignore` (node_modules, dist, .env*, coverage)

- [ ] **Step 1:** `git remote add origin git@github.com:glpste/dnd-char-sheet.git && git fetch origin`
- [ ] **Step 2:** `git checkout -b main origin/master` (puts the remote's "Initial commit" README under local `main`; local `master` has no commits and is left as-is, deleted later)
- [ ] **Step 3:** Write the three files above. Keep `res/5E_CharacterSheet_Fillable.pdf` tracked (it is the reference artifact).
- [ ] **Step 4:** Commit: `docs: add design spec and implementation plan`
- [ ] **Step 5:** `git push -u origin main`
- [ ] **Step 6:** `gh api -X PATCH repos/glpste/dnd-char-sheet -f default_branch=main`, then `git push origin --delete master`, then `git branch -D master`. Verify: `gh api repos/glpste/dnd-char-sheet --jq .default_branch` prints `main`.

### Task 1: Project scaffold with hash router

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/router/useHashRoute.ts`, `src/test/setup.ts`
- Test: `src/router/useHashRoute.test.ts`, `src/App.test.tsx`

**Interfaces:**
- Produces: `type View = 'sheet' | 'spellbook' | 'cheatsheet'`; `useHashRoute(): [View, (v: View) => void]`; `parseHash(hash: string): View` (exported for tests).

- [ ] **Step 1:** `npm create vite@latest . -- --template react-ts` (confirm overwrite of nothing — dir has only res/, docs/, .gitignore). Install dev deps listed in Global Constraints. `npx tailwindcss init -p --ts`.
- [ ] **Step 2:** Configure: `vite.config.ts` with `base: process.env.VITE_BASE ?? '/'` and `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true }`; `tailwind.config.ts` `darkMode: 'class'`, content `['./index.html','./src/**/*.{ts,tsx}']`; `tsconfig.json` strict + `noUncheckedIndexedAccess`; `index.html` has `<html class="dark">` and `<title>D&D character sheet</title>`; `src/test/setup.ts` imports `@testing-library/jest-dom/vitest`.
- [ ] **Step 3:** Write failing test `src/router/useHashRoute.test.ts`:
  - `parseHash('#/spellbook')` → `'spellbook'`; `parseHash('')` → `'sheet'`; `parseHash('#/nope')` → `'sheet'`.
  - `renderHook(useHashRoute)`; call setter with `'cheatsheet'`; expect `window.location.hash === '#/cheatsheet'` and hook value `'cheatsheet'`.
- [ ] **Step 4:** Run `npx vitest run src/router` → FAIL (module not found).
- [ ] **Step 5:** Implement `useHashRoute` with `useSyncExternalStore` on `hashchange`.
- [ ] **Step 6:** Write `src/App.tsx`: renders a `<nav>` with three buttons labelled "Sheet", "Spellbook", "Cheat sheet" (aria-pressed on active) and a placeholder `<main>` showing the active view name. Test `src/App.test.tsx`: clicking "Spellbook" sets hash and shows "Spellbook" heading.
- [ ] **Step 7:** `npx vitest run` → PASS. `npm run build` → succeeds. `npm run dev` and open in browser: dark background, three buttons work.
- [ ] **Step 8:** Add npm scripts `test`, `typecheck` (`tsc --noEmit`). Commit: `feat: scaffold vite react app with hash router`

### Task 2: Character model and derivation rules

**Files:**
- Create: `src/model/character.ts`, `src/model/skills.ts`, `src/rules/derive.ts`
- Test: `src/rules/derive.test.ts`, `src/model/character.test.ts`

**Interfaces:**
- Produces (`src/model/character.ts`): types exactly as in the spec's Data model, plus `type Ability = 'str'|'dex'|'con'|'int'|'wis'|'cha'`, `type Proficiency = 'none'|'proficient'|'expertise'`, `interface Weapon { id; name; ability: Ability|'finesse'|'none'; proficient: boolean; magicBonus: number; attackOverride?: number; damageDice: string; damageType: string; damageBonusOverride?: number; range: string; properties: string; effects: string; notes: string }`, `interface Spell { id; name; level: 0..9; prepared: boolean; castingTime; range; components; duration; description: string }`, `newCharacter(name?: string): Character` (all abilities 10, level 1, hp max/current 10, empty strings, `crypto.randomUUID()` id), `ABILITIES: readonly Ability[]`.
- Produces (`src/model/skills.ts`): `SKILLS: readonly { key: SkillKey; label: string; ability: Ability }[]` in PDF alphabetical order (Acrobatics … Survival), `type SkillKey`.
- Produces (`src/rules/derive.ts`): `abilityMod(score: number): number`, `clampScore(n: number): number` (1–30, NaN→10), `proficiencyBonus(level: number): number`, `saveTotal(c, a: Ability): number`, `skillTotal(c, k: SkillKey): number`, `passivePerception(c): number`, `initiative(c): number`, `weaponAttackBonus(c, w: Weapon): number`, `weaponDamageBonus(c, w): number`, `spellSaveDc(c): number | null`, `spellAttackBonus(c): number | null`, `formatMod(n: number): string` (`+3`, `-1`, `+0`). Each `…Total` honours the corresponding `…Override` when defined.

- [ ] **Step 1:** Write failing tests in `derive.test.ts` with these exact cases: `abilityMod(10)=0, (8)=-1, (18)=4, (1)=-5, (30)=10`; `clampScore(0)=1, (31)=30, (NaN)=10`; `proficiencyBonus(1)=2, (4)=2, (5)=3, (17)=6, (20)=6, (0)=2, (25)=6`; `saveTotal` with str 16 proficient level 5 → 6, override 9 → 9; `skillTotal` expertise level 5 dex 18 → 10; `passivePerception` wis 15 proficient level 5 → 15; `weaponAttackBonus` finesse str 16 dex 18 proficient level 5 magic 1 → 8; non-proficient none-ability magic 0 → 0; `weaponDamageBonus` same finesse → 5; `spellSaveDc` ability null → null, wis 15 level 5 → 13; `formatMod(0)='+0'`.
- [ ] **Step 2:** Run `npx vitest run src/rules` → FAIL.
- [ ] **Step 3:** Implement `src/model/character.ts`, `src/model/skills.ts`, `src/rules/derive.ts`.
- [ ] **Step 4:** Test `character.test.ts`: `newCharacter('X')` has 18 skills all `'none'`, 6 saves not proficient, 9 slot levels `{total:0,used:0}`, `schemaVersion === 1`.
- [ ] **Step 5:** `npx vitest run` → PASS. Commit: `feat: character model and derivation rules`

### Task 3: Storage adapter, localStorage implementation, migration

**Files:**
- Create: `src/storage/adapter.ts`, `src/storage/localStorageAdapter.ts`, `src/storage/migrate.ts`
- Test: `src/storage/localStorageAdapter.test.ts`, `src/storage/migrate.test.ts`

**Interfaces:**
- Produces: `interface CharacterSummary { id: string; name: string; updatedAt: string }`; `interface StorageIndex { activeId: string | null; characters: CharacterSummary[] }`; `interface StorageAdapter { loadIndex(): StorageIndex; saveIndex(i: StorageIndex): void; loadCharacter(id: string): Character | null; saveCharacter(c: Character): void; deleteCharacter(id: string): void; subscribe(cb: (e: { type: 'character'; id: string } | { type: 'index' }) => void): () => void }`; `createLocalStorageAdapter(storage: Storage = window.localStorage): StorageAdapter`; `migrateCharacter(raw: unknown): Character | null` (returns null if shape invalid; v1 passthrough; fills missing optional fields from `newCharacter()`).

- [ ] **Step 1:** Failing tests: round-trip save/load character; `loadIndex()` on empty storage → `{activeId:null, characters:[]}`; `deleteCharacter` removes key; `loadCharacter` with corrupt JSON returns null and does not throw (`skips corrupt character`); `subscribe` callback fires with `{type:'character', id}` when a `StorageEvent` for `dnd-sheet:v1:char:<id>` is dispatched on `window`; `migrateCharacter({})` → null; `migrateCharacter({...valid, schemaVersion:1, notes: undefined})` → notes `''`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: localStorage adapter with migration and change subscription`

### Task 4: Character store and export/import

**Files:**
- Create: `src/store/characterReducer.ts`, `src/store/CharacterProvider.tsx`, `src/store/useCharacter.ts`, `src/store/exportImport.ts`
- Test: `src/store/characterReducer.test.ts`, `src/store/CharacterProvider.test.tsx`, `src/store/exportImport.test.ts`

**Interfaces:**
- Produces: `type Action = { type: 'patch'; patch: DeepPartial<Character> } | { type: 'set'; character: Character } | { type: 'hp'; delta: number } | { type: 'weapon/add' } | { type: 'weapon/update'; id; patch: Partial<Weapon> } | { type: 'weapon/remove'; id } | { type: 'weapon/move'; id; dir: -1|1 } | { type: 'spell/add'; level } | { type: 'spell/update'; id; patch } | { type: 'spell/remove'; id } | { type: 'spell/move'; id; dir } | { type: 'slots/toggle'; level; index } | { type: 'slots/longRest' }`; `characterReducer(c: Character, a: Action): Character` (always bumps `updatedAt`, clamps hp per spec, hp delta negative consumes temp first).
- `CharacterProvider({ adapter, children })`; `useCharacter(): { character: Character; dispatch; saveState: 'saved'|'saving'; undoHp: (() => void) | null }`; `useRoster(): { summaries; activeId; create(name); duplicate(id); rename(id,name); remove(id); select(id); exportAll(): string; exportOne(id): string; importJson(json: string, mode: 'add'|'replace'): ImportResult }`; `useToast()`.
- `src/store/exportImport.ts`: `serialize(chars: Character[]): string` (`{ app:'dnd-sheet', version:1, characters:[...] }`); `parseImport(json: string): { ok: true; characters: Character[] } | { ok: false; error: string }` using `migrateCharacter`.

- [ ] **Step 1:** Failing reducer tests: `hp` delta −7 with temp 5 current 20 → temp 0 current 18; delta +100 → current = max; `patch {combat:{hp:{max:5}}}` with current 20 → current 5 (`lowering max clamps current`); `weapon/move` at index 0 dir −1 is a no-op; `slots/toggle` level 1 index 2 with used 1 → used 3, again with used 3 and index 2 → used 2; `slots/longRest` zeroes all used.
- [ ] **Step 2:** Failing provider tests (fake adapter with in-memory Map + manual `emit`): dispatch patch → after 300 ms (fake timers) adapter has the new name and `saveState` returns to `'saved'`; `adopts external change when idle` (emit character event with a different name, store shows it); `keeps local pending edit` (dispatch, emit before timer fires, store keeps local name and toast list contains "Another tab changed this character; your edit was kept"); `create` adds summary and selects it; `remove` of active selects next or creates a fresh one if none remain.
- [ ] **Step 3:** Failing exportImport tests: round trip; `parseImport('{}')` → `ok:false` (`rejects invalid import`); `parseImport` with one bad and one good character → ok with one character.
- [ ] **Step 4:** Run → FAIL. Implement reducer, provider (useReducer + useRef timer + `beforeunload` flush + adapter.subscribe), hooks, exportImport. Run → PASS.
- [ ] **Step 5:** Wire `CharacterProvider` into `src/main.tsx` with `createLocalStorageAdapter()`; on first load with empty index, create "New character". Commit: `feat: character store with debounced persistence, roster, export/import`

### Task 5: UI primitives, header bar, theme

**Files:**
- Create: `src/components/ui/NumberField.tsx`, `TextField.tsx`, `TextArea.tsx` (auto-grow), `Toggle.tsx`, `Pips.tsx`, `StatBox.tsx` (label + big value + optional sub), `Button.tsx`, `ConfirmDialog.tsx`, `ToastHost.tsx`, `OverrideBadge.tsx` (shows "auto" / reset button), `DerivedField.tsx`
- Create: `src/components/header/HeaderBar.tsx`, `CharacterSwitcher.tsx`, `CharacterInfoPopover.tsx`, `ExportImportMenu.tsx`, `ThemeToggle.tsx`, `src/theme/useTheme.ts`
- Modify: `src/App.tsx`
- Test: `src/components/ui/NumberField.test.tsx`, `src/components/header/CharacterSwitcher.test.tsx`, `src/theme/useTheme.test.ts`

**Interfaces:**
- `NumberField({ value: number; onChange(n: number): void; min?; max?; className?; 'aria-label' })` — selects all on focus, commits on blur/Enter, arrow keys ±1, empty → previous value.
- `DerivedField({ auto: number; override?: number; onOverride(n?: number) })` — renders formatted value; editing sets override; `OverrideBadge` resets.
- `useTheme(): ['dark'|'light', toggle]` persisted under `dnd-sheet:theme`, applies `dark` class to `<html>`.
- `ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel })` using native `<dialog>`.

- [ ] **Step 1:** Failing tests: NumberField empty-then-blur keeps old value, typing 35 with max 30 → 30; CharacterSwitcher lists summaries, "New character" calls `create`, "Delete" opens confirm and only calls `remove` after confirm; useTheme default `'dark'`, toggle persists `'light'`.
- [ ] **Step 2:** Run → FAIL. Implement primitives and header. Header layout per spec: switcher · info line (click opens popover with name/player/race/class/level/background/alignment/XP) · view buttons · export/import menu (export current, export all, import file via `<input type=file>`, then add/replace choice via ConfirmDialog) · theme toggle · save indicator (`saveState`).
- [ ] **Step 3:** Run → PASS. Visual check in browser at 1920×1080. Commit: `feat: ui primitives, header bar, character switcher, theme toggle`

### Task 6: Sheet view — abilities, saves, skills columns

**Files:**
- Create: `src/components/sheet/SheetView.tsx` (4-col grid `grid-cols-[5rem_1.1fr_1.5fr_1.2fr]`, `h-[calc(100vh-<header>)]`), `AbilityColumn.tsx`, `AbilityBox.tsx`, `SavesSkillsColumn.tsx`, `SavingThrows.tsx`, `SkillList.tsx`, `ProficiencyDot.tsx` (cycles none→proficient→expertise on skills; none↔proficient on saves)
- Modify: `src/App.tsx` (render SheetView for `'sheet'`)
- Test: `src/components/sheet/SkillList.test.tsx`, `AbilityBox.test.tsx`

- [ ] **Step 1:** Failing tests: AbilityBox shows `+4` for 18 and editing score to 8 shows `-1`; SkillList renders 18 rows in `SKILLS` order, clicking Stealth dot twice shows expertise total (dex 18 level 5 → `+10`), passive perception box updates when Perception dot clicked.
- [ ] **Step 2:** Run → FAIL. Implement. Inspiration toggle and proficiency bonus `DerivedField` at top of column B; "Other proficiencies and languages" TextArea at bottom.
- [ ] **Step 3:** Run → PASS. Browser check. Commit: `feat: sheet view with abilities, saves, skills`

### Task 7: Sheet view — combat column (no weapons yet)

**Files:**
- Create: `src/components/sheet/CombatColumn.tsx`, `HpBlock.tsx`, `HitDice.tsx`, `DeathSaves.tsx`
- Test: `src/components/sheet/HpBlock.test.tsx`

- [ ] **Step 1:** Failing tests: HpBlock with current 20 temp 5: click "−5" → temp 0, current 20; click "−5" again → current 15; "+5" ×4 → current = max; after a change an "Undo" toast button restores prior values; editing max below current clamps current (`lowering max clamps current`, UI level).
- [ ] **Step 2:** Run → FAIL. Implement: AC (NumberField), Initiative (`DerivedField`), Speed (TextField) row; HpBlock with accent border, −1/−5/+1/+5 buttons, current/max/temp NumberFields; HitDice (`current` NumberField, `total` TextField); DeathSaves (two `Pips` of 3).
- [ ] **Step 3:** Run → PASS. Commit: `feat: combat column with hp, hit dice, death saves`

### Task 8: Weapons section

**Files:**
- Create: `src/components/sheet/WeaponsTable.tsx`, `WeaponRow.tsx`, `src/rules/formatDamage.ts`
- Modify: `CombatColumn.tsx`
- Test: `src/components/sheet/WeaponRow.test.tsx`, `src/rules/formatDamage.test.ts`

**Interfaces:**
- `formatDamage(dice: string, bonus: number, type: string): string` → `'1d8+4 piercing'`, bonus 0 → `'1d8 piercing'`, negative → `'1d6-1 slashing'`, empty dice → `''`.

- [ ] **Step 1:** Failing tests: formatDamage cases above; WeaponRow collapsed shows name/atk/damage/range, chevron expands to reveal properties/effects/notes textareas and ability select; selecting "finesse" with str 16 dex 18 prof level 5 shows `+7`; editing attack to 9 shows `+9` with reset badge; remove shows undo toast and restores on click.
- [ ] **Step 2:** Run → FAIL. Implement. Table region: `max-h-[18rem] overflow-y-auto`; "Add weapon" button in header; up/down buttons on expanded row.
- [ ] **Step 3:** Run → PASS. Commit: `feat: weapons section with auto attack and damage bonus`

### Task 9: Sheet view — equipment and prose column, layout fit

**Files:**
- Create: `src/components/sheet/Equipment.tsx`, `ProseColumn.tsx`
- Modify: `CombatColumn.tsx`, `SheetView.tsx`
- Test: `src/components/sheet/SheetView.test.tsx`

- [ ] **Step 1:** Failing test: SheetView renders all PDF page-1 labels (list them: Strength…Charisma, Inspiration, Proficiency bonus, Saving throws, Skills, Passive perception, Other proficiencies and languages, Armor class, Initiative, Speed, Hit points, Temporary hit points, Hit dice, Death saves, Weapons, Equipment, Personality traits, Ideals, Bonds, Flaws, Features and traits) and the weapons region has class `overflow-y-auto` (`weapons region has max height class`).
- [ ] **Step 2:** Run → FAIL. Implement Equipment (five coin NumberFields + capped TextArea `max-h-24 overflow-y-auto`) and ProseColumn (four TextAreas + Features filling remainder with `flex-1 overflow-y-auto`).
- [ ] **Step 3:** Run → PASS. Manual: browser at 1920×1080 with 8 weapons and 30 lines of equipment — no page scrollbar, HP visible. Commit: `feat: equipment and prose columns; sheet fits 1080p`

### Task 10: Spellbook view

**Files:**
- Create: `src/components/spellbook/SpellbookView.tsx`, `SpellcastingHeader.tsx`, `SlotTracker.tsx`, `SpellList.tsx`, `SpellEntry.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/spellbook/SlotTracker.test.tsx`, `SpellList.test.tsx`

- [ ] **Step 1:** Failing tests: SlotTracker hides levels with total 0, "Edit slots" reveals nine inputs, clicking pip toggles used, "Long rest" opens confirm then zeroes used; SpellcastingHeader with ability wis 15 level 5 shows DC 13 and attack `+5`; SpellList "Add spell" at level 2 creates an entry under the "Level 2" group, "Prepared only" filter hides unprepared, search "fire" filters by name.
- [ ] **Step 2:** Run → FAIL. Implement. Entry fields: name, level select 0–9 (`Cantrip` for 0), prepared Toggle, four optional short TextFields, description TextArea, move up/down, remove (undo toast).
- [ ] **Step 3:** Run → PASS. Commit: `feat: spellbook view with slots and freeform spells`

### Task 11: Cheat sheet view and SRD content

**Files:**
- Create: `src/rules/srdCheatSheet.ts` (`export const CHEAT_SHEET: { id: string; title: string; lines: string[] }[]`), `src/components/cheatsheet/CheatSheetView.tsx`, `CheatSection.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/cheatsheet/CheatSheetView.test.tsx`

- [ ] **Step 1:** Write `srdCheatSheet.ts` from SRD 5.1 (2014) covering every topic in the spec's cheat sheet list, each section ≤ 12 one-line entries, plus a final attribution line: "Rules summarised from the Systems Reference Document 5.1 by Wizards of the Coast, CC-BY-4.0." Include the proficiency-by-level table as lines and the conditions list (blinded…unconscious).
- [ ] **Step 2:** Failing test: renders all section titles; typing "cover" in the search box leaves only sections whose title or lines match; sections collapse on header click; personal notes textarea is bound to `character.notes`.
- [ ] **Step 3:** Run → FAIL. Implement two-column layout: reference (left, 2/3) and notes (right, 1/3).
- [ ] **Step 4:** Run → PASS. Commit: `feat: srd 5.1 cheat sheet with personal notes`

### Task 12: Keyboard shortcuts and polish

**Files:**
- Create: `src/hooks/useViewShortcuts.ts`
- Modify: `src/App.tsx`
- Test: `src/hooks/useViewShortcuts.test.tsx`

- [ ] **Step 1:** Failing test: pressing `2` on body switches hash to `#/spellbook`; pressing `2` inside an input does not.
- [ ] **Step 2:** Run → FAIL. Implement. Also: `<title>` updates to `<name> – D&D sheet`; focus-visible rings on all controls; `prefers-reduced-motion` respected for toasts.
- [ ] **Step 3:** Run → PASS. `npm run typecheck` clean. Commit: `feat: keyboard view shortcuts and polish`

### Task 13: GitHub Pages deployment and README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md` (replace remote's stub)
- No package.json change: `VITE_BASE` is set as a workflow env var, local builds keep `base: '/'`.

- [ ] **Step 1:** Workflow: on push to `main` → checkout, setup-node 24 with npm cache, `npm ci`, `npm test -- --run`, `npm run typecheck`, `VITE_BASE=/dnd-char-sheet/ npm run build`, `actions/upload-pages-artifact` with `dist`, `actions/deploy-pages`. Permissions `pages: write`, `id-token: write`.
- [ ] **Step 2:** README: what it is, dev (`npm install`, `npm run dev`), test, deploy URL `https://glpste.github.io/dnd-char-sheet/`, data stays in your browser, export/import note, SRD attribution.
- [ ] **Step 3:** Commit `ci: deploy to github pages`, push. Enable Pages with source "GitHub Actions": `gh api -X POST repos/glpste/dnd-char-sheet/pages -f build_type=workflow` (if 409 already exists, skip). Watch run: `gh run watch`. Open the Pages URL in the browser and confirm the sheet loads and hash routes work.

### Task 14: Final verification

- [ ] **Step 1:** `npm test -- --run` and `npm run typecheck` pass; `npm run build` has no warnings about chunk size over 500 kB.
- [ ] **Step 2:** Manual end-to-end in the dev server at 1920×1080: create character, set abilities/level, verify saves/skills/passive/initiative; add weapon with finesse and check bonuses; take damage through temp HP, undo; add spells and slots, long rest; cheat sheet search; export all, delete character, import with "add"; reload page and confirm persistence; open a second tab, edit there, confirm first tab adopts the change; toggle theme and reload.
- [ ] **Step 3:** Confirm no page scrollbar on the sheet view at 1920×1080 with 8 weapons.
- [ ] **Step 4:** Dispatch a fresh code reviewer over the whole `main` history per superpowers:requesting-code-review; fix findings; push.

## Verification summary

- Unit: `npx vitest run` (rules math, storage, reducer, provider timing, export/import, component behaviour).
- Types: `npm run typecheck`.
- Build: `npm run build`; Pages workflow green; live URL loads.
- Manual: the Task 14 checklist, driven via the in-app browser.
