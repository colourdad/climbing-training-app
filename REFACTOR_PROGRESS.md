# Climbing App — Refactor Progress

Hand-off document for the monolithic-`App.jsx` → modular-feature-folder refactor.
Paste this file (or its key sections) at the start of a new chat to resume.

---

## Current state (Pass 7 partial — Home/Schedule/Progress tabs extracted)

`src/App.jsx` is **293 lines** (was 2019, was 1406 before Pass 5, was 839
before this batch). Modals, SessionView, and the Home/Schedule/Progress
tabs are out. Remaining inline: `NotesView`, `AssessmentsView`, and `TabBar`.

### File tree as it stands now

```
src/
├── main.jsx
├── App.jsx                     # 293 lines — NotesView + AssessmentsView + TabBar still inline
├── styles.css                  # untouched
├── data.js                     # 52-line re-export shim (kept temporarily so old imports work)
├── data/
│   ├── sessions.js             # plan constants + date utilities
│   ├── exercises.js            # exercise catalogues
│   ├── phases.js               # PHASES, SKILL_CATEGORIES, SKILL_ORDER
│   └── assessments.js          # ASSESSMENTS array
├── services/
│   ├── migrations.js           # STORAGE_KEY, SCHEMA_VERSION, loadState, saveState, legacy migration
│   ├── planGenerator.js        # buildSession, getWeekSchedule, getAllSessions, getWeekMeta, getPhase, getDefaultPattern
│   └── progressCalculator.js   # calcCompletionStats, calcEffortStats, calcCountsByWeek, buildHeatmap
├── hooks/
│   ├── useTrainingPlan.js      # store: state + action creators (replaces inline useStore)
│   └── useProgress.js          # memoised derived stats
└── components/
    ├── icons.jsx               # Icon.* SVG components
    ├── SkillPill.jsx           # SkillPill + StatusDot
    ├── DayRow.jsx
    ├── SortableList.jsx        # SortableList + SwipeDeleteRow
    ├── ExerciseCard.jsx        # ExerciseCard + RatingRow + ExerciseTimer (owns beep/fmtSec)
    ├── SettingsModal.jsx       # ← Pass 5
    ├── HeatmapCellModal.jsx    # ← Pass 5
    ├── EndSessionModal.jsx     # ← Pass 5
    ├── EditWeekModal.jsx       # ← Pass 5
    ├── SessionView.jsx         # ← Pass 6 (was SessionDetail)
    ├── HomeTab.jsx             # ← Pass 7 (was HomeView)
    ├── ScheduleTab.jsx         # ← Pass 7 (was ScheduleView)
    └── ProgressTab.jsx         # ← Pass 7 (was ProgressView + StackedBarChart + StackedBarLegend)
```

### Functions still inline in App.jsx (these are the next targets)

| Line | Function           | Goes to                                |
|-----:|--------------------|----------------------------------------|
|   20 | `NotesView`        | Pass 7 — `components/NotesTab.jsx`     |
|  111 | `AssessmentsView`  | Pass 7 — `components/AssessmentsTab.jsx` |
|  217 | `TabBar`           | Pass 8 — `components/Navigation.jsx`   |

After Pass 8, App.jsx should be ~100 lines (a hooks setup + view switcher),
and `data.js` (the shim) gets deleted.

---

## Remaining passes

Each pass = one commit. Each pass leaves the app fully working.

### Pass 7 — Tab views (remaining)
1. `NotesView`       → `NotesTab.jsx`
2. `AssessmentsView` → `AssessmentsTab.jsx`

### Pass 8 — Navigation + cleanup
Extract `TabBar` → `Navigation.jsx`. Trim App.jsx to ~100 lines. Delete the
`src/data.js` shim once nothing imports from it.

---

## Rules learned the hard way

1. **JSX only in `.jsx` files.** Vite/Rollup will not parse JSX inside a `.js`
   file. (v5.0 → v5.0.1 broke because `icons.js` contained `<svg>`. Renamed to
   `icons.jsx` in v5.0.2.) Audit after each pass:
   ```
   find src -name "*.js" | xargs grep -lE '<[A-Za-z]'
   ```
   Output must be empty.

2. **Delete the inline copy in the same commit as the new file.** v5.0 broke
   because the helper components were imported AND still defined inline,
   causing "symbol already declared" errors.

3. **Run a strict esbuild bundle before pushing.** The sandbox can't run
   `npm install` against the public registry, but esbuild is available at
   `/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild/bin/esbuild`.
   Use Vite-equivalent flags:
   ```
   $ESBUILD --bundle --loader:.jsx=jsx --format=esm --target=es2020 \
            --external:react --external:react-dom --external:react-dom/client \
            --outfile=/tmp/out.js src/main.jsx
   ```
   Do NOT pass `--loader:.js=jsx` — that would mask the JSX-in-.js bug above.

4. **localStorage key must remain `send_climbing_v4`.** Lives in
   `services/migrations.js` along with `SCHEMA_VERSION = 4` and the legacy
   keys array `['send_climbing_v2', 'send_climbing_v3']`. Don't bump these.

5. **Commits happen in GitHub Desktop, not from the sandbox.** Tai uses
   GitHub Desktop with the `colourdad <wjpjwgmz96@privaterelay.appleid.com>`
   identity. The sandbox can stage changes but should not author commits.

6. **`.git/index.lock` sometimes gets stuck.** If a sandbox `rm` fails with
   "Operation not permitted", use the `mcp__cowork__allow_cowork_file_delete`
   tool to enable deletion in this folder.

---

## How to resume

Open a new chat with Cowork pointed at this folder, then paste:

> Continue the climbing app refactor. Read REFACTOR_PROGRESS.md for full
> context. We're starting Pass 5 (extract the four modals).

The new session has access to the same memory store and will pick up the
established conventions automatically.
