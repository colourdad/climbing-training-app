# Climbing App — Feature Prompts
Use each prompt below as a standalone message to Claude. They reference your actual code so Claude knows exactly where to look.

---

## 1. End session goes back to previous page

**File:** `src/App.jsx` — `EndSessionModal` and `SessionDetail` components

> In `SessionDetail`, the `EndSessionModal` receives an `onDone` prop that currently just closes the modal (`() => { setEndModalOpen(false); }`). Change this so that after saving, the modal closes AND the user is taken back to the previous page — i.e. call both `setEndModalOpen(false)` and `onBack()`. The `onBack` prop already exists on `SessionDetail` and navigates back to the schedule/home view. Also track which tab the user was on before opening a session (store it in a `prevView` ref or state in the root `App` component), so the back navigation returns them to the correct tab (home or schedule) rather than always defaulting to home.

---

## 2. Dark and light mode colour scheme

**Files:** `src/styles.css`, `src/App.jsx`

> Add dark/light mode support to the app. In `styles.css`, the app currently uses hard-coded dark colours throughout. Refactor all colour values to use CSS custom properties (e.g. `--bg`, `--bg-2`, `--text-1`, `--text-2`, `--border`, etc.) and define two sets of values: one under `:root` (dark mode, the current scheme) and one under a `.light` class on the root element. Add a toggle button (a sun/moon icon) to the top-right of each view alongside the existing settings cog — or put the toggle inside the `SettingsModal`. Save the preference to `localStorage`. Apply the `.light` class to the `<div className="app">` root element based on the saved preference. Also update the heatmap cell colours to adapt properly in both modes — the current `.hm-cell.done` background is `var(--moss)` and `.hm-cell.partial` uses a sand colour; make sure these look good in light mode too.

---

## 3. Add / delete / swap sessions per week

**Files:** `src/App.jsx` — `EditWeekModal` component, `src/data.js` — `getDefaultPattern`

> The `EditWeekModal` already supports reordering days with up/down arrows. Extend it with two more capabilities:
>
> 1. **Delete a session**: Each day row in the edit modal should have a delete (×) button that replaces that session type with `'rest'` in the local `pattern` state.
> 2. **Add a session**: Add a small "+ Add session" button at the bottom of the day list. Tapping it opens a simple inline picker showing the available session types (`limit`, `volume`, `tech`, `rings`, `weights`, `pe`) with their accent colours. Picking one sets the next available `rest` day to that session type. If no rest days are available, show a message saying "No rest days left to replace."
>
> The swap/reorder arrows already work — no change needed there. All changes are saved to `store.setWeekPattern(weekNumber, pattern)` as before.

---

## 4. Remove climbing exercises from the search bar

**File:** `src/data.js` — `buildExerciseCatalog` function

> In `buildExerciseCatalog()`, filter out exercises whose `id` is `'warmup'` or `'cooldown'` (and any other pure warm-up/cool-down exercises) so they don't appear in search results on the Notes page. The session types to filter from are: `warmup` id in `limit`, `volume`, `tech`, and `pe` session types; and `cooldown` id in `limit` and `pe`. A clean approach: after building the catalog array, filter out entries where `e.id === 'warmup' || e.id === 'cooldown' || e.id === 'reflect'` (the `reflect` cool-down in tech sessions). These are housekeeping exercises that clutter search with noise.

---

## 5. Remove Recovery Protocol from the Notes page

**File:** `src/data.js` — `NOTES_CONTENT` array

> In `NOTES_CONTENT`, there are three groups: `recovery`, `projecting`, and `boards`. Remove the `recovery` group entirely (the object with `id: 'recovery'` and heading `'Recovery Protocol'`). Keep `projecting` and `boards`. The Notes page in `NotesView` renders these groups directly via `NOTES_CONTENT.map(...)` so removing the entry from the array is all that's needed.

---

## 6. Clean up and simplify the exercise dropdown

**File:** `src/App.jsx` — `ExerciseCard` component

