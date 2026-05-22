// ============================================================================
// useProgress — derived progress state, memoised against the store
// Wraps the pure functions in services/progressCalculator.js in React's
// useMemo so ProgressTab stays free of computation.
// ============================================================================

import { useMemo } from 'react';
import { todayISO, getPlanPosition } from '../data/sessions.js';
import { getAllSessions } from '../services/planGenerator.js';
import {
  calcCompletionStats,
  calcEffortStats,
  calcCountsByWeek,
  buildHeatmap,
} from '../services/progressCalculator.js';

// store — the object returned by useTrainingPlan()
export function useProgress(store) {
  const today = todayISO();
  const pos   = getPlanPosition(today);

  const allSessions = useMemo(
    () => getAllSessions(store.cadenceFor, store.patternFor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.state],
  );

  const { completedCount, totalSessions } = useMemo(
    () => calcCompletionStats(allSessions, store.getSessionStatus),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSessions, store.state],
  );

  const { avgEffort, effortSampleCount } = useMemo(
    () => calcEffortStats(store.state.sessionLog),
    [store.state.sessionLog],
  );

  const countsByWeek = useMemo(
    () => calcCountsByWeek(allSessions, store.isExerciseDone, store.sessionLogFor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSessions, store.state],
  );

  const heatmap = useMemo(
    () => buildHeatmap(
      store.getSessionStatus,
      store.sessionLogFor,
      store.cadenceFor,
      store.patternFor,
      pos.weekNumber,
      pos.dayIndex,
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSessions, store.state, pos.weekNumber, pos.dayIndex],
  );

  return {
    pos,
    allSessions,
    completedCount,
    totalSessions,
    avgEffort,
    effortSampleCount,
    countsByWeek,
    heatmap,
  };
}
