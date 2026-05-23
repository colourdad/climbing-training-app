# Handoff: Schedule tab redesign · Paper direction (A)

## Overview

Redesign of the **Schedule** tab in the Send climbing training app.
Keeps the current tab's role as a planner — week navigator, selected
day, day list — but unifies its visual DNA with the new Home tab:
warm paper background, Geist, coral for session days, moss-green for
rest days.

Unlike the Home redesign, Schedule does **not** use a flooded colour
hero. The day-type colour appears only as accent — the selected-day
card's left stripe, the eyebrow text, the primary action button, and
the "Today" chip. The rest of the screen stays paper. Schedule is the
planner; Home is the bold moment.

The picked direction is **A · Paper** (both Week and Month views).
Direction B (Editorial) is in the prototype for reference but is not
the chosen design.

## About the design files

The files in this bundle are **design references created in HTML/React
JSX**. They are NOT production code to copy directly — they're a
working prototype showing intended look and behaviour.

The task is to **recreate this design in the existing
`climbing-training-app` codebase** (React + plain CSS using the design
tokens already defined in `src/styles.css`) — not to drop the JSX in
unchanged.

Reuse the existing palette variables (`--bg`, `--card`, `--accent`,
`--moss`, etc.) — they already match the prototype. New CSS goes in
`src/styles.css` alongside what's there. The prototype uses inline
React `style={{}}` objects for speed; translate those into CSS
classes that match the conventions in the codebase.

## Fidelity

**High-fidelity.** All colours, type sizes, spacing, and copy are
final and exact. Recreate pixel-perfectly using your existing
component patterns and CSS class conventions.

---

## Screen: Schedule tab — Week view (default)

### Purpose

Default landing on the Schedule tab. Lets the user navigate the
16-week plan at the week level, see what today is, drill into the
selected day, and scan the rest of the days in the current week.

### Layout (top to bottom)

```
┌─────────────────────────────┐
│ FOUNDATION · BUILD          │  ← eyebrow, mono
│ Schedule        [Week|Month][⚙]│  ← H1 + paper toggle + gear
│                             │
│ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐│  ← week strip (7 cards, scrollable)
│ │WK││WK││WK││WK││WK││WK││WK││     each card has a phase-coloured
│ │ 1││ 2││ 3││ 4││ 5││ 6││ 7││     top stripe + WK / number / done/total
│ │4/4││0/5│ …                │     current week has coral border + soft glow
│ └──┘└──┘                    │
│                             │
│ ┃ ▌ MON 18 MAY · SESSION    │  ← selected-day card
│ ┃   Limit Bouldering        │     fat coral (or moss) left stripe
│ ┃   ~2 hrs · Wall           │     coral / moss eyebrow
│ ┃   Project session — …     │     body copy
│ ┃   [Power][Project][Wall]  │     chips (session day only)
│ ┃   [Open session][Skip day]│     coloured primary + outlined skip
│                             │
│ Foundation · Wk 1 of 4    25%│  ← slim phase progress row
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░ │     (KEEP — user explicitly wants this)
│                             │
│ Days                0 / 5 DONE│  ← section header
│ ┌─┬───────────────────┬────┐│
│ │█│ MON  Limit Boul…  │TODAY││  ← day rows (coloured left stripe,
│ │ │      ~2 hrs · …   │     ││     coral/moss by day kind)
│ └─┴───────────────────┴────┘│
│ ⋯ more day rows ⋯           │
├─────────────────────────────┤
│ [tab bar]                   │
└─────────────────────────────┘
```

### Container

`padding: 64px 20px 20px` from the top of the safe area. Flex column,
`gap: 16px`. Background `--bg` (paper). No flooded hero — the entire
screen stays on paper.

### 1. Header row

Flex row, `align-items: flex-start; justify-content: space-between`.

**Left block:**
- Eyebrow: `FOUNDATION · BUILD` — 11px / 800 / 0.14em / uppercase / `--text-2`. `margin-bottom: 4px`.
- H1: `Schedule` — 30px / 800 / -0.02em / `line-height: 1` / `--text`.

