// ============================================================================
// useTrainingPlan — all persistent app state + action creators
// Replaces the inline useStore() that previously lived in App.jsx.
// localStorage load/save is delegated to services/migrations.js.
// ============================================================================

import { useState, useEffect } from 'react';
import { loadState, saveState } from '../services/migrations.js';
import { useSupabaseSync } from './useSupabaseSync.js';

export function useTrainingPlan() {
  const [state, setState] = useState(() => {
    const loaded = loadState();
    return {
      cadence:            loaded.cadence            || '3day',
      weekCadence:        loaded.weekCadence        || {},
      weekPattern:        loaded.weekPattern         || {},
      completedExercises: loaded.completedExercises  || {},
      sessionLog:         loaded.sessionLog          || {},
      assessments:        loaded.assessments         || {},
      exerciseOrder:      loaded.exerciseOrder       || {},
      exerciseSkipped:    loaded.exerciseSkipped     || {},
    };
  });

  // localStorage — always written synchronously (offline cache)
  useEffect(() => { saveState(state); }, [state]);

  // Cloud sync
  const [syncStatus, setSyncStatus] = useState('idle');
  const { cloudState } = useSupabaseSync(state, setState, setSyncStatus);

  // ---- cadence helpers ----
  // Per-week cadence: explicit override → global cadence
  const cadenceFor = (w) => state.weekCadence[w] || state.cadence;
  const patternFor = (w) => state.weekPattern[w]  || null;

  // ---- exercise / session helpers ----
  const isExerciseDone = (w, d, exId) =>
    !!state.completedExercises[`w${w}_d${d}_${exId}`];

  const toggleExercise = (w, d, exId) => setState(s => {
    const k = `w${w}_d${d}_${exId}`;
    const next = { ...s.completedExercises };
    if (next[k]) delete next[k]; else next[k] = true;
    return { ...s, completedExercises: next };
  });

  const sessionLogFor = (w, d) => state.sessionLog[`w${w}_d${d}`] || null;

  const endSession = (w, d, payload) => setState(s => {
    const k = `w${w}_d${d}`;
    return {
      ...s,
      sessionLog: {
        ...s.sessionLog,
        [k]: { ...payload, endedAt: new Date().toISOString() },
      },
    };
  });

  const undoEndSession = (w, d) => setState(s => {
    const k = `w${w}_d${d}`;
    const next = { ...s.sessionLog };
    delete next[k];
    return { ...s, sessionLog: next };
  });

  const saveSessionNotes = (w, d, notes) => setState(s => {
    const k = `w${w}_d${d}`;
    const prev = s.sessionLog[k] || {};
    return { ...s, sessionLog: { ...s.sessionLog, [k]: { ...prev, notes } } };
  });

  // status: 'planned' | 'partial' | 'done'
  // A session is "ended" only if log.endedAt exists. Notes-only entries are
  // still 'planned'.
  const getSessionStatus = (w, d, exercises) => {
    const log = state.sessionLog[`w${w}_d${d}`];
    if (!log || !log.endedAt) return 'planned';
    if (!exercises || exercises.length === 0) return 'done';
    const allDone = exercises.every(ex => isExerciseDone(w, d, ex.id));
    return allDone ? 'done' : 'partial';
  };

  // ---- per-week cadence ----
  const setWeekCadence = (w, cad) => setState(s => {
    const next = { ...s.weekCadence };
    if (cad === null || cad === undefined) delete next[w];
    else next[w] = cad;
    // Changing cadence for a week also resets that week's custom pattern.
    const nextPattern = { ...s.weekPattern };
    delete nextPattern[w];
    return { ...s, weekCadence: next, weekPattern: nextPattern };
  });

  // ---- per-week pattern (day order) ----
  const setWeekPattern = (w, pattern) => setState(s => {
    const next = { ...s.weekPattern };
    if (!pattern) delete next[w]; else next[w] = pattern;
    return { ...s, weekPattern: next };
  });

  const resetWeek = (w) => setState(s => {
    const wc = { ...s.weekCadence }; delete wc[w];
    const wp = { ...s.weekPattern }; delete wp[w];
    return { ...s, weekCadence: wc, weekPattern: wp };
  });

  // ---- global cadence (default for all weeks) ----
  const setGlobalCadence = (cad) => setState(s => ({ ...s, cadence: cad }));

  // ---- assessments (Week 1 baseline / Week 17 retest) ----
  // Shape: assessments[testId] = { baseline: string, retest: string, notes: string }
  const assessmentFor = (id) =>
    state.assessments[id] || { baseline: '', retest: '', notes: '' };

  const setAssessmentField = (id, field, value) => setState(s => {
    const prev = s.assessments[id] || { baseline: '', retest: '', notes: '' };
    return {
      ...s,
      assessments: { ...s.assessments, [id]: { ...prev, [field]: value } },
    };
  });

  const resetAll = () => setState({
    cadence:            state.cadence,
    weekCadence:        {},
    weekPattern:        {},
    completedExercises: {},
    sessionLog:         {},
    assessments:        {},
    exerciseOrder:      {},
    exerciseSkipped:    {},
  });

  // ---- exercise customisations (per-session order + skipped) ----
  const exerciseOrderFor   = (w, d) => state.exerciseOrder[`w${w}_d${d}`]   || null;
  const exerciseSkippedFor = (w, d) => state.exerciseSkipped[`w${w}_d${d}`] || {};

  const setExerciseOrder = (w, d, idArray) => setState(s => {
    const k = `w${w}_d${d}`;
    return { ...s, exerciseOrder: { ...s.exerciseOrder, [k]: idArray } };
  });

  const toggleExerciseSkipped = (w, d, exId) => setState(s => {
    const k = `w${w}_d${d}`;
    const prev = s.exerciseSkipped[k] || {};
    const next = { ...prev };
    if (next[exId]) delete next[exId]; else next[exId] = true;
    return { ...s, exerciseSkipped: { ...s.exerciseSkipped, [k]: next } };
  });

  const restoreExercises = (w, d) => setState(s => {
    const k    = `w${w}_d${d}`;
    const eo   = { ...s.exerciseOrder };   delete eo[k];
    const es   = { ...s.exerciseSkipped }; delete es[k];
    return { ...s, exerciseOrder: eo, exerciseSkipped: es };
  });

  return {
    state,
    setState,
    syncStatus,
    cloudState,
    cadenceFor,
    patternFor,
    isExerciseDone,
    toggleExercise,
    sessionLogFor,
    endSession,
    undoEndSession,
    saveSessionNotes,
    getSessionStatus,
    setWeekCadence,
    setWeekPattern,
    resetWeek,
    setGlobalCadence,
    assessmentFor,
    setAssessmentField,
    resetAll,
    exerciseOrderFor,
    exerciseSkippedFor,
    setExerciseOrder,
    toggleExerciseSkipped,
    restoreExercises,
  };
}
