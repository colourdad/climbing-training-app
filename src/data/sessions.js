// ============================================================================
// Plan constants and date utilities
// Schedule construction (buildSession, getWeekSchedule, etc.) lives in
// services/planGenerator.js, which imports from here.
// ============================================================================

// ----------------------------------------------------------------------------
// Plan constants
// ----------------------------------------------------------------------------
export const PLAN_START_DATE = '2026-05-18';
export const TOTAL_WEEKS = 17;

// ----------------------------------------------------------------------------
// Date helpers
// ----------------------------------------------------------------------------
export function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.floor((db - da) / 86400000);
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getPlanPosition(isoDate) {
  const diff = daysBetween(PLAN_START_DATE, isoDate);
  if (diff < 0) return { weekNumber: 1, dayIndex: 0, beforePlan: true };
  if (diff >= TOTAL_WEEKS * 7) return { weekNumber: TOTAL_WEEKS, dayIndex: 6, afterPlan: true };
  return { weekNumber: Math.floor(diff / 7) + 1, dayIndex: diff % 7 };
}

export function formatDateShort(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDateLong(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

