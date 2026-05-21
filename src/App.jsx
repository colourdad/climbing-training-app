import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
  ASSESSMENTS,
  PLAN_START_DATE,
  addDays,
} from './data.js';

// ============================================================================
// localStorage
// ============================================================================
const STORAGE_KEY = 'send_climbing_v3';
const SCHEMA_VERSION = 3;
const LEGACY_KEYS = ['send_climbing_v2'];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion === SCHEMA_VERSION) return parsed;
    }
    // First load on this schema version — clear any legacy keys so old session
    // IDs (rings/weights/pe) don't linger.
    LEGACY_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    return {};
  } catch (e) { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, schemaVersion: SCHEMA_VERSION })); } catch (e) {}
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
      assessments: loaded.assessments || {},
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

  // ---- assessments (Week 1 baseline / Week 16 retest) ----
  // Shape: assessments[testId] = { baseline: string, retest: string, notes: string }
  const assessmentFor = (id) => state.assessments[id] || { baseline: '', retest: '', notes: '' };
  const setAssessmentField = (id, field, value) => setState(s => {
    const prev = s.assessments[id] || { baseline: '', retest: '', notes: '' };
    return { ...s, assessments: { ...s.assessments, [id]: { ...prev, [field]: value } } };
  });

  const resetAll = () => setState({
    cadence: state.cadence,
    weekCadence: {},
    weekPattern: {},
    completedExercises: {},
    sessionLog: {},
    assessments: {},
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
    assessmentFor,
    setAssessmentField,
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
  Target: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /></svg>,
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
function DayRow({ day, isToday, status, onClick, editMode, onMoveUp, onMoveDown, canUp, canDown, onDelete }) {
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
          {onDelete && !isRest && (
            <button className="reorder-btn delete-btn" onClick={onDelete} aria-label="Remove session" title="Convert to rest">
              ×
            </button>
          )}
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
          onDone={() => { setEndModalOpen(false); onBack(); }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Edit Week modal
// ============================================================================
// Session types the user can manually add via the EditWeekModal picker.
// Order matches the priority a typical week reads top-to-bottom.
const ADDABLE_SESSION_TYPES = ['limit', 'volume', 'tech', 'homeA', 'homeB'];

function EditWeekModal({ weekNumber, store, onClose }) {
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

  const swap = (i, j) => {
    if (j < 0 || j >= 7) return;
    const next = [...pattern];
    [next[i], next[j]] = [next[j], next[i]];
    setPattern(next);
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
            <button className={localCadence === '3day' ? 'on' : ''} onClick={() => applyCadence('3day')}>3 climbs</button>
            <button className={localCadence === '2day' ? 'on' : ''} onClick={() => applyCadence('2day')}>2 climbs</button>
          </div>
        </div>

        <div className="section-head" style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: 14 }}>Day order</h3>
          <span className="section-sub tiny">use ↑ ↓ to swap · × to remove</span>
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
                onDelete={() => removeAt(i)}
              />
            );
          })}
        </div>

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

  // Partial sessions count toward "done" totals — completed work is completed work.
  const isCompleted = (status) => status === 'done' || status === 'partial';

  const weekSessions = week.filter(d => d.sessionType !== 'rest');
  const weekDone = weekSessions.filter(d => isCompleted(store.getSessionStatus(d.weekNumber, d.dayIndex, d.session.exercises))).length;

  const allSessions = useMemo(() => getAllSessions(store.cadenceFor, store.patternFor), [store.state]);
  const totalDone = allSessions.filter(s => s.sessionType !== 'rest' && isCompleted(store.getSessionStatus(s.weekNumber, s.dayIndex, s.session.exercises))).length;
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
          const done = sessionsThisWeek.filter(d => {
            const st = store.getSessionStatus(w, d.dayIndex, d.session.exercises);
            return st === 'done' || st === 'partial';
          }).length;
          const customized = store.state.weekCadence[w] || store.state.weekPattern[w];
          return (
            <button
              key={w}
              data-week={w}
              className={`week-chip ${w === activeWeek ? 'active' : ''} ${w === pos.weekNumber ? 'current' : ''} ${m.isDeload ? 'deload' : ''} ${m.isTaper ? 'taper' : ''} ${customized ? 'custom' : ''}`}
              style={{ '--phase-accent': m.phase.accent }}
              onClick={() => setActiveWeek(w)}
            >
              <div className="week-chip-phase-bar" />
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
// Stacked bar chart — one bar per week, stacked by skill category.
// Y-axis auto-scales to the tallest bar. Legend below in HTML so it wraps.
// ============================================================================
function StackedBarChart({ countsByWeek, currentWeek }) {
  // countsByWeek: array of 16, each = { [skillId]: count }
  const cats = SKILL_ORDER;
  const width = 340;
  const height = 220;
  const padding = { top: 10, right: 6, bottom: 28, left: 24 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const numBars = 16;
  const barGap = 2;
  const barW = (chartW - barGap * (numBars - 1)) / numBars;

  // Per-week totals (used for y-scale + above-bar labels)
  const totals = countsByWeek.map(w => cats.reduce((s, c) => s + (w[c] || 0), 0));
  const rawMax = Math.max(1, ...totals);

  // Pick a "nice" y-axis max that grows with progress.
  const niceMax = (() => {
    if (rawMax <= 2) return 2;
    if (rawMax <= 5) return 5;
    if (rawMax <= 10) return 10;
    if (rawMax <= 20) return 20;
    if (rawMax <= 30) return 30;
    if (rawMax <= 50) return Math.ceil(rawMax / 5) * 5;
    return Math.ceil(rawMax / 10) * 10;
  })();

  const tickCount = niceMax <= 5 ? niceMax : 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const v = (niceMax / tickCount) * i;
    return Math.round(v * 10) / 10;
  });

  const yFor = (v) => padding.top + chartH - (v / niceMax) * chartH;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* gridlines + y-axis labels */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={padding.left} x2={width - padding.right} y1={yFor(t)} y2={yFor(t)} stroke="#25252b" strokeDasharray={t === 0 ? '' : '2,3'} />
          <text x={padding.left - 4} y={yFor(t) + 3} fill="#6b675f" fontSize="9" textAnchor="end">
            {Number.isInteger(t) ? t : t.toFixed(1)}
          </text>
        </g>
      ))}

      {/* bars (one per week) */}
      {countsByWeek.map((counts, w) => {
        const x = padding.left + w * (barW + barGap);
        let yCursor = yFor(0);
        const isCurrent = (w + 1) === currentWeek;
        return (
          <g key={w}>
            {/* current-week background highlight */}
            {isCurrent && totals[w] === 0 && (
              <rect x={x - 0.5} y={padding.top} width={barW + 1} height={chartH}
                fill="rgba(194,168,120,0.06)" rx="2" />
            )}

            {/* stacked segments */}
            {cats.map(cat => {
              const v = counts[cat] || 0;
              if (v === 0) return null;
              const h = (v / niceMax) * chartH;
              const y = yCursor - h;
              yCursor = y;
              return (
                <rect
                  key={cat}
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  fill={SKILL_CATEGORIES[cat].color}
                />
              );
            })}

            {/* current-week indicator dot above bar */}
            {isCurrent && (
              <circle cx={x + barW / 2} cy={padding.top + 4} r="2" fill="#c2a878" />
            )}

            {/* x-axis label — show every other week to avoid spillover */}
            {((w + 1) % 2 === 1) && (
              <text
                x={x + barW / 2}
                y={height - padding.bottom + 12}
                fill={isCurrent ? '#c2a878' : '#6b675f'}
                fontSize="9"
                fontWeight={isCurrent ? '700' : '500'}
                textAnchor="middle"
              >
                {w + 1}
              </text>
            )}
          </g>
        );
      })}

      {/* x-axis sub-label */}
      <text
        x={(padding.left + (width - padding.right)) / 2}
        y={height - 4}
        fill="#6b675f"
        fontSize="8.5"
        fontWeight="700"
        textAnchor="middle"
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        Week · 1 – 16
      </text>
    </svg>
  );
}

