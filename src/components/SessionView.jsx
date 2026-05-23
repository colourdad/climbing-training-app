// ============================================================================
// SessionView — full-screen session detail. Lists exercises (sortable +
// swipe-to-skip when not a rest day), holds the per-session notes textarea
// with debounced + save-on-unmount persistence, and surfaces End-Session.
// Opened from any tab via the day rows; the back button returns to whichever
// tab the user came from (App-level prevViewRef).
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { getWeekMeta } from '../services/planGenerator.js';
import { formatDateShort } from '../data/sessions.js';
import { Icon } from './icons.jsx';
import { SwipeDeleteRow, SortableList } from './SortableList.jsx';
import { ExerciseCard } from './ExerciseCard.jsx';
import { EndSessionModal } from './EndSessionModal.jsx';

export function SessionView({ day, store, onBack }) {
  const { session, weekNumber, dayIndex, dayLabel } = day;
  const isRest = day.sessionType === 'rest';
  const meta = getWeekMeta(weekNumber);
  const log = store.sessionLogFor(weekNumber, dayIndex);
  const status = store.getSessionStatus(weekNumber, dayIndex, session.exercises);
  const ended = !!log;

  const [expanded, setExpanded] = useState({});
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [notes, setNotes] = useState(log?.notes || '');
  const [undoConfirm, setUndoConfirm] = useState(false);

  // Exercise ordering + skipping
  const customOrder = store.exerciseOrderFor(weekNumber, dayIndex);
  const skipped = store.exerciseSkippedFor(weekNumber, dayIndex);

  const orderedExercises = useMemo(() => {
    let exs = [...session.exercises];
    if (customOrder) {
      const orderMap = Object.fromEntries(customOrder.map((id, i) => [id, i]));
      exs.sort((a, b) => ((orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999)));
    }
    return exs.filter(ex => !skipped[ex.id]);
  }, [session.exercises, customOrder, skipped]);

  const skippedCount = session.exercises.filter(ex => skipped[ex.id]).length;

  // Refs for save-on-unmount (debounced timer would otherwise be cancelled)
  const notesRef = useRef(notes);
  const initialNotesRef = useRef(log?.notes || '');
  notesRef.current = notes;

  // Debounced persist while typing
  useEffect(() => {
    if (notes === (log?.notes || '')) return;
    const t = setTimeout(() => {
      store.saveSessionNotes(weekNumber, dayIndex, notes);
    }, 400);
    return () => clearTimeout(t);
  }, [notes, weekNumber, dayIndex, log?.notes]);

  // Save-on-unmount: if user navigates away before debounce fires, still persist.
  useEffect(() => () => {
    if (notesRef.current !== initialNotesRef.current) {
      store.saveSessionNotes(weekNumber, dayIndex, notesRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull external notes changes (e.g. after End-Session modal saves)
  useEffect(() => { setNotes(log?.notes || ''); }, [log?.notes]);

  const dayDate = (() => {
    const d = new Date(meta.startDate + 'T00:00:00');
    d.setDate(d.getDate() + dayIndex);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <div className="view">
      <button className="back" onClick={onBack}>
        <Icon.ArrowLeft style={{ width: 16, height: 16 }} /> Back
      </button>

      <div className="detail-head">
        <div className="detail-eyebrow">
          Week {weekNumber} · {dayLabel} · {formatDateShort(dayDate)}
          {meta.tag ? ` · ${meta.tag}` : ''}
        </div>
        <h1 className="detail-title">{session.name}</h1>
        <div className="detail-meta">{session.duration} · {session.location}</div>
        {ended && (
          <div className="ended-banner" style={{ borderColor: status === 'done' ? '#7A9E5F55' : '#C2A87855' }}>
            {status === 'done' ? '✓ Done' : '— Partial'} · {log.actualMinutes} min
            {log.difficulty > 0 ? ` · Diff ${log.difficulty}/5` : ''}
            {log.effort > 0 ? ` · Effort ${log.effort}/5` : ''}
          </div>
        )}
      </div>

      <div className="exercise-list">
        {!isRest && orderedExercises.length > 0 ? (
          <SortableList
            items={orderedExercises}
            keyFn={(ex) => ex.id}
            onReorder={(newExs) => store.setExerciseOrder(weekNumber, dayIndex, newExs.map(e => e.id))}
            renderItem={(ex, _displayIdx, onDragHandleTouch) => {
              const done = store.isExerciseDone(weekNumber, dayIndex, ex.id);
              return (
                <SwipeDeleteRow
                  onDelete={() => store.toggleExerciseSkipped(weekNumber, dayIndex, ex.id)}
                >
                  <ExerciseCard
                    ex={ex}
                    done={done}
                    onToggleDone={() => store.toggleExercise(weekNumber, dayIndex, ex.id)}
                    expanded={!!expanded[ex.id]}
                    onToggleExpand={() => setExpanded(s => ({ ...s, [ex.id]: !s[ex.id] }))}
                    onDragHandleTouch={onDragHandleTouch}
                  />
                </SwipeDeleteRow>
              );
            }}
          />
        ) : (
          session.exercises.map(ex => {
            const done = !isRest && store.isExerciseDone(weekNumber, dayIndex, ex.id);
            return (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                done={done}
                onToggleDone={() => !isRest && store.toggleExercise(weekNumber, dayIndex, ex.id)}
                expanded={!!expanded[ex.id]}
                onToggleExpand={() => setExpanded(s => ({ ...s, [ex.id]: !s[ex.id] }))}
              />
            );
          })
        )}
        {skippedCount > 0 && (
          <button
            className="restore-btn"
            onClick={() => store.restoreExercises(weekNumber, dayIndex)}
          >
            Restore {skippedCount} removed exercise{skippedCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {!isRest && (
        <>
          <div className="section-head">
            <h3>Session notes</h3>
            <span className="section-sub">auto-saved</span>
          </div>
          <textarea
            className="notes-input"
            rows={3}
            placeholder="Free-form notes for this session…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div style={{ marginTop: 16 }}>
            {!ended ? (
              <button className="complete-btn" onClick={() => setEndModalOpen(true)}>End session</button>
            ) : (
              <div className="complete-row">
                <button className={`complete-btn ${status === 'done' ? 'done' : 'partial'}`} onClick={() => setEndModalOpen(true)}>
                  {status === 'done' ? '✓ Done · edit' : '— Partial · edit'}
                </button>
                {undoConfirm ? (
                  <>
                    <button className="complete-undo" style={{ color: 'var(--danger, #D97757)' }} onClick={() => { store.undoEndSession(weekNumber, dayIndex); setUndoConfirm(false); }}>Confirm</button>
                    <button className="complete-undo" onClick={() => setUndoConfirm(false)}>Cancel</button>
                  </>
                ) : (
                  <button className="complete-undo" onClick={() => setUndoConfirm(true)}>Undo</button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {endModalOpen && (
        <EndSessionModal
          day={day}
          store={store}
          existingLog={log}
          currentNotes={notes}
          onClose={() => setEndModalOpen(false)}
          onDone={() => { setEndModalOpen(false); onBack(); }}
        />
      )}
    </div>
  );
}