**Right block** (flex row, `gap: 8px`, `align-items: center`):
- **Week ↔ Month toggle** — segmented pill control.
  - Outer: `inline-flex; padding: 3px; border-radius: 999px; background: --card-2; border: 1px solid --border`.
  - Each segment: `padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700`.
  - Active segment: `background: #FFF; color: --text; box-shadow: 0 1px 2px rgba(28,26,23,0.08)`.
  - Inactive: `background: transparent; color: --text-2`.
- **Gear button**: 36×36 circle, `--card` background, `1px solid --border`, centred 16×16 settings cog (Lucide style, stroke 2, `--text-2`).

### 2. Week strip

Horizontal row of 7 week cards. `display: flex; gap: 8px; overflow-x: auto` (but the prototype shows hidden — choose the right behaviour for real device: scrollable horizontally so the user can swipe to past/future weeks).

Each card:

| Property | Value |
|---|---|
| Width | 64px (`flex: 0 0 64px`) |
| Background | `--card` |
| Border | `1px solid --border` (or `1px solid --accent` if current) |
| Border radius | 12px |
| Padding | `8px 6px` |
| Box shadow | `0 0 0 3px var(--accent-soft)` if current, else `none` |
| Position | `relative; overflow: hidden` |
| Layout | flex column, `align-items: center; gap: 4px` |