> The expanded exercise card currently shows: "How to do it" description, "Targets" muscle chips, "Progression" text, and a timer. Simplify it:
>
> - Remove the section labels ("How to do it", "Targets", "Progression") and replace with a cleaner layout: description text at the top (no label), then muscle chips in a small row below, then progression in a single muted line (prefix it with "→ " instead of a heading). 
> - Reduce the font size of the description to 13px and the progression to 12px.
> - Remove the `exercise-section` wrapper divs and flatten the structure so the expanded area feels lighter.
> - Keep the timer as-is.
> - The collapsed state (name, sets, skill pill, rest time) stays the same.

---

## 7. Colour-code weeks in the Schedule tab by phase

**File:** `src/App.jsx` — `ScheduleView` component, `src/styles.css`

> In `ScheduleView`, the week picker strip renders 16 `week-chip` buttons. Currently they have classes like `active`, `current`, `deload`, `taper`, and `custom`. Add phase-based colour coding:
>
> - Phase 1 (weeks 1–6): use the phase accent `#7A9E5F` (green)
> - Phase 2 (weeks 7–12): use `#C2A878` (gold)
> - Phase 3 (weeks 13–16): use `#D97757` (orange)
>
> Each `week-chip` already has access to `m` (the result of `getWeekMeta(w)`), which includes `m.phase.accent`. Apply the phase accent as a subtle left border or bottom border on each chip (e.g. `border-bottom: 2px solid ${m.phase.accent}`), or as a very faint background tint (`background: ${m.phase.accent}18`). The `active` chip (currently selected week) should show a stronger version of the same colour. Update `.week-chip` styles in `styles.css` accordingly.

---

## 8. Remove "Phase" from the hero stat on the Home page

**File:** `src/App.jsx` — `HomeView` component

> In `HomeView`, the `.hero-bottom` div contains two children: a `.hero-stat` block showing "Phase / {phase.name}" and the `.hero-cta` button. Remove the `.hero-stat` block entirely — just delete those lines:
> ```jsx
> <div className="hero-stat">
>   Phase
>   <strong>{phase.name}</strong>
> </div>
> ```
> The phase name is already shown in `.top-sub` ("Week X of 16 · Phase Name") and in the phase card below the hero, so it's redundant here.

---

## 9. Count partial sessions towards "done" totals

**File:** `src/App.jsx` — `HomeView` and `ProgressView` components

> Currently `totalDone` and `weekDone` counts only include sessions with status `'done'`. Update them to also count `'partial'` sessions, so partial sessions contribute to the totals shown on the home page and progress page.
>
> In `HomeView`:
> - `weekDone`: change `.filter(d => store.getSessionStatus(...) === 'done')` to `.filter(d => ['done', 'partial'].includes(store.getSessionStatus(...)))`
> - `totalDone`: same change
>
> In `ProgressView`:
> - `completedCount`: same change — count both `'done'` and `'partial'`
> - `overallPct`: update to use the new `completedCount`
>
> Leave the `partialCount` stat as-is (it can stay as a separate breakdown). Partial sessions should appear in the heatmap and bar chart exactly as they do now — no change needed there.

---

## 10. Make skill category colours more visually distinct

**File:** `src/data.js` — `SKILL_CATEGORIES` object

> The current 8 category colours are too similar (lots of muted browns and greys). Replace them with a more distinct palette where each colour is clearly different at a glance. Keep the overall earthy/muted tone of the app but increase contrast between categories. Here's a suggested replacement — feel free to adjust:
>
> ```js
> finger_prehab:      { color: '#5B9BD5' }  // clear blue
> base_strength:      { color: '#A8C66C' }  // yellow-green
> max_strength:       { color: '#E8B84B' }  // warm amber
> power:              { color: '#E05C3A' }  // strong orange-red
> muscular_endurance: { color: '#9B59B6' }  // purple
> body_tension:       { color: '#1ABC9C' }  // teal
> mobility:           { color: '#E67E73' }  // soft coral/pink
> technique:          { color: '#95A5A6' }  // neutral grey (anchor)
> ```
>
> Update only the `color` values in `SKILL_CATEGORIES` — labels, shorts, and order stay the same. These colours feed into the skill pills, the stacked bar chart, and the bar chart legend.

