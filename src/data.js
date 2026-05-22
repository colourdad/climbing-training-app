// ============================================================================
// SEND · 17-Week Climbing Training Program
// Barrel re-export — content lives in src/data/*.js and src/services/*.js
// App.jsx and any other existing imports continue to work unchanged.
// ============================================================================

export {
  SKILL_CATEGORIES,
  SKILL_ORDER,
  PHASES,
  getPhase,
} from './data/phases.js';

export {
  HOME_A_NAMES,
  HOME_B_NAMES,
  limitExercises,
  volumeExercises,
  techExercises,
  homeAExercises,
  homeBExercises,
  lightHomeExercises,
  testingExercises,
  restExercises,
  HOUSEKEEPING_IDS,
  buildExerciseCatalog,
  getAllMuscles,
} from './data/exercises.js';

export {
  PLAN_START_DATE,
  TOTAL_WEEKS,
  addDays,
  daysBetween,
  todayISO,
  getPlanPosition,
  formatDateShort,
  formatDateLong,
} from './data/sessions.js';

export {
  buildSession,
  getDefaultPattern,
  getWeekSchedule,
  getWeekMeta,
  getAllSessions,
} from './services/planGenerator.js';

export {
  ASSESSMENTS,
  NOTES_CONTENT,
} from './data/assessments.js';
