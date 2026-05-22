// ============================================================================
// Progress calculator — pure derived-state functions
// No React dependency. Each function takes plain data / store accessors and
// returns a plain value. Wire into useMemo in hooks/useProgress.js.
// ============================================================================

import { SKILL_ORDER } from '../data/phases.js';
import { TOTAL_WEEKS } from '../data/sessions.js';
import { getWeekSchedule } from './planGenerator.js';

// ----------------------------------------------------------------------------
// Completion totals
// Returns { completedCount, totalSessions }.
// Partial sessions count the same as done — completed work is completed work.
// ----------------------------------------------------------------------------
export function calcCompletionStats(allSessions, getSessionStatus) {
  let completedCount = 0;
  let totalSessions = 0;
  allSessions.forEach(s => {
    if (s.sessionType === 'rest') return;
    totalSessions += 1;
    const st = getSessionStatus(s.weekNumber, s.dayIndex, s.session.exercises);
    if (st === 'done' || st === 'partial') completedCount += 1;
  });
  return { completedCount, totalSessions };
}

// ----------------------------------------------------------------------------
// Average effort across logged sessions.
// Returns { avgEffort, effortSampleCount }.
// Skips sessions where effort was left at 0.
// ----------------------------------------------------------------------------
export function calcEffortStats(sessionLog) {
  let sum = 0;
  let n = 0;
  Object.values(sessionLog || {}).forEach(log => {
    if (log && typeof log.effort === 'number' && log.effort > 0) {
      sum += log.effort;
      n += 1;
    }
  });
  return { avgEffort: n ? sum / n : 0, effortSampleCount: n };
}

// ----------------------------------------------------------------------------
// Weekly skill-volume counts for the stacked bar chart.
// Returns an array of TOTAL_WEEKS objects, each keyed by skill category ID.
// Each ticked exercise contributes 1, scaled by actualMinutes/plannedMinutes
// if the session was logged.
// ----------------------------------------------------------------------------
export function calcCountsByWeek(allSessions, isExerciseDone, sessionLogFor) {
  const weeks = Array.from({ length: TOTAL_WEEKS }, () => {
    const obj = {};
    SKILL_ORDER.forEach(s => { obj[s] = 0; });
    return obj;
  });

  allSessions.forEach(s => {
    if (s.sessionType === 'rest') return;
    const log = sessionLogFor(s.weekNumber, s.dayIndex);
    const ratio = log && log.endedAt && log.plannedMinutes > 0
      ? Math.max(0.1, Math.min(2, (log.actualMinutes || 0) / log.plannedMinutes))
      : 1;
    s.session.exercises.forEach(ex => {
      if (isExerciseDone(s.weekNumber, s.dayIndex, ex.id)) {
        weeks[s.weekNumber - 1][ex.category] += ratio;
      }
    });
  });

  // Round to one decimal place.
  weeks.forEach(w => {
    SKILL_ORDER.forEach(s => { w[s] = Math.round(w[s] * 10) / 10; });
  });

  return weeks;
}

// ----------------------------------------------------------------------------
// Heatmap row data — one row per week, one cell per day.
// Returns a 2-D array [week][day] of cell descriptor objects.
// ----------------------------------------------------------------------------
export function buildHeatmap(
  getSessionStatus,
  sessionLogFor,
  cadenceFor,
  patternFor,
  currentWeekNumber,
  currentDayIndex,
) {
  const rows = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const week = getWeekSchedule(w, cadenceFor(w), patternFor(w));
    rows.push(week.map((d, i) => {
      const status = d.sessionType !== 'rest'
        ? getSessionStatus(w, i, d.session.exercises)
        : 'planned';
      const log = sessionLogFor(w, i);
      return {
        weekNumber: w,
        dayIndex: i,
        sessionType: d.sessionType,
        sessionName: d.session.name,
        accent: d.session.accent,
        status,
        deload: d.isDeload,
        isToday: w === currentWeekNumber && i === currentDayIndex,
        effort: log?.effort || 0,
        difficulty: log?.difficulty || 0,
        log,
      };
    }));
  }
  return rows;
}