---

## 11. Remove the "Per phase" chart from the Progress page

**File:** `src/App.jsx` — `ProgressView` component

> In `ProgressView`, find and delete the entire "Per phase" section — the `section-head` div with heading "Per phase" and the `.card` containing the `.phase-bars` list that follows it. Also remove the `phaseStats` computation at the top of the component (the `PHASES.map(...)` block) since it's only used by that chart. The `PHASES` import in `data.js` can stay since it may be used elsewhere.

---

## 12. Fix heatmap box colours — remove border from partial, use solid colour

**Files:** `src/App.jsx` — `ProgressView` heatmap, `src/styles.css`

> Two changes to the heatmap cells:
>
> 1. **Partial sessions**: Currently partial cells have a dashed or distinct border. Remove any special border from `.hm-cell.partial` and instead give it a solid fill colour — use a muted amber like `#C2A87888` (semi-transparent gold) so it reads clearly as "started but not finished" without looking broken. No border, just a solid colour.
>
> 2. **General cell colours**: Update the heatmap colour scheme. Suggested values in `styles.css`:
>    - `.hm-cell.done`: `background: #5B9B6A` (a cleaner green, more vivid than current `var(--moss)`)
>    - `.hm-cell.partial`: `background: #C2A878BB` (solid amber, no border)
>    - `.hm-cell` (planned, non-rest): `background: var(--bg-2)` — keep as-is or lighten slightly
>    - `.hm-cell.rest`: `background: var(--bg-2); opacity: 0.3`
>
> In `App.jsx`, remove the inline `style` on heatmap cells that applies `borderColor` — the cell in the JSX has `style={cell.status === 'done' || cell.status === 'partial' || cell.sessionType === 'rest' ? null : { borderColor: ... }}`. Remove that conditional style entirely and let CSS handle all cell appearance.

---

## 13. Change the app icon

**Files:** `public/icon.svg`, `public/icon-192.png`, `public/icon-512.png`, `public/manifest.webmanifest`

> Replace the current app icon with a new climbing-themed SVG icon. Design a simple, bold icon that works at small sizes — for example: a stylised hand/fist gripping a hold, a mountain silhouette, or a minimalist boulder shape. Use the app's accent colour `#C2A878` (gold) as the primary colour on a dark `#1A1A1F` background.
>
> Steps:
> 1. Create a new `public/icon.svg` with a clean SVG design at `viewBox="0 0 512 512"`.
> 2. Use a canvas or sharp/squoosh to export `icon-192.png` (192×192) and `icon-512.png` (512×512) from the SVG.
> 3. In `manifest.webmanifest`, verify the icon paths and `purpose: "any maskable"` are set correctly.
>
> If you can't generate PNG files directly, at minimum update `icon.svg` with a new design and note that PNGs need to be re-exported from it.

---

## 14. Remove timer from warm-up and cool-down exercises

**File:** `src/data.js` — exercise definition functions

> Warm-up and cool-down exercises currently have timers defined. Remove or zero out the timer on these specific exercises so the `ExerciseTimer` component doesn't render for them (it only renders when `ex.timer && ex.timer.sec > 0`):
>
> - `limitExercises`: `warmup` (id: `'warmup'`, timer.sec: 600) → set `timer: { sec: 0 }`; `cooldown` (id: `'cooldown'`, timer.sec: 600) → set `timer: { sec: 0 }`
> - `volumeExercises`: `warmup` (timer.sec: 1500) → set `timer: { sec: 0 }`
> - `techExercises`: `warmup` (timer.sec: 900) → set `timer: { sec: 0 }`; `reflect` (timer.sec: 300) → set `timer: { sec: 0 }`
> - `peExercises`: `warmup` (timer.sec: 1200) → set `timer: { sec: 0 }`; `cooldown` (timer.sec: 600) → set `timer: { sec: 0 }`
>
> Leave timers intact on all other exercises (rest timers, work timers for 4x4, L-sit holds, etc.).

