// ============================================================================
// Plan generator — dynamic schedule construction
// Assembles week schedules from raw phase + exercise data. No React dependency.
// ============================================================================

import { getPhase } from '../data/phases.js';
import {
  limitExercises,
  volumeExercises,
  techExercises,
  homeAExercises,
  homeBExercises,
  lightHomeExercises,
  testingExercises,
  restExercises,
  HOME_A_NAMES,
  HOME_B_NAMES,
} from '../data/exercises.js';
import { PLAN_START_DATE, TOTAL_WEEKS, addDays } from '../data/sessions.js';

// ----------------------------------------------------------------------------
// Internal constants
// ----------------------------------------------------------------------------
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Week 17 maps Wed/Thu/Fri/Sat day indices to specific test days.
const TESTING_DAY_KEYS = { 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat' };

// ----------------------------------------------------------------------------
// Build a session object for a given type + phase context.
// ----------------------------------------------------------------------------
export function buildSession(type, phase, opts = {}) {
  const { deload = false, testDay = null } = opts;
  switch (type) {
    case 'limit':
      return { id: 'limit', name: deload ? 'Limit (deload)' : 'Limit Bouldering', short: 'Limit', duration: deload ? '90 min' : '~2 hrs', plannedMinutes: deload ? 90 : 120, location: 'Wall', accent: '#C2A878', exercises: limitExercises(phase, deload) };
    case 'volume':
      return { id: 'volume', name: deload ? 'Volume (deload)' : 'Volume / Endurance', short: 'Volume', duration: deload ? '60 min' : '~90 min', plannedMinutes: deload ? 60 : 90, location: 'Wall', accent: '#7A9E5F', exercises: volumeExercises(phase, deload) };
    case 'tech':
      return { id: 'tech', name: 'Technique', short: 'Technique', duration: '~75 min', plannedMinutes: 75, location: 'Wall', accent: '#A8957A', exercises: techExercises(phase, deload) };
    case 'homeA': {
      const n = HOME_A_NAMES[phase.id] || { full: 'Home Gym', short: 'Home' };
      return { id: 'homeA', name: n.full, short: n.short, duration: '~60 min', plannedMinutes: 60, location: 'Home', accent: '#94A3B8', exercises: homeAExercises(phase, deload) };
    }
    case 'homeB': {
      const n = HOME_B_NAMES[phase.id] || { full: 'Home Gym', short: 'Home' };
      return { id: 'homeB', name: n.full, short: n.short, duration: '~60 min', plannedMinutes: 60, location: 'Home', accent: '#94A3B8', exercises: homeBExercises(phase, deload) };
    }
    case 'lightHome':
      return { id: 'lightHome', name: 'Light Home (deload)', short: 'Light', duration: '~30 min', plannedMinutes: 30, location: 'Home', accent: '#6E94A8', exercises: lightHomeExercises() };
    case 'testing':
      return { id: 'testing', name: 'Testing', short: 'Test', duration: 'Varies', plannedMinutes: 60, location: 'Wall / Home', accent: '#D97757', exercises: testingExercises(testDay) };
    case 'rest':
    default:
      return { id: 'rest', name: 'Rest', short: 'Rest', duration: 'Full day off', plannedMinutes: 0, location: 'Active recovery only', accent: '#444', exercises: restExercises() };
  }
}

// ----------------------------------------------------------------------------
// Default weekly pattern per cadence.
// Cadence values: '3day' (3-climb default) or '2day' (2-climb busy week).
// Weeks 9 & 16 (deload) and week 17 (testing) use fixed patterns regardless
// of cadence.
// ----------------------------------------------------------------------------
export function getDefaultPattern(weekNumber, cadence = '3day') {
  if (weekNumber === 9 || weekNumber === 16) {
    // Deload — 2 easy volume sessions (Mon + Fri) + 1 light home (Tue).
    return ['volume', 'lightHome', 'rest', 'rest', 'volume', 'rest', 'rest'];
  }
  if (weekNumber === 17) {
    // Testing week — Mon/Tue rest, Wed–Sat testing, Sun rest.
    return ['rest', 'rest', 'testing', 'testing', 'testing', 'testing', 'rest'];
  }
  if (cadence === '2day') {
    // Mon Limit · Tue HomeA · Wed Rest · Thu Volume · Fri HomeB · Sat Rest · Sun Rest
    return ['limit', 'homeA', 'rest', 'volume', 'homeB', 'rest', 'rest'];
  }
  // Mon Limit · Tue HomeA · Wed Volume · Thu Rest · Fri Tech · Sat HomeB · Sun Rest
  return ['limit', 'homeA', 'volume', 'rest', 'tech', 'homeB', 'rest'];
}

// ----------------------------------------------------------------------------
// Build the full 7-day schedule for a given week.
// ----------------------------------------------------------------------------
export function getWeekSchedule(weekNumber, cadence = '3day', pattern = null) {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isDeepDeload = phase.deepDeloadWeek === weekNumber;
  const isTesting = phase.testingWeek === weekNumber;
  const usePattern = pattern || getDefaultPattern(weekNumber, cadence);

  return usePattern.map((type, i) => {
    const opts = { deload: isDeload };
    if (isTesting && type === 'testing') opts.testDay = TESTING_DAY_KEYS[i] || null;
    return {
      dayLabel: DAY_LABELS[i],
      dayIndex: i,
      weekNumber,
      sessionType: type,
      session: buildSession(type, phase, opts),
      isDeload,
      isDeepDeload,
      isTesting,
    };
  });
}

// ----------------------------------------------------------------------------
// Week metadata (phase, dates, flags, display tag).
// ----------------------------------------------------------------------------
export function getWeekMeta(weekNumber) {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isDeepDeload = phase.deepDeloadWeek === weekNumber;
  const isTesting = phase.testingWeek === weekNumber;
  const startDate = addDays(PLAN_START_DATE, (weekNumber - 1) * 7);
  const endDate = addDays(startDate, 6);
  let tag = null;
  if (isTesting) tag = 'Testing';
  else if (isDeepDeload) tag = 'Deload';
  else if (isDeload) tag = 'Deload';
  return { weekNumber, phase, isDeload, isDeepDeload, isTesting, tag, startDate, endDate };
}

// ----------------------------------------------------------------------------
// Iterate every session across all 17 weeks.
// cadenceFor and patternFor are functions (weekNumber) → value, matching the
// store's cadenceFor / patternFor helpers.
// ----------------------------------------------------------------------------
export function getAllSessions(cadenceFor = () => '3day', patternFor = () => null) {
  const out = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const week = getWeekSchedule(w, cadenceFor(w), patternFor(w));
    week.forEach((d, i) => {
      out.push({
        weekNumber: w,
        dayIndex: i,
        sessionType: d.sessionType,
        session: d.session,
        isDeload: d.isDeload,
        isDeepDeload: d.isDeepDeload,
        isTesting: d.isTesting,
      });
    });
  }
  return out;
}
