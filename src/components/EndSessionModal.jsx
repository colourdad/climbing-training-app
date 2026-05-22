// ============================================================================
// EndSessionModal — opened from SessionDetail when the user taps "End session".
// Captures actual duration, difficulty + effort ratings, and notes, then
// hands them to store.endSession.
// ============================================================================

import { useState } from 'react';
import { RatingRow } from './ExerciseCard.jsx';

export function EndSessionModal({ day, store, existingLog, currentNotes, onClose, onDone }) {
  const planned = day.session.plannedMinutes || 0;
  const [minutes, setMinutes] = useState(existingLog?.actualMinutes ?? planned);
  const [difficulty, setDifficulty] = useState(existingLog?.difficulty ?? 0);
  const [effort, setEffort] = useState(existingLog?.effort ?? 0);
  const [notes, setNotes] = useState(currentNotes ?? existingLog?.notes ?? '');

  const save = () => {
    store.endSession(day.weekNumber, day.dayIndex, {
      actualMinutes: Number(minutes) || 0,
      plannedMinutes: planned,
      difficulty,
      effort,
      notes,
    });
    onDone();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>End session</h3>
        <p>{day.session.name} · planned {planned} min</p>

        <div className="end-row">
          <div className="rating-label" style={{ marginBottom: 8 }}>
            <span>Actual duration</span>
            <span className="tiny muted">minutes</span>
          </div>
          <div className="duration-row">
            <button className="dur-step" onClick={() => setMinutes(m => Math.max(0, Number(m) - 5))}>−5</button>
            <input
              type="number"
              className="dur-input"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              inputMode="numeric"
              min="0"
            />
            <button className="dur-step" onClick={() => setMinutes(m => Number(m) + 5)}>+5</button>
          </div>
        </div>

        <RatingRow label="Difficulty" sub="how hard the session felt" value={difficulty} onChange={setDifficulty} />
        <RatingRow label="Effort" sub="what you put in" value={effort} onChange={setEffort} />

        <div className="end-row">
          <div className="rating-label" style={{ marginBottom: 6 }}>
            <span>Notes</span>
            <span className="tiny muted">optional</span>
          </div>
          <textarea
            className="notes-input"
            placeholder="Anything to remember from this session…"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button className="modal-primary" onClick={save}>End session</button>
        <button className="modal-close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