---

## 15. Remove muscle-filter bubbles from below the search bar

**File:** `src/App.jsx` — `NotesView` component

> In `NotesView`, below the search bar there is a `<div className="muscle-chips">` that renders a clickable bubble for every muscle group. Remove this entire block — delete the `<div className="muscle-chips">` and all its children. Also remove the `selectedMuscle` state, the `muscles` memo, and any references to `selectedMuscle` in the `filtered` memo and the search results meta text. The search bar should still work by matching exercise names, muscle names, and descriptions — just without the visual bubble filter. Simplify the `filtered` memo to only use the `search` string.

---

## 16. Tap a heatmap cell to see a session popup

**File:** `src/App.jsx` — `ProgressView` component

> When the user taps a heatmap cell that has been logged (status `'done'` or `'partial'`), show a small popup/modal with:
> - Session name and date (derive from week + day index using `getWeekSchedule` and `getWeekMeta`)
> - Effort level (from `store.sessionLogFor(w, d)?.effort`, displayed as `{effort}/5` or "—" if unset)
> - Session difficulty (from `log?.difficulty`, same format)
> - Session notes (from `log?.notes`, or "No notes" if empty)
>
> Implementation: add an `onClick` to each `.hm-cell` in the heatmap. On click, set a `selectedHeatCell` state to `{ weekNumber: w+1, dayIndex: d }` (use the existing `w` and `d` loop indices). Render a simple modal (reuse the existing `.modal-bg` / `.modal` CSS classes) that reads the log data and displays the three fields. Add a "Close" button. Only show the popup if the cell has a log entry — clicking planned or rest cells does nothing.

---

## 17. Show effort level inside heatmap squares

**File:** `src/App.jsx` — `ProgressView` heatmap, `src/data.js` (heatmap computation)

> Each heatmap cell in `ProgressView` is currently a plain `<div>`. For cells with a logged session, display the effort level number inside the cell.
>
> Steps:
> 1. In the `heatmap` useMemo in `ProgressView`, add the effort value to each cell object:
>    ```js
>    const log = store.sessionLogFor(w, i);
>    effort: log?.effort || null,
>    ```
> 2. Change the heatmap cell from `<div ... />` (self-closing) to `<div ...>{cell.effort ? cell.effort : ''}</div>`
> 3. In `styles.css`, style the `.hm-cell` to use `display: flex; align-items: center; justify-content: center;` and add a `font-size: 8px; font-weight: 700; color: rgba(255,255,255,0.7);` for the number. The cells are small so keep the number minimal — only show it when `effort > 0`.

---

## 18. Transform the Notes page into a session diary

**File:** `src/App.jsx` — `NotesView` component

> Redesign the Notes page so its primary content is a diary of all sessions where the user wrote notes (i.e. `log.notes` is non-empty). Replace the current notes reference content (the `NOTES_CONTENT` groups that render when no search is active) with a chronological diary feed.
>
> Implementation:
> 1. In `NotesView`, import `getAllSessions`, `getWeekMeta`, `formatDateShort`, and `addDays` from `data.js`.
> 2. Build a `diary` array using `getAllSessions(store.cadenceFor, store.patternFor)`, filtered to sessions where `store.sessionLogFor(s.weekNumber, s.dayIndex)?.notes` is non-empty. Sort by week/day descending (most recent first).
> 3. Render the diary as a list of cards. Each card shows:
>    - Date (derive from `getWeekMeta(s.weekNumber).startDate` + `s.dayIndex`)
>    - Session name (`s.session.name`) with its accent colour as a left border
>    - The notes text
>    - Effort and difficulty if logged (small muted line: "Effort 4/5 · Difficulty 3/5")
> 4. If the diary is empty, show a placeholder: "No session notes yet. Add notes when you end a session."
> 5. Keep the exercise search bar and its functionality above the diary — it searches exercises as before. When a search is active, show search results; when the search is empty, show the diary.
> 6. Remove the old `NOTES_CONTENT` section and the skill categories colour key block from the default view.