function StackedBarLegend() {
  return (
    <div className="bar-legend">
      {SKILL_ORDER.map(c => (
        <span key={c} className="bar-legend-item">
          <span className="bar-legend-swatch" style={{ background: SKILL_CATEGORIES[c].color }} />
          {SKILL_CATEGORIES[c].short}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// Progress view
// ============================================================================
function ProgressView({ store, openSettings }) {
  const today = todayISO();
  const pos = getPlanPosition(today);

  const allSessions = useMemo(() => getAllSessions(store.cadenceFor, store.patternFor), [store.state]);
  // Partial sessions are counted as done — work completed is work completed.
  // Heatmap continues to distinguish partial visually via its own status logic.
  const completedCount = allSessions.filter(s => {
    if (s.sessionType === 'rest') return false;
    const st = store.getSessionStatus(s.weekNumber, s.dayIndex, s.session.exercises);
    return st === 'done' || st === 'partial';
  }).length;
  const totalSessions = allSessions.filter(s => s.sessionType !== 'rest').length;
  const overallPct = totalSessions ? Math.round((completedCount / totalSessions) * 100) : 0;

  // Stacked bar chart counts: one entry per week (1–16), each is {skillId: count}.
  // Each ticked exercise contributes 1, scaled by actualMinutes/plannedMinutes if the session was logged.
  const countsByWeek = useMemo(() => {
    const weeks = Array.from({ length: 16 }, () => {
      const obj = {};
      SKILL_ORDER.forEach(s => { obj[s] = 0; });
      return obj;
    });
    allSessions.forEach(s => {
      if (s.sessionType === 'rest') return;
      const log = store.sessionLogFor(s.weekNumber, s.dayIndex);
      const ratio = log && log.endedAt && log.plannedMinutes > 0
        ? Math.max(0.1, Math.min(2, (log.actualMinutes || 0) / log.plannedMinutes))
        : 1;
      s.session.exercises.forEach(ex => {
        if (store.isExerciseDone(s.weekNumber, s.dayIndex, ex.id)) {
          weeks[s.weekNumber - 1][ex.category] += ratio;
        }
      });
    });
    weeks.forEach(w => {
      SKILL_ORDER.forEach(s => { w[s] = Math.round(w[s] * 10) / 10; });
    });
    return weeks;
  }, [store.state]);

  // Heatmap
  const heatmap = useMemo(() => {
    const rows = [];
    for (let w = 1; w <= 16; w++) {
      const week = getWeekSchedule(w, store.cadenceFor(w), store.patternFor(w));
      rows.push(week.map((d, i) => {
        const status = d.sessionType !== 'rest' ? store.getSessionStatus(w, i, d.session.exercises) : 'planned';
        const log = store.sessionLogFor(w, i);
        return {
          weekNumber: w,
          dayIndex: i,
          sessionType: d.sessionType,
          sessionName: d.session.name,
          accent: d.session.accent,
          status,
          deload: d.isDeload,
          isToday: w === pos.weekNumber && i === pos.dayIndex,
          effort: log?.effort || 0,
          difficulty: log?.difficulty || 0,
          log,
        };
      }));
    }
    return rows;
  }, [store.state, pos.weekNumber, pos.dayIndex]);

  const [cellModal, setCellModal] = useState(null);

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

      <div className="stats stats-2">
        <div className="stat">
          <div className="stat-label">Done</div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-sub">of {totalSessions}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Complete</div>
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-sub">overall</div>
        </div>
      </div>

      <div className="section-head">
        <h3>Weekly load</h3>
        <span className="section-sub">stacked by skill · scale grows</span>
      </div>
      <div className="card">
        <StackedBarChart countsByWeek={countsByWeek} currentWeek={pos.weekNumber} />
        <StackedBarLegend />
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
              {row.map((cell, d) => {
                const showEffort = cell.status === 'done' && cell.effort > 0;
                const clickable = cell.sessionType !== 'rest' && !!cell.log;
                const Tag = clickable ? 'button' : 'div';
                return (
                  <Tag
                    key={d}
                    type={clickable ? 'button' : undefined}
                    className={`hm-cell ${cell.sessionType === 'rest' ? 'rest' : ''} ${cell.status === 'done' ? 'done' : ''} ${cell.status === 'partial' ? 'partial' : ''} ${cell.deload ? 'deload' : ''} ${cell.isToday ? 'today' : ''} ${clickable ? 'clickable' : ''}`}
                    title={`Week ${w + 1}, Day ${d + 1}`}
                    style={cell.status === 'done' || cell.status === 'partial' || cell.sessionType === 'rest' ? null : { borderColor: `${cell.accent}55` }}
                    onClick={clickable ? () => setCellModal(cell) : undefined}
                  >
                    {showEffort ? cell.effort : ''}
                  </Tag>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="hm-legend">
          <span><span className="sw" style={{ background: 'var(--moss)' }} /> done</span>
          <span><span className="sw partial-sw" /> partial</span>
          <span><span className="sw" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }} /> planned</span>
          <span><span className="sw" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', opacity: 0.35 }} /> rest</span>
          <span><span className="sw" style={{ border: '2px solid var(--accent)', background: 'transparent' }} /> today</span>
          <span className="hm-legend-hint tiny muted">tap a logged day for details</span>
        </div>
      </div>

      {cellModal && (
        <HeatmapCellModal cell={cellModal} onClose={() => setCellModal(null)} />
      )}
    </div>
  );
}

// ============================================================================
// Heatmap cell detail modal — shown when a logged day is tapped.
// ============================================================================
function HeatmapCellModal({ cell, onClose }) {
  const startDate = addDays(PLAN_START_DATE, (cell.weekNumber - 1) * 7 + cell.dayIndex);
  const dateLabel = formatDateLong(startDate);

  const renderRating = (value) => {
    if (!value) return <span className="muted">—</span>;
    return (
      <span className="rating-pips">
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} className={`rating-pip ${value >= n ? 'on' : ''}`} />
        ))}
        <span className="tiny muted" style={{ marginLeft: 6 }}>{value}/5</span>
      </span>
    );
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-narrow" onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: 4 }}>{cell.sessionName}</h3>
        <div className="tiny muted" style={{ marginBottom: 16 }}>{dateLabel} · Week {cell.weekNumber}</div>

        <div className="cell-detail-row">
          <span className="cell-detail-label">Effort</span>
          {renderRating(cell.effort)}
        </div>
        <div className="cell-detail-row">
          <span className="cell-detail-label">Difficulty</span>
          {renderRating(cell.difficulty)}
        </div>

        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ============================================================================
// Notes view — chronological diary of session notes.
// ============================================================================
function NotesView({ store, openSession, openSettings }) {
  // Build a chronological list of every session log that has notes content.
  // For each entry we resolve the session name and date so the row can stand
  // on its own.
  const entries = useMemo(() => {
    const out = [];
    const logs = store.state.sessionLog || {};
    Object.entries(logs).forEach(([key, log]) => {
      if (!log || !log.notes || !log.notes.trim()) return;
      const m = /^w(\d+)_d(\d+)$/.exec(key);
      if (!m) return;
      const weekNumber = Number(m[1]);
      const dayIndex = Number(m[2]);
      const day = getWeekSchedule(weekNumber, store.cadenceFor(weekNumber), store.patternFor(weekNumber))[dayIndex];
      if (!day) return;
      const dateISO = addDays(PLAN_START_DATE, (weekNumber - 1) * 7 + dayIndex);
      out.push({
        key,
        weekNumber,
        dayIndex,
        day,
        sessionName: day.session.name,
        accent: day.session.accent,
        notes: log.notes,
        effort: log.effort || 0,
        difficulty: log.difficulty || 0,
        endedAt: log.endedAt || null,
        dateISO,
      });
    });
    // Sort most-recent first. Prefer endedAt when present; otherwise fall back
    // to the planned date so notes saved mid-session still appear in order.
    out.sort((a, b) => {
      const aT = a.endedAt ? new Date(a.endedAt).getTime() : new Date(a.dateISO + 'T00:00:00').getTime();
      const bT = b.endedAt ? new Date(b.endedAt).getTime() : new Date(b.dateISO + 'T00:00:00').getTime();
      return bT - aT;
    });
    return out;
  }, [store.state]);

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Session diary</div>
          <h1>Notes</h1>
        </div>
        <button className="cog" onClick={openSettings} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="card muted" style={{ textAlign: 'center', padding: 28, marginTop: 14 }}>
          <div style={{ marginBottom: 6, fontWeight: 600 }}>No notes yet.</div>
          <div className="tiny">Write something in the Notes field on any session and it'll appear here.</div>
        </div>
      ) : (
        <div className="diary-list">
          {entries.map(e => (
            <button
              key={e.key}
              className="diary-entry"
              onClick={() => openSession(e.day)}
            >
              <div className="diary-bar" style={{ background: e.accent }} />
              <div className="diary-body">
                <div className="diary-head">
                  <div className="diary-session">{e.sessionName}</div>
                  <div className="diary-date tiny muted">{formatDateShort(e.dateISO)} · Wk {e.weekNumber}</div>
                </div>
                <div className="diary-notes">{e.notes}</div>
                {(e.effort > 0 || e.difficulty > 0) && (
                  <div className="diary-meta tiny muted">
                    {e.effort > 0 && <span>Effort {e.effort}/5</span>}
                    {e.effort > 0 && e.difficulty > 0 && <span> · </span>}
                    {e.difficulty > 0 && <span>Difficulty {e.difficulty}/5</span>}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Assessments view — 10 standardised tests, Week 1 baseline + Week 16 retest.
// ============================================================================
function AssessmentsView({ store, openSettings }) {
  const [expanded, setExpanded] = useState(null);
  const filled = ASSESSMENTS.filter(a => {
    const v = store.assessmentFor(a.id);
    return v.baseline || v.retest;
  }).length;

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Baseline · Retest</div>
          <h1>Assessments</h1>
        </div>
        <button className="cog" onClick={openSettings} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="tiny muted" style={{ marginBottom: 6 }}>
          Run all 10 tests in <strong>Week 1</strong> before training, and again in <strong>Week 16</strong> after two full rest days. Same order each time.
        </div>
        <div className="tiny muted">
          {filled}/{ASSESSMENTS.length} recorded
        </div>
      </div>

      <div className="assessment-list">
        {ASSESSMENTS.map(a => {
          const v = store.assessmentFor(a.id);
          const isOpen = expanded === a.id;
          return (
            <div key={a.id} className="card assessment-card" style={{ marginBottom: 10 }}>
              <button
                className="assessment-head"
                onClick={() => setExpanded(isOpen ? null : a.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', color: 'inherit' }}
              >
                <div className="assessment-num" style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                  {a.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                  <div className="tiny muted" style={{ marginTop: 2 }}>{a.why}</div>
                </div>
                <Icon.ChevronDown style={{ width: 16, height: 16, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
              </button>

              {isOpen && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div className="tiny" style={{ marginBottom: 8 }}>
                    <strong>Equipment:</strong> <span className="muted">{a.equipment}</span>
                  </div>
                  <div className="tiny" style={{ marginBottom: 8 }}>
                    <strong>Protocol:</strong> <span className="muted">{a.protocol}</span>
                  </div>
                  <div className="tiny" style={{ marginBottom: 12 }}>
                    <strong>Scoring:</strong> <span className="muted">{a.scoring}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label className="assessment-field">
                      <div className="tiny muted" style={{ marginBottom: 4 }}>Week 1 baseline</div>
                      <input
                        type="text"
                        value={v.baseline}
                        placeholder={a.unit}
                        onChange={e => store.setAssessmentField(a.id, 'baseline', e.target.value)}
                        className="assessment-input"
                      />
                    </label>
                    <label className="assessment-field">
                      <div className="tiny muted" style={{ marginBottom: 4 }}>Week 16 retest</div>
                      <input
                        type="text"
                        value={v.retest}
                        placeholder={a.unit}
                        onChange={e => store.setAssessmentField(a.id, 'retest', e.target.value)}
                        className="assessment-input"
                      />
                    </label>
                  </div>
                  <label className="assessment-field" style={{ marginTop: 10, display: 'block' }}>
                    <div className="tiny muted" style={{ marginBottom: 4 }}>Notes (optional)</div>
                    <input
                      type="text"
                      value={v.notes}
                      onChange={e => store.setAssessmentField(a.id, 'notes', e.target.value)}
                      className="assessment-input"
                      placeholder="e.g. bent-knee L-sit"
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
              {store.state.cadence === '3day' ? 'Mon · Wed · Fri climbs · Tue + Sat home' : 'Mon · Thu climbs · Tue + Fri home'}
              {customized ? ` · ${customized} week${customized > 1 ? 's' : ''} customised` : ''}
            </div>
          </div>
          <div className="segmented">
            <button className={store.state.cadence === '3day' ? 'on' : ''} onClick={() => store.setGlobalCadence('3day')}>3 climbs</button>
            <button className={store.state.cadence === '2day' ? 'on' : ''} onClick={() => store.setGlobalCadence('2day')}>2 climbs</button>
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
    { id: 'assess', label: 'Tests', icon: Icon.Target },
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

  // Tab the user was on when they opened a session — restored on back.
  const prevViewRef = useRef('home');

  const openSession = (day) => { prevViewRef.current = view; setSelectedDay(day); };
  const closeSession = () => { setView(prevViewRef.current); setSelectedDay(null); };
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
        <SessionDetail day={dayForRender} store={store} onBack={closeSession} />
      ) : view === 'home' ? (
        <HomeView store={store} openSession={openSession} openSettings={openSettings} />
      ) : view === 'schedule' ? (
        <ScheduleView store={store} openSession={openSession} openSettings={openSettings} />
      ) : view === 'progress' ? (
        <ProgressView store={store} openSettings={openSettings} />
      ) : view === 'assess' ? (
        <AssessmentsView store={store} openSettings={openSettings} />
      ) : (
        <NotesView store={store} openSession={openSession} openSettings={openSettings} />
      )}

      <TabBar view={view} setView={handleSetView} />

      {settingsOpen && <SettingsModal store={store} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
