import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '../services/supabase.js';

const DEBOUNCE_MS = 1500;

// camelCase state → snake_case DB columns
function stateToRow(userId, s) {
  return {
    user_id:             userId,
    schema_version:      4,
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
  const clientRef   = useRef(null);
  const debounceRef = useRef(null);
  const [cloudState, setCloudState] = useState('checking');

  // (Re)build the Supabase client whenever auth state changes.
  useEffect(() => {
    if (!isSignedIn) {
      clientRef.current = null;
      setCloudState('checking');
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
        setState(rowToState(data));
        setCloudState('found');
      } else {
        setCloudState('not-found');
      }
      setSyncStatus('idle');
    })();
  }, [isSignedIn, userId, cloudState, setState, setSyncStatus]);

  // Debounced save — skip until after the initial load completes.
  useEffect(() => {
    if (!isSignedIn || !clientRef.current || !userId) return;
    if (cloudState === 'checking') return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSyncStatus('saving');
      const { error } = await clientRef.current
        .from('training_data')
        .upsert(stateToRow(userId, state), { onConflict: 'user_id' });
      setSyncStatus(error ? 'error' : 'idle');
      if (!error && cloudState === 'not-found') {
        setCloudState('found');
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [state, isSignedIn, userId, cloudState, setSyncStatus]);

  return { cloudState };
}