**Top stripe** (absolute): `position: absolute; top: 0; left: 0; right: 0; height: 4px;` Coloured by phase:
- `foundation` → `--accent` (#E94B2C)
- `build` → `#4A6FA8` (slate)
- `power` → `#C03D24` (coral-dark)
- `perf` → `#7A5BA8` (purple — NEW, see Design Tokens)

**Card contents:**
- `WK` label: Geist Mono, 9.5px / 800 / 0.08em, `--text-3` (current week: `--accent`). `margin-top: 2px`.
- Week number: 22px / 800 / -0.02em / `line-height: 1`. `--text` (current week: `--accent`).
- `done/total` (e.g. `4/4`, `0/5`): 9px / 700 / 0.05em, `--text-3` (current week: `--accent`).

### 3. Selected-day card

This is the most important component on the screen. Same layout
regardless of mode (week or month). Day kind controls colour ONLY.

**Outer:**

| Property | Value |
|---|---|
| Background | `--card` |
| Border | `1px solid --border` |
| Border radius | 18px |
| Box shadow | `0 1px 2px rgba(28,26,23,0.04)` |
| Layout | flex row, `overflow: hidden` |

**Left stripe** (`flex: 0 0 6px`): full-height bar in day-type colour.
- Session → `--accent`
- Rest → `--moss`

**Right content** (`flex: 1; padding: 16px 18px`):

1. **Eyebrow row** — flex row, `gap: 8px; align-items: center; margin-bottom: 6px`.
   - 6×6 dot in day-type colour.
   - Text: e.g. `MON 18 MAY · SESSION` — 10.5px / 800 / 0.12em / uppercase.
   - Colour: dark variant of day-type colour (`#C03D24` for session, `#1F5C3D` for rest) — never the light accent, so contrast is sufficient on paper.

2. **Title** (`h2`): e.g. `Limit Bouldering` — 22px / 800 / -0.02em / `line-height: 1.05` / `--text` / `margin: 0`.

3. **Meta**: e.g. `~2 hrs · Wall` — 12.5px / `--text-2` / `margin-top: 4px`.

4. **Body**: 13px / `line-height: 1.45` / `--text` / `max-width: 290px` / `margin-top: 10px`.

5. **Chips** (session day only): flex row, `gap: 6px; flex-wrap: wrap; margin-top: 12px`. Each chip:
   - Padding `4px 9px`, fully rounded, 10px / 800 / 0.1em / uppercase.
   - Background: day-type-soft (`--accent-soft` for session, `--moss-soft` for rest).
   - Colour: day-type-dark (`#C03D24` for session, `#1F5C3D` for rest).
   - Copy: `Power`, `Project`, `Wall` on session day. (Rest day has no chips.)

6. **Buttons row**: flex row, `gap: 8px; margin-top: 14px`.
   - **Primary**: `Open session` (session) / `Log recovery` (rest). Day-type background, white text, padding `11px 18px`, fully rounded, 13.5px / 800.
   - **Skip day**: transparent background, `--text`, padding `11px 16px`, fully rounded, 13.5px / 700, `1px solid --border-2`.

### 4. Phase progress row

`padding: 0 2px`. Compact, NOT a card.

Top: flex row, `justify-content: space-between; align-items: baseline; margin-bottom: 6px`.
- Left: `Foundation · Wk 1 of 4 · 17–23 May` — 12px / 700. `Foundation` in `--accent`, the rest in `--text-3` at 600 weight.
- Right: `25%` — 11px / Geist Mono / `--text-3`.

Bar: `height: 6px; background: --card-2; border-radius: 999px; overflow: hidden; border: 1px solid --border`. Fill: `width: 25%; height: 100%; background: --accent; border-radius: 999px`.

### 5. Day list

Section header — flex row, `justify-content: space-between; align-items: baseline; margin-bottom: 8px`:
- Left: `Days` — 15px / 800 / -0.01em.
- Right: `0 / 5 DONE` (or `5 / 5 DONE`) — 10.5px / Geist Mono / 0.06em / `--text-3`.

Rows: flex column, `gap: 5px`. The prototype shows the first 3 rows
inside the visible safe area — in the real app, render all 7 and let
the screen scroll.

### Day row component

| Property | Value |
|---|---|
| Background | `--card` |
| Border | `1px solid --border` — or `1px solid --accent` if `state === 'today'` |
| Shadow | `0 0 0 3px var(--accent-soft)` (session today) or `0 0 0 3px var(--moss-soft)` (rest today) |
| Border radius | 14px |
| Padding | `11px 14px 11px 0` (no left padding — stripe handles it) |
| Layout | `display: flex; align-items: center; gap: 14px; overflow: hidden` |

Children, in order:

1. **Coloured left stripe**: `width: 4px; align-self: stretch`. Coral for session days, moss for rest days.
2. **Day code** (`MON`, `TUE`, …): width 36px, 11px / 700 / 0.05em / Geist Mono. `--accent` if today, otherwise `--text-3`.
3. **Title + meta** (`flex: 1; min-width: 0`):
   - Title: 14px / 700 / -0.005em. `--text` normally, `--text-3` if rest day AND not today.
   - Meta: 11.5px / `--text-2` / `margin-top: 1px`. Examples: `~2 hrs · Wall`, `Recovery`, `~60 min · Home`, `Active recovery`.
4. **Trailing**:
   - `state === 'done'` → 20px moss check circle (white tick on `--moss` fill).
   - `state === 'today'` → "TODAY" pill: 9px / 800 / 0.10em / uppercase, `--accent` background, white text, padding `5px 8px`, fully rounded.
   - `state === 'upcoming'` → nothing.

### Day list data

7 entries, indexed MON–SUN. Each row needs:

```ts
type DayRow = {
  dow: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  date: string;                    // '18 May'
  name: string;                    // 'Limit Bouldering'
  meta: string;                    // '~2 hrs · Wall'
  state: 'done' | 'today' | 'upcoming';
  kind:  'session' | 'rest';
};
```

Sample week (session day = Monday is today):

| Day | Name | Meta | Kind |
|---|---|---|---|
| MON | Limit Bouldering | ~2 hrs · Wall | session |
| TUE | Prehab, Pulling Base & Core | ~60 min · Home | session |
| WED | Rest | Recovery | rest |
| THU | Volume / Endurance | ~90 min · Wall | session |
| FRI | Core, Shoulders & Mobility | ~60 min · Home | session |
| SAT | Rest | Active recovery | rest |

---

## Screen: Schedule tab — Month view

Same paper frame, same header, same selected-day card at the bottom.
The week strip is swapped for a month navigator + month grid, and the
phase progress row is replaced with a phase legend.

### Layout (top to bottom)

```
┌─────────────────────────────┐
│ FOUNDATION · BUILD          │
│ Schedule        [Week|Month][⚙]│
│                             │
│ [<]      May 2026       [>] │  ← month navigator
│                             │
│ M  T  W  T  F  S  S         │  ← day-of-week header
│                             │
│  1  2  3                    │  ← month grid
│  4  5  6  7  8  9 10        │     each cell: number + phase-coloured
│ 11 12 13 14 15 16 17        │     underline. selected: filled with
│ 18 19 20 21 22 23 24        │     day-type colour, white text.
│ 25 26 27 28 29 30 31        │
│                             │
│ ─ Foundation  ─ Build       │  ← phase legend
│ ─ Power Endurance  ─ Perf   │
│                             │
│ ┃ ▌ MON 18 MAY · SESSION    │  ← selected-day card (same as week)
│ ┃   Limit Bouldering        │
│ ┃   …                       │
├─────────────────────────────┤
│ [tab bar]                   │
└─────────────────────────────┘
```

### Container

`padding: 64px 20px 20px`, flex column, `gap: 14px`.

### Month navigator

Flex row, `padding: 0 2px; justify-content: space-between; align-items: center`.

- Prev button: 32×32 circle, `--card` background, `1px solid --border`, centred chevron-left 14×14 stroke 2 in `--text-2`.
- Title: `May 2026` — 16px / 800 / -0.01em.
- Next button: identical to prev, chevron-right.

### Month grid

7-column CSS grid, `gap: 2px`.

**Day-of-week header row** (`M T W T F S S`, week starts Monday): each label is Geist Mono, 10px / 700 / 0.08em, `--text-3`, centred. `margin-bottom: 4px`.

**Date cells**: `aspect-ratio: 1`. Each cell is a flex column, `align-items: center; justify-content: center; gap: 4px`.

| Cell state | Background | Number colour |
|---|---|---|
| Empty (leading days from previous month) | `transparent` | — |
| Normal | `transparent` | `--text` |
| Done (past) | `transparent` | `--text-3` |
| Selected (today) | day-type colour (`--accent` for session, `--moss` for rest) | `#FFF` |
| Border radius | 12px (applies whether selected or not) | — |

Below the number, each cell has a small phase-coloured bar:
- Size: `width: 18px; height: 3px; border-radius: 2px`.
- Colour: phase colour for that date (same mapping as week strip).
- On selected cell: `rgba(255,255,255,0.7)` instead.
- On done dates: opacity 0.4.

### Phase legend

Flex row, `flex-wrap: wrap; gap: 12px; padding: 2px 2px 0; font-size: 10.5px; color: --text-2`.

Each item: flex row, `gap: 5px; align-items: center`.
- Coloured bar: 14×3, `border-radius: 2px`.
- Name: `Foundation`, `Build`, `Power Endurance`, `Performance`.

### Selected-day card

Identical to the week-view card (see above). Sits at the bottom of the
content area, above the tab bar.

---

## Interactions & behaviour

- **Week ↔ Month toggle**: cross-fades between the week strip and the
  month navigator + grid. Selected-day card stays mounted.
- **Week card tap**: selects that week. If the week is not the current
  week, navigates the day list to that week (or opens a focused
  week-detail view — match what your routing pattern is).
- **Month nav prev/next**: paginates the month grid by ±1 month.
- **Month cell tap**: selects that date and updates the selected-day
  card. If the date is in a different month, also paginates.
- **Selected-day card primary button**: `Open session` → session
  detail view. `Log recovery` → recovery log flow.
- **Selected-day card "Skip day"**: opens a confirm sheet, then marks
  the day skipped.
- **Day-row tap**: selects that day (updates the selected-day card and
  the toggle stays where it is).
- **Gear tap**: opens Schedule settings (or the global settings — pick
  whichever matches the rest of the app).

No required animations for v1. A 150ms ease-out crossfade on the
selected-day card when the selection changes would be a nice touch.

## State management

Add to the existing Schedule view component (or wrap):

```js
const [mode, setMode]                 = useState('week');   // 'week' | 'month'
const [selectedDate, setSelectedDate] = useState(today);    // Date
const isRestDay = selectedDay.kind === 'rest';
const accent     = isRestDay ? 'var(--moss)' : 'var(--accent)';
const accentDark = isRestDay ? '#1F5C3D'     : '#C03D24';
const accentSoft = isRestDay ? 'var(--moss-soft)' : 'var(--accent-soft)';
```

No new data fetches — reuse the existing schedule/plan data.

## Design tokens used

All from your existing `:root` in `src/styles.css`:

| Token | Value | Where |
|---|---|---|
| `--bg` | `#F5F2EC` | Page background |
| `--card` | `#FFFFFF` | All cards, week-strip cards, gear button |
| `--card-2` | `#FAF7F1` | Week/Month toggle background, progress bar track |
| `--border` | `rgba(28,26,23,0.07)` | Card borders |
| `--border-2` | `rgba(28,26,23,0.14)` | Skip-day button border |
| `--text` | `#1C1A17` | Headings, body |
| `--text-2` | `#6B6660` | Meta text, gear icon |
| `--text-3` | `#B8B2A8` | Tertiary, mono labels, empty states |
| `--accent` (`--rust`) | `#E94B2C` | Session-day colour |
| `--moss` | `#2E7D55` | Rest-day colour |
| `--slate` | `#4A6FA8` | Build phase colour |
| `--radius` | `14px` | Day rows |
| `--radius-lg` | `20px` | (close to the 18px selected-day card; pick whichever fits convention) |

**New values that aren't in `:root` yet — add them:**

```css
:root {
  --accent-dark: #C03D24;                    /* coral-dark — selected-day eyebrow, chip text, power phase */
  --moss-dark:   #1F5C3D;                    /* moss-dark  — rest selected-day eyebrow, chip text */
  --accent-soft: rgba(233, 75, 44, 0.10);    /* if not already there */
  --moss-soft:   rgba(46, 125, 85, 0.12);
  --perf:        #7A5BA8;                    /* purple — perf phase colour */
}
```

## Typography

App already uses system fonts via the existing font stack in `:root`.
The prototype matches that — no font changes needed for body type.

For the Geist Mono monospace bits (day codes in day rows, `WK` /
done/total in the week strip, day-of-week header in the month grid,
the date range / done-count metadata), use whatever mono fallback you
have, or add Geist Mono if you want an exact match:

```css
font-family: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
```

## Assets

No new image assets. All icons are inline SVG:
- Gear: Lucide-style cog, stroke 2, 16×16 inside a 36×36 circle.
- Chevrons (month nav): simple `<path d="M9 2 L4 7 L9 12">` style, stroke 2 round joins, 14×14 inside a 32×32 circle.
- Check (done state on day rows): 22px circle filled with `--moss`, white tick `<path d="M2 6 L5 9 L10 3">` stroke 2.2 round.

---

## Files in this bundle

- `Schedule Redesign Standalone.html` — open in a browser to see the
  working prototype offline. Contains all directions; **the chosen
  design is the "A · Week view" and "A · Month view" sections**.
  Direction B (Editorial) is for reference only — ignore.
- `schedule-v2.jsx` — React source for the prototype. The relevant
  components are:
  - `ScheduleWeekA` — week view
  - `ScheduleMonthA` — month view
  - `SelectedDayCard` — shared selected-day card
  - `DayRowS` — day row
  - `WeekStrip` — week navigator
  - `MonthGrid` — month grid
  - `PaperModeToggle` — Week ↔ Month segmented control
  - `ScheduleHeader` — top header row
- `screens.jsx` — provides the `PALETTE`, `Phone` shell, and `TabBar`.
  You only need the `PALETTE` constants — the shell wrappers are
  prototype-only.
- `logos.jsx` — `HoldLeanLogo` component. Prototype-only — your app
  has its own logo treatment.

## What to ignore from the prototype

- The HTML prototype wraps every screen in a synthetic iPhone "phone
  shell" (`Phone` component) with a fake status bar, dynamic island,
  and bezel. **Don't recreate any of that.** Your real app runs inside
  Safari with the real status bar; the safe-area insets in
  `src/styles.css` handle the spacing.
- The "Design Canvas" wrapper around all variants is prototype-only —
  the canvas grid, drag-to-reorder, and fullscreen overlay are not
  part of the design.
- **Direction B (Editorial)** — the `ScheduleWeekEditorial` component
  is in the bundle for reference but is **not** the chosen direction.
  Don't implement it.
- The day list in the prototype is truncated to 3 rows so it fits
  inside the fixed 844px phone frame. In the real app, render all 7
  rows and let the screen scroll naturally.
