# Climbing App — Refactor Progress

**Refactor complete.** This file is now a record of the eight-pass refactor
from a 2019-line monolithic `App.jsx` to a modular feature-folder layout.
The rules-learned-the-hard-way section at the bottom is still useful when
making changes to this codebase.

---

## Final state

`src/App.jsx` is **69 lines** — only the root `App` component (state setup,
view switcher, session-detail routing). Every other view, modal, and helper
lives in its own file. The transitional `src/data.js` shim is gone; every
import now goes directly to the underlying module under `data/` or `services/`.

### File tree

```
src/
├── main.jsx                    # entry point
├── App.jsx                     # 69 lines — root component only
├── styles.css                  # untouched
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
│   ├── useTrainingPlan.js      # store: state + action creators
│   └── useProgress.js          # memoised derived stats
└── components/
    ├── icons.jsx               # Icon.* SVG components
    ├── SkillPill.jsx           # SkillPill + StatusDot
    ├── DayRow.jsx
    ├── SortableList.jsx        # SortableList + SwipeDeleteRow
    ├── ExerciseCard.jsx        # ExerciseCard + RatingRow + ExerciseTimer (owns beep/fmtSec)
    ├── SettingsModal.jsx
    ├── HeatmapCellModal.jsx
    ├── EndSessionModal.jsx
    ├── EditWeekModal.jsx
    ├── SessionView.jsx
    ├── HomeTab.jsx
    ├── ScheduleTab.jsx
    ├── ProgressTab.jsx         # co-locates StackedBarChart + StackedBarLegend
    ├── NotesTab.jsx
    ├── AssessmentsTab.jsx
    └── Navigation.jsx          # bottom tab bar (was inline `TabBar`)
```

### What each pass did

| Pass | Commit | What                                                          |
|-----:|--------|---------------------------------------------------------------|
|  1–4 | pre-v5.0.2 | Extracted data/, services/, hooks/, and the leaf components |
|    5 | v5.0.3 | Modals: `SettingsModal`, `HeatmapCellModal`, `EndSessionModal`, `EditWeekModal` |
|    6 | v5.0.4 | `SessionView` (was `SessionDetail`) |
|   7a–c | v5.0.5 | `HomeTab`, `ScheduleTab`, `ProgressTab` (+ chart helpers co-located) |
|   7d–e | v5.0.6 | `NotesTab`, `AssessmentsTab` |
|    8 | this commit | `Navigation` (was `TabBar`) + migrate every `./data.js` import to its real source + delete the `data.js` shim |

---

## Rules learned the hard way (still relevant for ongoing work)

1. **JSX only in `.jsx` files.** Vite/Rollup will not parse JSX inside a `.js`
   file. (v5.0 → v5.0.1 broke because `icons.js` contained `<svg>`. Renamed to
   `icons.jsx` in v5.0.2.) Audit after any structural change:
   ```
   find src -name "*.js" | xargs grep -lE '<[A-Za-z]'
   ```
   Output must be empty.

2. **Delete the inline copy in the same commit as the new file.** v5.0 broke
   because helper components were imported AND still defined inline, causing
   "symbol already declared" errors. Applies any time you split a file.

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
   keys array `['send_climbing_v2', 'send_climbing_v3']`. Don't bump these
   unless you're intentionally migrating user data.

5. **Commits happen in GitHub Desktop, not from the sandbox.** Tai uses
   GitHub Desktop with the `colourdad <wjpjwgmz96@privaterelay.appleid.com>`
   identity. The sandbox can stage changes but should not author commits.

6. **`.git/index.lock` sometimes gets stuck.** If a sandbox `rm` fails with
   "Operation not permitted", use the `mcp__cowork__allow_cowork_file_delete`
   tool to enable deletion in this folder, then `rm .git/index.lock`.

7. **Import from the real source, not a barrel.** The `data.js` shim is gone;
   import directly from `data/sessions.js`, `data/phases.js`, `data/exercises.js`,
   `data/assessments.js`, or `services/planGenerator.js`. Re-introducing a
   barrel makes dead-symbol detection harder.
