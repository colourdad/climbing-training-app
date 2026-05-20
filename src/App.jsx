import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PHASES,
  SKILL_CATEGORIES,
  SKILL_ORDER,
  getPhase,
  getWeekSchedule,
  getWeekMeta,
  getAllSessions,
  getPlanPosition,
  getDefaultPattern,
  todayISO,
  formatDateShort,
  formatDateLong,
  NOTES_CONTENT,
  buildExerciseCatalog,
  getAllMuscles,
} from './data.js';

// ============================================================================
// localStorage
// ============================================================================
const STORAGE_KEY = 'send_climbing_v2';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

function useStore() {
  const [state, setState] = useState(() => {
    const loaded = loadState();
    return {
      cadence: loaded.cadence || '3day',
      weekCadence: loaded.weekCadence || {},
      weekPattern: loaded.weekPattern || {},
      completedExercises: loaded.completedExercises || {},
      sessionLog: loaded.sessionLog || {},
    };
  });

  useEffect(() => { saveState(state); }, [state]);

  // Per-week cadence: explicit override → global cadence
  const cadenceFor = (w) => state.weekCadence[w] || state.cadence;
  const patternFor = (w) => state.weekPattern[w] || null;

  // ---- exercise / session helpers ----
  const isExerciseDone = (w, d, exId) => !!state.completedExercises[`w${w}_d${d}_${exId}`];

  const toggleExercise = (w, d, exId) => setState(s => {
    const k = `w${w}_d${d}_${exId}`;
    const next = { ...s.completedExercises };
    if (next[k]) delete next[k]; else next[k] = true;
    return { ...s, completedExercises: next };
  });

  const sessionLogFor = (w, d) => state.sessionLog[`w${w}_d${d}`] || null;

  const endSession = (w, d, payload) => setState(s => {
    const k = `w${w}_d${d}`;
    return { ...s, sessionLog: { ...s.sessionLog, [k]: { ...payload, endedAt: new Date().toISOString() } } };
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
  // A session is "ended" only if log.endedAt exists. Notes-only entries are still 'planned'.
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
    // when changing cadence for a week, also reset that week's pattern (if any) to the new default
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

  // ---- global cadence (default) ----
  const setGlobalCadence = (cad) => setState(s => ({ ...s, cadence: cad }));

  const resetAll = () => setState({
    cadence: state.cadence,
    weekCadence: {},
    weekPattern: {},
    completedExercises: {},
    sessionLog: {},
  });

  return {
    state,
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
    resetAll,
  };
}

// ============================================================================
// Audio: short beep when timer hits zero
// ============================================================================
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    o.start();
    o.stop(ctx.currentTime + 0.6);
    setTimeout(() => ctx.close(), 700);
  } catch (e) {}
}

function fmtSec(s) {
  if (s == null || isNaN(s)) return '0:00';
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ============================================================================
// Icons
// ============================================================================
const Icon = {
  Home: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11L12 4l9 7" /><path d="M5 10v10h14V10" /></svg>,
  Calendar: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  Chart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" /></svg>,
  Book: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4v16a2 2 0 0 0 2 2h14" /><path d="M20 22V4H6a2 2 0 0 0-2 2v0" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>,
  Cog: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
  Check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 13l4 4L19 7" /></svg>,
  ArrowLeft: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 18l-6-6 6-6" /></svg>,
  ChevronDown: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6" /></svg>,
  Up: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 15l-6-6-6 6" /></svg>,
  Down: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6" /></svg>,
  Pencil: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>,
  Clock: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  Play: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 4l14 8-14 8z" /></svg>,
  Pause: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
  Reset: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v6h6" /></svg>,
  Search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></svg>,
  Dash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...p}><path d="M6 12h12" /></svg>,
};

// ============================================================================
// Skill pill
// ============================================================================
function SkillPill({ categoryId, compact = false }) {
  const c = SKILL_CATEGORIES[categoryId];
  if (!c) return null;
  return (
    <span className="pill" style={{ borderColor: `${c.color}55` }}>
      <span className="dot" style={{ background: c.color }} />
      {compact ? c.short : c.label}
    </span>
  );
}

// ============================================================================
// Status indicator (small circle on day rows)
// ============================================================================
function StatusDot({ status, accent }) {
  if (status === 'done') {
    return <div className="day-check checked"><Icon.Check style={{ width: 14, height: 14 }} /></div>;
  }
  if (status === 'partial') {
    return <div className="day-check partial" style={{ borderColor: '#C2A878', background: '#C2A87822' }}>
      <Icon.Dash style={{ width: 14, height: 14, color: '#C2A878' }} />
    </div>;
  }
  return <div className="day-check" />;
}

