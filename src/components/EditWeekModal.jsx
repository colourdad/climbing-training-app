// ============================================================================
// EditWeekModal — opened from the Schedule tab's pencil icon. Lets the user
// override climbing cadence and reorder/swap session types for a single week.
// Default-pattern and other weeks are untouched.
// ============================================================================

import { useMemo, useState } from 'react';
import { getWeekSchedule, getWeekMeta, getDefaultPattern } from '../data.js';
import { DayRow } from './DayRow.jsx';
import { SwipeDeleteRow, SortableList } from './SortableList.jsx';

// Session types the user can manually add via the picker.
// Order matches the priority a typical week reads top-to-bottom.
const ADDABLE_SESSION_TYPES = ['limit', 'volume', 'tech', 'homeA', 'homeB'];

export function EditWeekModal({ weekNumber, store, onClose }) {
  const cadence = store.cadenceFor(weekNumber);
  const defaultPattern = useMemo(() => getDefaultPattern(weekNumber, cadence), [weekNumber, cadence]);
  const currentPattern = store.patternFor(weekNumber) || defaultPattern;
  const [pattern, setPattern] = useState(currentPattern);
  const [localCadence, setLocalCadence] = useState(cadence);
  const [pickerOpen, setPickerOpen] = useState(false);
  const meta = getWeekMeta(weekNumber);

  // Resolve the phase-aware display info for a candidate session type, using
  // this week's phase context (so homeA shows "Fingerboard + Pulling Strength"
  // in Phase 2, "Maintenance" in Phase 4, etc.).
  const sessionInfoFor = (type) => {
    const probe = getWeekSchedule(weekNumber, localCadence, [type, 'rest', 'rest', 'rest', 'rest', 'rest', 'rest']);
    return probe[0].session;
  };

  const removeAt = (i) => {
    const next = [...pattern];
    next[i] = 'rest';
    setPattern(next);
  };

  const addSession = (type) => {
    const restIndex = pattern.indexOf('rest');
    if (restIndex === -1) return; // no slot available
    const next = [...pattern];
    next[restIndex] = type;
    setPattern(next);
    setPickerOpen(false);
  };

  const applyCadence = (newCad) => {
    setLocalCadence(newCad);
    setPattern(getDefaultPattern(weekNumber, newCad));
  };

  const reset = () => {
    setLocalCadence(store.state.cadence);
    setPattern(getDefaultPattern(weekNumber, store.state.cadence));
  };

  const save = () => {
    // Save cadence override only if differs from global
    if (localCadence !== store.state.cadence) store.setWeekCadence(weekNumber, localCadence);
    else store.setWeekCadence(weekNumber, null);
    // Save pattern override only if differs from new default
    const def = getDefaultPattern(weekNumber, localCadence);
    const same = pattern.every((t, i) => t === def[i]);
    store.setWeekPattern(weekNumber, same ? null : pattern);
    onClose();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-tall" onClick={e => e.stopPropagation()}>
        <h3>Week {weekNumber}</h3>
        <p>Reorder days and choose climbing volume for this week only. Default and other weeks are untouched.</p>

        <div className="modal-row">
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Climbing volume</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>
              this week only
            </div>
          </div>
          <div className="segmented">
            <button className={localCadence === '3day' ? 'on' : ''} onClick={() => applyCadence('3day')}>3 climbs</button>
            <button className={localCadence === '2day' ? 'on' : ''} onClick={() => applyCadence('2day')}>2 climbs</button>
          </div>
        </div>

        <div className="section-head" style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: 14 }}>Day order</h3>
          <span className="section-sub tiny">hold ≡ to drag · swipe left to remove</span>
        </div>

        <SortableList
            items={pattern}
            keyFn={(type, idx) => `${idx}`}
            onReorder={(newPattern) => setPattern(newPattern)}
            renderItem={(type, displayIdx, onDragHandleTouch, isGhost) => {
              const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const sessionInfo = sessionInfoFor(type);
              const mockDay = {
                dayLabel: DAYS[displayIdx],
                sessionType: type,
                session: sessionInfo,
                weekNumber,
                dayIndex: displayIdx,
              };
              return (
                <SwipeDeleteRow
                  onDelete={() => removeAt(displayIdx)}
                  disabled={type === 'rest' || isGhost}
                >
                  <DayRow
                    day={mockDay}
                    isToday={false}
                    status="planned"
                    onClick={() => {}}
                    editMode={true}
                    onDragHandleTouch={onDragHandleTouch}
                  />
                </SwipeDeleteRow>
              );
            }}
          />

        {pickerOpen ? (
          <div className="session-picker">
            <div className="tiny muted" style={{ marginBottom: 8 }}>Add to next rest day</div>
            <div className="session-picker-options">
              {ADDABLE_SESSION_TYPES.map(t => {
                const info = sessionInfoFor(t);
                return (
                  <button
                    key={t}
                    className="session-picker-option"
                    onClick={() => addSession(t)}
                  >
                    <span className="session-picker-dot" style={{ background: info.accent }} />
                    <span>{info.name}</span>
                  </button>
                );
              })}
            </div>
            <button className="modal-close" onClick={() => setPickerOpen(false)} style={{ marginTop: 8 }}>Cancel add</button>
          </div>
        ) : pattern.indexOf('rest') === -1 ? (
          <div className="tiny muted" style={{ marginTop: 10, textAlign: 'center' }}>
            No rest days left to replace.
          </div>
        ) : (
          <button className="add-session-btn" onClick={() => setPickerOpen(true)}>
            + Add session
          </button>
        )}

        <button className="modal-close" onClick={reset} style={{ marginTop: 14 }}>Reset week to default</button>
        <button className="modal-primary" onClick={save} style={{ marginTop: 8 }}>Save changes</button>
        <button className="modal-close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
