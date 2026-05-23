import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '../services/supabase.js';

const SAVE_INTERVAL_MS = 10_000;

// camelCase state → snake_case DB columns
function stateToRow(userId, s) {
  return {
    user_id:             userId,
    schema_version:      4,
    plan_start_date:     s.planStartDate        || null,
    cadence:             s.cadence,
    week_cadence:        s.weekCadence,
    week_pattern:        s.weekPattern,
    completed_exercises: s.completedExercises,
    session_log:         s.sessionLog,
    assessments:         s.assessments,
    exercise_order:      s.exerciseOrder,
    exercise_skipped:    s.exerciseSkipped,
  };
}

// DB row → camelCase state shape
function rowToState(row) {
  return {
    planStartDate:      row.plan_start_date     || null,
    cadence:            row.cadence             || '3day',
    weekCadence:        row.week_cadence        || {},
    weekPattern:        row.week_pattern        || {},
    completedExercises: row.completed_exercises || {},
    sessionLog:         row.session_log         || {},
    assessments:        row.assessments         || {},
    exerciseOrder:      row.exercise_order      || {},
    exerciseSkipped:    row.exercise_skipped    || {},
  };
}

// cloudState:
//   'checking'  — haven't fetched yet (or just signed in)
//   'found'     — cloud row exists; state loaded from it
//   'not-found' — signed in but no cloud row yet (first-ever sign-in)
export function useSupabaseSync(state, setState, setSyncStatus) {
  const { userId, getToken, isSignedIn } = useAuth();
  const clientRef    = useRef(null);
  const dirtyRef     = useRef(false);
  const stateRef     = useRef(state);
  const cloudStateRef = useRef('checking');
  const [cloudState, setCloudState] = useState('checking');

  // Keep stateRef current so the interval/visibilitychange handlers always
  // read the latest state without needing to be re-registered.
  stateRef.current = state;

  // Mirror cloudState into a ref so flush() can read it synchronously.
  const setCloudStateBoth = (v) => { cloudStateRef.current = v; setCloudState(v); };

  // (Re)build the Supabase client whenever auth state changes.
  useEffect(() => {
    if (!isSignedIn) {
      clientRef.current = null;
      setCloudStateBoth('checking');
      dirtyRef.current = false;
      return;
    }
    clientRef.current = createSupabaseClient(getToken);
  }, [isSignedIn, getToken]);

  // Initial load: fetch once when signed in and cloudState is 'checking'.
  useEffect(() => {
    if (!isSignedIn || !clientRef.current || !userId) return;
    if (cloudState !== 'checking') return;

    (async () => {
      setSyncStatus('loading');
      const { data, error } = await clientRef.current
        .from('training_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) { setSyncStatus('error'); return; }

      if (data) {
        const parsed = rowToState(data);
        const hasRealData =
          Object.keys(parsed.completedExercises).length > 0 ||
          Object.keys(parsed.sessionLog).length > 0 ||
          Object.keys(parsed.assessments).length > 0;
        if (hasRealData) {
          setState(parsed);
          setCloudStateBoth('found');
        } else {
          setCloudStateBoth('not-found');
        }
      } else {
        setCloudStateBoth('not-found');
      }
      setSyncStatus('idle');
    })();
  }, [isSignedIn, userId, cloudState, setState, setSyncStatus]);

  // Mark dirty on every state mutation (skipped during initial load).
  useEffect(() => {
    if (!isSignedIn || cloudState === 'checking') return;
    dirtyRef.current = true;
  }, [state, isSignedIn, cloudState]);

  // Core flush — saves if dirty, clears the flag, updates sync status.
  // Stable across renders: only depends on refs and setter callbacks.
  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const flush = async () => {
      if (!dirtyRef.current || !clientRef.current || cloudStateRef.current === 'checking') return;
      dirtyRef.current = false;
      setSyncStatus('saving');
      const { error } = await clientRef.current
        .from('training_data')
        .upsert(stateToRow(userId, stateRef.current), { onConflict: 'user_id' });
      setSyncStatus(error ? 'error' : 'idle');
      if (!error && cloudStateRef.current === 'not-found') {
        setCloudStateBoth('found');
      }
    };

    const interval = setInterval(flush, SAVE_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isSignedIn, userId, setSyncStatus]);

  return { cloudState };
}