// ============================================================================
// Day row
// ============================================================================
function DayRow({ day, isToday, status, onClick, editMode, onMoveUp, onMoveDown, canUp, canDown }) {
  const isRest = day.sessionType === 'rest';
  return (
    <div className={`day-row ${isRest ? 'rest' : ''} ${status === 'done' ? 'complete' : ''} ${isToday ? 'is-today' : ''}`}>
      <button className="day-row-main" onClick={onClick} disabled={editMode}>
        <div className="day-dow">{day.dayLabel}</div>
        <div className="day-bar" style={{ background: isRest ? '#26262a' : day.session.accent }} />
        <div className="day-body">
          <div className="day-name">{day.session.name}</div>
          <div className="day-meta">{isRest ? 'Recovery' : `${day.session.duration} · ${day.session.location}`}</div>
        </div>
        {!editMode && !isRest && <StatusDot status={status} />}
        {!editMode && isRest && <div className="day-check rest-dot" />}
      </button>
      {editMode && (
        <div className="day-reorder">
          <button className="reorder-btn" disabled={!canUp} onClick={onMoveUp} aria-label="Move up">
            <Icon.Up style={{ width: 18, height: 18 }} />
          </button>
          <button className="reorder-btn" disabled={!canDown} onClick={onMoveDown} aria-label="Move down">
            <Icon.Down style={{ width: 18, height: 18 }} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Inline exercise timer
// ============================================================================
function ExerciseTimer({ initialSec, label }) {
  const [remaining, setRemaining] = useState(initialSec);
  const [running, setRunning] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(tickRef.current);
          setRunning(false);
          beep();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  const adjust = (delta) => {
    setRemaining(r => Math.max(0, r + delta));
  };

  const reset = () => {
    setRunning(false);
    setRemaining(initialSec);
  };

  const start = () => {
    if (remaining === 0) setRemaining(initialSec);
    setRunning(true);
  };

  const pause = () => setRunning(false);

  return (
    <div className="timer">
      <div className="timer-head">
        <span className="timer-label">{label || 'Timer'}</span>
        <span className="timer-default tiny muted">default {fmtSec(initialSec)}</span>
      </div>
      <div className="timer-display">
        <button className="timer-adj" onClick={() => adjust(-10)} aria-label="-10 sec">−10</button>
        <div className={`timer-time ${remaining === 0 && !running ? 'zero' : ''}`}>
          {fmtSec(remaining)}
        </div>
        <button className="timer-adj" onClick={() => adjust(10)} aria-label="+10 sec">+10</button>
      </div>
      <div className="timer-ctrls">
        {running ? (
          <button className="timer-btn timer-pause" onClick={pause}>
            <Icon.Pause style={{ width: 18, height: 18 }} /> Pause
          </button>
        ) : (
          <button className="timer-btn timer-play" onClick={start}>
            <Icon.Play style={{ width: 18, height: 18 }} /> {remaining === 0 ? 'Restart' : 'Start'}
          </button>
        )}
        <button className="timer-btn timer-reset" onClick={reset} aria-label="Reset">
          <Icon.Reset style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Exercise card (expandable)
// ============================================================================
function ExerciseCard({ ex, done, onToggleDone, expanded, onToggleExpand }) {
  return (
    <div className={`exercise ${done ? 'done' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="exercise-row-top">
        <button
          className={`exercise-tick ${done ? 'done' : ''}`}
          onClick={onToggleDone}
          aria-label={done ? 'Untick' : 'Tick'}
        >
          {done && <Icon.Check style={{ width: 14, height: 14 }} />}
        </button>
        <button className="exercise-meta-area" onClick={onToggleExpand}>
          <div className="exercise-row">
            <span className="exercise-name">{ex.name}</span>
            <span className="exercise-meta">{ex.sets}</span>
          </div>
          <div className="exercise-tags">
            <SkillPill categoryId={ex.category} compact />
            {ex.rest && ex.rest !== '—' && (
              <span className="tiny muted">Rest {ex.rest}</span>
            )}
          </div>
          {ex.notes && <div className="exercise-notes">{ex.notes}</div>}
        </button>
        <button className={`exercise-expand ${expanded ? 'open' : ''}`} onClick={onToggleExpand} aria-label="Expand">
          <Icon.ChevronDown style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {expanded && (
        <div className="exercise-expanded">
          {ex.description && (
            <div className="exercise-section">
              <div className="exercise-section-label">How to do it</div>
              <div className="exercise-section-body">{ex.description}</div>
            </div>
          )}

          {ex.muscles && ex.muscles.length > 0 && (
            <div className="exercise-section">
              <div className="exercise-section-label">Targets</div>
              <div className="row-gap-6" style={{ marginTop: 4 }}>
                {ex.muscles.map(m => (
                  <span key={m} className="muscle-chip">{m}</span>
                ))}
              </div>
            </div>
          )}

          {ex.progression && (
            <div className="exercise-section">
              <div className="exercise-section-label">Progression</div>
              <div className="exercise-section-body muted">{ex.progression}</div>
            </div>
          )}

          {ex.timer && ex.timer.sec > 0 && (
            <ExerciseTimer initialSec={ex.timer.sec} label={ex.timer.label} />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Rating row (1-5 dots)
// ============================================================================
function RatingRow({ label, value, onChange, sub }) {
  return (
    <div className="rating-row">
      <div className="rating-label">
        <span>{label}</span>
        {sub && <span className="tiny muted">{sub}</span>}
      </div>
      <div className="rating-dots">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            className={`rating-dot ${value >= n ? 'on' : ''}`}
            onClick={() => onChange(n === value ? 0 : n)}
            aria-label={`Rate ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// End Session modal
// ============================================================================
function EndSessionModal({ day, store, existingLog, currentNotes, onClose, onDone }) {
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

// ============================================================================
// Session detail
// ============================================================================
function SessionDetail({ day, store, onBack }) {
  const { session, weekNumber, dayIndex, dayLabel } = day;
  const isRest = day.sessionType === 'rest';
  const meta = getWeekMeta(weekNumber);
  const log = store.sessionLogFor(weekNumber, dayIndex);
  const status = store.getSessionStatus(weekNumber, dayIndex, session.exercises);
  const ended = !!log;

  const [expanded, setExpanded] = useState({});
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [notes, setNotes] = useState(log?.notes || '');

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
        {session.exercises.map(ex => {
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
        })}
      </div>

      {!isRest && (
        <>
          <div className="section-head">
            <h3>Session notes</h3>
            <span className="section-sub">saved to this device</span>
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
                <button
                  className="complete-undo"
                  onClick={() => {
                    if (confirm('Mark this session as not ended?')) store.undoEndSession(weekNumber, dayIndex);
                  }}
                >
                  Undo
                </button>
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
          onDone={() => { setEndModalOpen(false); }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Edit Week modal
// ============================================================================
function EditWeekModal({ weekNumber, store, onClose }) {
  const cadence = store.cadenceFor(weekNumber);
  const defaultPattern = useMemo(() => getDefaultPattern(weekNumber, cadence), [weekNumber, cadence]);
  const currentPattern = store.patternFor(weekNumber) || defaultPattern;
  const [pattern, setPattern] = useState(currentPattern);
  const [localCadence, setLocalCadence] = useState(cadence);
  const meta = getWeekMeta(weekNumber);

  const swap = (i, j) => {
    if (j < 0 || j >= 7) return;
    const next = [...pattern];
    [next[i], next[j]] = [next[j], next[i]];
    setPattern(next);
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

  const phase = meta.phase;

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
            <button className={localCadence === '3day' ? 'on' : ''} onClick={() => applyCadence('3day')}>3 days</button>
            <button className={localCadence === '2day' ? 'on' : ''} onClick={() => applyCadence('2day')}>2 days</button>
          </div>
        </div>

        <div className="section-head" style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: 14 }}>Day order</h3>
          <span className="section-sub tiny">use ↑ ↓ to swap</span>
        </div>

        <div className="day-list">
          {pattern.map((type, i) => {
            const sched = getWeekSchedule(weekNumber, localCadence, pattern)[i];
            return (
              <DayRow
                key={i}
                day={sched}
                isToday={false}
                status="planned"
                onClick={() => {}}
                editMode={true}
                canUp={i > 0}
                canDown={i < 6}
                onMoveUp={() => swap(i, i - 1)}
                onMoveDown={() => swap(i, i + 1)}
              />
            );
          })}
        </div>

        <button className="modal-close" onClick={reset} style={{ marginTop: 14 }}>Reset week to default</button>
        <button className="modal-primary" onClick={save} style={{ marginTop: 8 }}>Save changes</button>
        <button className="modal-close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ============================================================================
// Home view
// ============================================================================
function HomeView({ store, openSession, openSettings }) {
  const today = todayISO();
  const pos = getPlanPosition(today);
  const week = getWeekSchedule(pos.weekNumber, store.cadenceFor(pos.weekNumber), store.patternFor(pos.weekNumber));
  const todayDay = week[pos.dayIndex];
  const meta = getWeekMeta(pos.weekNumber);
  const phase = meta.phase;

  const weekSessions = week.filter(d => d.sessionType !== 'rest');
  const weekDone = weekSessions.filter(d => store.getSessionStatus(d.weekNumber, d.dayIndex, d.session.exercises) === 'done').length;

  const allSessions = useMemo(() => getAllSessions(store.cadenceFor, store.patternFor), [store.state]);
  const totalDone = allSessions.filter(s => s.sessionType !== 'rest' && store.getSessionStatus(s.weekNumber, s.dayIndex, s.session.exercises) === 'done').length;
  const totalNonRest = allSessions.filter(s => s.sessionType !== 'rest').length;
  const overallPct = totalNonRest ? Math.round((totalDone / totalNonRest) * 100) : 0;

  const todayStatus = todayDay && todayDay.sessionType !== 'rest'
    ? store.getSessionStatus(todayDay.weekNumber, todayDay.dayIndex, todayDay.session.exercises) : null;
  const isRestDay = todayDay?.sessionType === 'rest';

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Week {pos.weekNumber} of 16 · {phase.name}</div>
          <h1>Send</h1>
        </div>
        <button className="cog" onClick={openSettings} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div className="hero" style={{ '--accent': isRestDay ? '#94a3b8' : todayDay.session.accent }}>
        <div className="hero-eyebrow">
          <span className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
          Today · {formatDateLong(today)}
        </div>
        <h2>{todayDay ? todayDay.session.name : 'Rest day'}</h2>
        <div className="hero-meta">
          {todayDay && todayDay.sessionType !== 'rest'
            ? `${todayDay.session.duration} · ${todayDay.session.location}`
            : 'Active recovery: walk, mobility, gentle stretching.'}
        </div>
        <div className="hero-bottom">
          <div className="hero-stat">
            Phase
            <strong>{phase.name}</strong>
          </div>
          {todayDay && todayDay.sessionType !== 'rest' && (
            <button
              className={`hero-cta ${todayStatus === 'done' ? 'muted' : ''}`}
              onClick={() => openSession(todayDay)}
            >
              {todayStatus === 'done' ? 'View session' : todayStatus === 'partial' ? 'Continue' : 'Open session'}
            </button>
          )}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">This week</div>
          <div className="stat-value">{weekDone}/{weekSessions.length}</div>
          <div className="stat-sub">sessions done</div>
        </div>
        <div className="stat">
          <div className="stat-label">Phase</div>
          <div className="stat-value" style={{ fontSize: 17 }}>{phase.name}</div>
          <div className="stat-sub">{phase.limitGrade} limit</div>
        </div>
        <div className="stat">
          <div className="stat-label">Plan</div>
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-sub">complete</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, '--accent': phase.accent }}>
        <div className="card-row">
          <div>
            <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Phase {phase.id}
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, marginTop: 2 }}>{phase.name}</div>
          </div>
          <span className="phase-pill" style={{ background: `${phase.accent}24`, color: phase.accent }}>
            Wk {pos.weekNumber}/{phase.weeks[phase.weeks.length - 1]}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 10 }}>{phase.focus}</div>
        <div className="phase-progress">
          <div className="phase-progress-bar" style={{
            width: `${Math.min(100, ((pos.weekNumber - phase.weeks[0]) / phase.weeks.length) * 100 + (1 / phase.weeks.length) * 100)}%`,
            background: phase.accent,
          }} />
        </div>
      </div>

      <div className="section-head">
        <h3>This week</h3>
        <span className="section-sub">
          {formatDateShort(meta.startDate)} – {formatDateShort(meta.endDate)}
          {meta.tag ? ` · ${meta.tag}` : ''}
        </span>
      </div>
      <div className="day-list">
        {week.map((d, i) => (
          <DayRow
            key={i}
            day={d}
            isToday={i === pos.dayIndex}
            status={d.sessionType !== 'rest' ? store.getSessionStatus(d.weekNumber, d.dayIndex, d.session.exercises) : 'planned'}
            onClick={() => openSession(d)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Schedule view
// ============================================================================
function ScheduleView({ store, openSession, openSettings }) {
  const today = todayISO();
  const pos = getPlanPosition(today);
  const [activeWeek, setActiveWeek] = useState(pos.weekNumber);
  const [editOpen, setEditOpen] = useState(false);
  const week = getWeekSchedule(activeWeek, store.cadenceFor(activeWeek), store.patternFor(activeWeek));
  const meta = getWeekMeta(activeWeek);
  const phase = meta.phase;
  const stripRef = useRef(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-week="${activeWeek}"]`);
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeWeek]);

  const isCustomized = store.state.weekCadence[activeWeek] || store.state.weekPattern[activeWeek];

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">{phase.name} · {meta.tag || 'Build'}</div>
          <h1>Schedule</h1>
        </div>
        <button className="cog" onClick={openSettings} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div ref={stripRef} className="week-strip">
        {Array.from({ length: 16 }, (_, i) => i + 1).map(w => {
          const m = getWeekMeta(w);
          const sessionsThisWeek = getWeekSchedule(w, store.cadenceFor(w), store.patternFor(w)).filter(d => d.sessionType !== 'rest');
          const done = sessionsThisWeek.filter(d => store.getSessionStatus(w, d.dayIndex, d.session.exercises) === 'done').length;
          const customized = store.state.weekCadence[w] || store.state.weekPattern[w];
          return (
            <button
              key={w}
              data-week={w}
              className={`week-chip ${w === activeWeek ? 'active' : ''} ${w === pos.weekNumber ? 'current' : ''} ${m.isDeload ? 'deload' : ''} ${m.isTaper ? 'taper' : ''} ${customized ? 'custom' : ''}`}
              onClick={() => setActiveWeek(w)}
            >
              <div className="week-chip-num">Wk</div>
              <div className="week-chip-label">{w}</div>
              <div className="week-chip-tag">
                {m.isDeload ? 'Deload' : m.isTaper ? 'Taper' : `${done}/${sessionsThisWeek.length}`}
              </div>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: 14, '--accent': phase.accent }}>
        <div className="card-row">
          <div>
            <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Phase {phase.id} · {phase.name}
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, marginTop: 2 }}>Week {activeWeek}</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>
              {formatDateShort(meta.startDate)} – {formatDateShort(meta.endDate)}
              {isCustomized ? ' · customised' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {meta.tag && (
              <span className="phase-pill" style={{ background: `${phase.accent}24`, color: phase.accent }}>
                {meta.tag}
              </span>
            )}
            <button className="cog" onClick={() => setEditOpen(true)} aria-label="Edit week">
              <Icon.Pencil style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
        {meta.isDeload && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
            Cut climbing volume ~40%. Maintain home training.
          </div>
        )}
        {meta.isTaper && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
            Taper: half volume, keep intensity.
          </div>
        )}
      </div>

      <div className="day-list">
        {week.map((d, i) => (
          <DayRow
            key={i}
            day={d}
            isToday={activeWeek === pos.weekNumber && i === pos.dayIndex}
            status={d.sessionType !== 'rest' ? store.getSessionStatus(d.weekNumber, d.dayIndex, d.session.exercises) : 'planned'}
            onClick={() => openSession(d)}
          />
        ))}
      </div>

      {editOpen && <EditWeekModal weekNumber={activeWeek} store={store} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

// ============================================================================
// Stacked bar chart (replaces radar)
// ============================================================================
function StackedBarChart({ countsByCategoryByPhase }) {
  // countsByCategoryByPhase: { [skillId]: [p1count, p2count, p3count] }
  const cats = SKILL_ORDER;
  const width = 340;
  const height = 240;
  const padding = { top: 18, right: 8, bottom: 56, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barCount = cats.length;
  const barGap = 8;
  const barW = (chartW - barGap * (barCount - 1)) / barCount;

  const totals = cats.map(c => (countsByCategoryByPhase[c] || [0, 0, 0]).reduce((a, b) => a + b, 0));
  const rawMax = Math.max(1, ...totals);
  // Round y-max up to a nice number based on magnitude
  const niceMax = (() => {
    if (rawMax <= 5) return 5;
    if (rawMax <= 10) return 10;
    if (rawMax <= 20) return 20;
    if (rawMax <= 50) return Math.ceil(rawMax / 10) * 10;
    return Math.ceil(rawMax / 25) * 25;
  })();

  const ticks = (() => {
    const stepCount = 4;
    const step = niceMax / stepCount;
    return Array.from({ length: stepCount + 1 }, (_, i) => Math.round(step * i));
  })();

  const yFor = (v) => padding.top + chartH - (v / niceMax) * chartH;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {/* y-axis ticks */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={padding.left} x2={width - padding.right} y1={yFor(t)} y2={yFor(t)} stroke="#25252b" strokeDasharray={t === 0 ? '' : '2,3'} />
          <text x={padding.left - 6} y={yFor(t) + 3} fill="#6b675f" fontSize="9" textAnchor="end">{t}</text>
        </g>
      ))}

      {/* bars */}
      {cats.map((c, i) => {
        const segs = countsByCategoryByPhase[c] || [0, 0, 0];
        const x = padding.left + i * (barW + barGap);
        let yCursor = yFor(0);
        const phaseColors = PHASES.map(p => p.accent);
        return (
          <g key={c}>
            {segs.map((v, p) => {
              if (v === 0) return null;
              const h = (v / niceMax) * chartH;
              const y = yCursor - h;
              yCursor = y;
              return (
                <rect
                  key={p}
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  fill={phaseColors[p]}
                  rx="2"
                />
              );
            })}
            {/* category label */}
            <text
              x={x + barW / 2}
              y={height - padding.bottom + 14}
              fill="#a8a39a"
              fontSize="9"
              fontWeight="700"
              textAnchor="middle"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {SKILL_CATEGORIES[c].short.length > 7 ? SKILL_CATEGORIES[c].short.slice(0, 7) : SKILL_CATEGORIES[c].short}
            </text>
            {/* total value above bar */}
            {totals[i] > 0 && (
              <text
                x={x + barW / 2}
                y={yFor(totals[i]) - 4}
                fill="#f5f4f1"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {totals[i]}
              </text>
            )}
          </g>
        );
      })}

      {/* legend */}
      <g transform={`translate(${padding.left}, ${height - 26})`}>
        {PHASES.map((p, idx) => (
          <g key={p.id} transform={`translate(${idx * 90}, 0)`}>
            <rect width="10" height="10" rx="2" fill={p.accent} />
            <text x="14" y="9" fill="#a8a39a" fontSize="9.5">P{p.id} · {p.name}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ============================================================================
// Progress view
// ============================================================================
function ProgressView({ store, openSettings }) {
  const today = todayISO();
  const pos = getPlanPosition(today);

  const allSessions = useMemo(() => getAllSessions(store.cadenceFor, store.patternFor), [store.state]);
  const completedCount = allSessions.filter(s => s.sessionType !== 'rest' && store.getSessionStatus(s.weekNumber, s.dayIndex, s.session.exercises) === 'done').length;
  const partialCount = allSessions.filter(s => s.sessionType !== 'rest' && store.getSessionStatus(s.weekNumber, s.dayIndex, s.session.exercises) === 'partial').length;
  const totalSessions = allSessions.filter(s => s.sessionType !== 'rest').length;
  const overallPct = totalSessions ? Math.round((completedCount / totalSessions) * 100) : 0;

  // Per-phase
  const phaseStats = PHASES.map(phase => {
    const phaseSessions = allSessions.filter(s => phase.weeks.includes(s.weekNumber) && s.sessionType !== 'rest');
    const done = phaseSessions.filter(s => store.getSessionStatus(s.weekNumber, s.dayIndex, s.session.exercises) === 'done').length;
    return { ...phase, done, total: phaseSessions.length, pct: phaseSessions.length ? (done / phaseSessions.length) * 100 : 0 };
  });

  // Stacked bar chart counts: exercises completed per skill, broken down by phase.
  // Uses proportional weighting if a session was ended early (actualMinutes / plannedMinutes scales the credit).
  const countsByCategoryByPhase = useMemo(() => {
    const counts = {};
    SKILL_ORDER.forEach(s => { counts[s] = [0, 0, 0]; });
    allSessions.forEach(s => {
      if (s.sessionType === 'rest') return;
      const phase = getPhase(s.weekNumber);
      const log = store.sessionLogFor(s.weekNumber, s.dayIndex);
      // Each ticked exercise counts as 1, weighted by actual/planned if logged
      const ratio = log && log.plannedMinutes > 0
        ? Math.max(0.1, Math.min(2, log.actualMinutes / log.plannedMinutes))
        : 1;
      s.session.exercises.forEach(ex => {
        if (store.isExerciseDone(s.weekNumber, s.dayIndex, ex.id)) {
          counts[ex.category][phase.id - 1] += ratio;
        }
      });
    });
    // Round nicely
    SKILL_ORDER.forEach(s => {
      counts[s] = counts[s].map(v => Math.round(v * 10) / 10);
    });
    return counts;
  }, [store.state]);

  // Heatmap
  const heatmap = useMemo(() => {
    const rows = [];
    for (let w = 1; w <= 16; w++) {
      const week = getWeekSchedule(w, store.cadenceFor(w), store.patternFor(w));
      rows.push(week.map((d, i) => {
        const status = d.sessionType !== 'rest' ? store.getSessionStatus(w, i, d.session.exercises) : 'planned';
        return {
          sessionType: d.sessionType,
          accent: d.session.accent,
          status,
          deload: d.isDeload,
          isToday: w === pos.weekNumber && i === pos.dayIndex,
        };
      }));
    }
    return rows;
  }, [store.state, pos.weekNumber, pos.dayIndex]);

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Real-time</div>
          <h1>Progress</h1>
        </div>
        <button className="cog" onClick={openSettings} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Done</div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-sub">of {totalSessions}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Partial</div>
          <div className="stat-value">{partialCount}</div>
          <div className="stat-sub">incomplete</div>
        </div>
        <div className="stat">
          <div className="stat-label">Complete</div>
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-sub">overall</div>
        </div>
      </div>

      <div className="section-head">
        <h3>Training balance</h3>
        <span className="section-sub">exercises by skill · scale grows with progress</span>
      </div>
      <div className="card">
        <StackedBarChart countsByCategoryByPhase={countsByCategoryByPhase} />
      </div>

      <div className="section-head">
        <h3>Per phase</h3>
        <span className="section-sub">3 phases, 16 weeks</span>
      </div>
      <div className="card">
        <div className="phase-bars">
          {phaseStats.map(p => (
            <div className="phase-bar-row" key={p.id}>
              <div className="phase-bar-label">
                <strong>P{p.id} · {p.name}</strong>
                <span>{p.done}/{p.total} · {Math.round(p.pct)}%</span>
              </div>
              <div className="phase-bar">
                <div className="phase-bar-fill" style={{ width: `${p.pct}%`, background: p.accent }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-head">
        <h3>16-week heatmap</h3>
        <span className="section-sub">M · T · W · T · F · S · S</span>
      </div>
      <div className="card">
        <div className="heatmap">
          <div></div>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="hm-label-top">{d}</div>
          ))}
          {heatmap.map((row, w) => (
            <React.Fragment key={w}>
              <div className="hm-label-side">{w + 1}</div>
              {row.map((cell, d) => (
                <div
                  key={d}
                  className={`hm-cell ${cell.sessionType === 'rest' ? 'rest' : ''} ${cell.status === 'done' ? 'done' : ''} ${cell.status === 'partial' ? 'partial' : ''} ${cell.deload ? 'deload' : ''} ${cell.isToday ? 'today' : ''}`}
                  title={`Week ${w + 1}, Day ${d + 1}`}
                  style={cell.status === 'done' || cell.status === 'partial' || cell.sessionType === 'rest' ? null : { borderColor: `${cell.accent}55` }}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="hm-legend">
          <span><span className="sw" style={{ background: 'var(--moss)' }} /> done</span>
          <span><span className="sw partial-sw" /> partial</span>
          <span><span className="sw" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }} /> planned</span>
          <span><span className="sw" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', opacity: 0.35 }} /> rest</span>
          <span><span className="sw" style={{ border: '2px solid var(--accent)', background: 'transparent' }} /> today</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Notes view (incl. muscle search)
// ============================================================================
function NotesView({ store, openSettings }) {
  const catalog = useMemo(() => buildExerciseCatalog(), []);
  const muscles = useMemo(() => getAllMuscles(), []);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = catalog;
    if (selectedMuscle) list = list.filter(e => e.muscles.includes(selectedMuscle));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.muscles.some(m => m.toLowerCase().includes(q)) ||
        (e.description || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [catalog, selectedMuscle, search]);

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Reference</div>
          <h1>Notes</h1>
        </div>
        <button className="cog" onClick={openSettings} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Muscle search */}
      <div className="section-head">
        <h3>Find an exercise</h3>
        <span className="section-sub">by muscle group</span>
      </div>

      <div className="search-bar">
        <Icon.Search style={{ width: 16, height: 16, color: 'var(--text-2)' }} />
        <input
          type="text"
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>×</button>
        )}
      </div>

      <div className="muscle-chips">
        {muscles.map(m => (
          <button
            key={m}
            className={`muscle-chip selectable ${selectedMuscle === m ? 'on' : ''}`}
            onClick={() => setSelectedMuscle(selectedMuscle === m ? null : m)}
          >
            {m}
          </button>
        ))}
      </div>

      {(selectedMuscle || search) && (
        <div className="search-meta tiny muted" style={{ marginTop: 10 }}>
          {filtered.length} {filtered.length === 1 ? 'exercise' : 'exercises'}
          {selectedMuscle ? ` targeting ${selectedMuscle}` : ''}
          {search ? ` matching "${search}"` : ''}
        </div>
      )}

      {(selectedMuscle || search) ? (
        <div className="exercise-list" style={{ marginTop: 12 }}>
          {filtered.map((e, i) => (
            <div key={`${e.sessionType}-${e.id}`} className="exercise" style={{ paddingTop: 12 }}>
              <div className="exercise-body" style={{ flex: 1 }}>
                <div className="exercise-row">
                  <span className="exercise-name">{e.name}</span>
                  <span className="exercise-meta">{e.sets}</span>
                </div>
                <div className="exercise-tags" style={{ marginTop: 4 }}>
                  <SkillPill categoryId={e.category} compact />
                  <span className="tiny muted">{e.sessionName}</span>
                </div>
                {e.description && <div className="exercise-notes">{e.description}</div>}
                <div className="row-gap-6" style={{ marginTop: 6 }}>
                  {e.muscles.map(m => (
                    <span key={m} className={`muscle-chip ${selectedMuscle === m ? 'on' : ''}`}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card muted" style={{ textAlign: 'center', padding: 28 }}>No exercises match.</div>
          )}
        </div>
      ) : (
        <>
          {/* Notes content */}
          {NOTES_CONTENT.map(group => (
            <div className="note-group" key={group.id} style={{ marginTop: 18 }}>
              <h4>{group.heading}</h4>
              {group.items.map((item, i) => (
                <div key={i} className="note-item">
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          ))}

          <div className="section-head">
            <h3>Skill categories</h3>
            <span className="section-sub">colour key</span>
          </div>
          <div className="card row-gap-6">
            {SKILL_ORDER.map(c => <SkillPill key={c} categoryId={c} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Settings modal (global)
// ============================================================================
function SettingsModal({ store, onClose }) {
  const customized = Object.keys(store.state.weekCadence).length + Object.keys(store.state.weekPattern).length;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Settings</h3>
        <p>Plan starts Mon 18 May 2026. Progress saves to this device only.</p>

        <div className="modal-row">
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Default cadence</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>
              {store.state.cadence === '3day' ? 'Mon · Wed · Fri gym' : 'Mon · Fri gym'}
              {customized ? ` · ${customized} week${customized > 1 ? 's' : ''} customised` : ''}
            </div>
          </div>
          <div className="segmented">
            <button className={store.state.cadence === '3day' ? 'on' : ''} onClick={() => store.setGlobalCadence('3day')}>3 day</button>
            <button className={store.state.cadence === '2day' ? 'on' : ''} onClick={() => store.setGlobalCadence('2day')}>2 day</button>
          </div>
        </div>

        <div className="modal-hint tiny muted">
          Tip: tap the pencil icon on any week to override cadence or reorder days for that week only.
        </div>

        <button
          className="modal-danger"
          onClick={() => {
            if (confirm('Reset all progress and customisations? This cannot be undone.')) {
              store.resetAll();
              onClose();
            }
          }}
        >
          Reset all progress
        </button>

        <button className="modal-close" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ============================================================================
// Tab bar
// ============================================================================
function TabBar({ view, setView }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Icon.Home },
    { id: 'schedule', label: 'Schedule', icon: Icon.Calendar },
    { id: 'progress', label: 'Progress', icon: Icon.Chart },
    { id: 'notes', label: 'Notes', icon: Icon.Book },
  ];
  return (
    <nav className="tabbar">
      {tabs.map(t => {
        const Ico = t.icon;
        return (
          <button key={t.id} className={`tab ${view === t.id ? 'active' : ''}`} onClick={() => setView(t.id)}>
            <Ico className="tab-icon" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ============================================================================
// Root App
// ============================================================================
export default function App() {
  const store = useStore();
  const [view, setView] = useState('home');
  const [selectedDay, setSelectedDay] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openSession = (day) => setSelectedDay(day);
  const openSettings = () => setSettingsOpen(true);

  const handleSetView = (v) => { setSelectedDay(null); setView(v); };

  // When selectedDay reference is stale (state changed), refresh from current store.
  // Note: day object is built from getWeekSchedule each call; the stored reference
  // will not reflect store updates. So we re-derive each render based on the original
  // weekNumber + dayIndex.
  let dayForRender = null;
  if (selectedDay) {
    const fresh = getWeekSchedule(
      selectedDay.weekNumber,
      store.cadenceFor(selectedDay.weekNumber),
      store.patternFor(selectedDay.weekNumber)
    )[selectedDay.dayIndex];
    dayForRender = fresh || selectedDay;
  }

  return (
    <div className="app">
      {dayForRender ? (
        <SessionDetail day={dayForRender} store={store} onBack={() => setSelectedDay(null)} />
      ) : view === 'home' ? (
        <HomeView store={store} openSession={openSession} openSettings={openSettings} />
      ) : view === 'schedule' ? (
        <ScheduleView store={store} openSession={openSession} openSettings={openSettings} />
      ) : view === 'progress' ? (
        <ProgressView store={store} openSettings={openSettings} />
      ) : (
        <NotesView store={store} openSettings={openSettings} />
      )}

      <TabBar view={view} setView={handleSetView} />

      {settingsOpen && <SettingsModal store={store} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
