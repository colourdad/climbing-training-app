// ============================================================================
// ExerciseCard — expandable exercise row with timer
// RatingRow    — 1–5 dot rating control (used by EndSessionModal)
// Also owns the beep() audio utility and fmtSec() formatter used by the timer.
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import { SkillPill } from './SkillPill.jsx';

// ----------------------------------------------------------------------------
// Audio: short beep when a timer reaches zero
// ----------------------------------------------------------------------------
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o   = ctx.createOscillator();
    const g   = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25,   ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    o.start();
    o.stop(ctx.currentTime + 0.6);
    setTimeout(() => ctx.close(), 700);
  } catch (e) {}
}

function fmtSec(s) {
  if (s == null || isNaN(s)) return '0:00';
  s = Math.max(0, Math.round(s));
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ----------------------------------------------------------------------------
// ExerciseTimer — prep countdown → main countdown, background-safe via wall clock
// ----------------------------------------------------------------------------
const PREP_SEC = 3;

function ExerciseTimer({ initialSec, label }) {
  // phase: 'idle' | 'prep' | 'running' | 'paused' | 'done'
  const [phase,     setPhase]     = useState('idle');
  const [remaining, setRemaining] = useState(initialSec);
  const [prepLeft,  setPrepLeft]  = useState(PREP_SEC);

  // Wall-clock end time for the current phase — survives background suspension
  const endTimeRef    = useRef(null);
  const remainingRef  = useRef(initialSec); // kept in sync with remaining state
  const tickRef       = useRef(null);

  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  function stopTick() { clearInterval(tickRef.current); tickRef.current = null; }

  // Prep phase tick
  useEffect(() => {
    if (phase !== 'prep') return;
    endTimeRef.current = Date.now() + PREP_SEC * 1000;
    setPrepLeft(PREP_SEC);
    stopTick();
    tickRef.current = setInterval(() => {
      const left = Math.ceil((endTimeRef.current - Date.now()) / 1000);
      if (left <= 0) {
        stopTick();
        setPhase('running');
      } else {
        setPrepLeft(left);
      }
    }, 100);
    return stopTick;
  }, [phase]);

  // Main running phase tick
  useEffect(() => {
    if (phase !== 'running') return;
    endTimeRef.current = Date.now() + remainingRef.current * 1000;
    stopTick();
    tickRef.current = setInterval(() => {
      const left = Math.ceil((endTimeRef.current - Date.now()) / 1000);
      if (left <= 0) {
        stopTick();
        setRemaining(0);
        setPhase('done');
        beep();
      } else {
        setRemaining(left);
      }
    }, 100);
    return stopTick;
  }, [phase]);

  // Resync from wall clock when tab regains focus
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible' || endTimeRef.current == null) return;
      const left = Math.ceil((endTimeRef.current - Date.now()) / 1000);
      if (phase === 'prep') {
        if (left <= 0) { stopTick(); setPhase('running'); }
        else setPrepLeft(left);
      } else if (phase === 'running') {
        if (left <= 0) { stopTick(); setRemaining(0); setPhase('done'); beep(); }
        else setRemaining(left);
      }
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [phase]);

  const adjust = (delta) => {
    if (phase === 'running' && endTimeRef.current != null) {
      endTimeRef.current += delta * 1000;
    }
    setRemaining(r => Math.max(0, r + delta));
  };

  const reset = () => {
    stopTick();
    endTimeRef.current = null;
    setPhase('idle');
    setRemaining(initialSec);
    setPrepLeft(PREP_SEC);
  };

  const start = () => {
    if (phase === 'paused') {
      setPhase('running'); // resume without re-prep
    } else {
      if (phase === 'done') { setRemaining(initialSec); remainingRef.current = initialSec; }
      setPhase('prep');
    }
  };

  const pause = () => {
    stopTick();
    endTimeRef.current = null;
    setPhase(phase === 'prep' ? 'idle' : 'paused');
    if (phase === 'prep') setPrepLeft(PREP_SEC);
  };

  const isActive = phase === 'prep' || phase === 'running';
  const isDone   = phase === 'done';

  const startLabel = isDone ? 'Restart' : phase === 'paused' ? 'Resume' : 'Start';

  return (
    <div className="timer">
      <div className="timer-head">
        <span className="timer-label">{label || 'Timer'}</span>
        <span className="timer-default tiny muted">default {fmtSec(initialSec)}</span>
      </div>

      {phase === 'prep' ? (
        <div className="timer-display timer-display-prep">
          <div className="timer-prep-box">
            <span className="timer-prep-label">Get ready</span>
            <span className="timer-prep-count">{prepLeft}</span>
          </div>
        </div>
      ) : (
        <div className="timer-display">
          <button className="timer-adj" onClick={() => adjust(-10)} aria-label="-10 sec">−10</button>
          <div className={`timer-time ${isDone ? 'zero' : ''}`}>{fmtSec(remaining)}</div>
          <button className="timer-adj" onClick={() => adjust(10)} aria-label="+10 sec">+10</button>
        </div>
      )}

      <div className="timer-ctrls">
        {isActive ? (
          <button className="timer-btn timer-pause" onClick={pause}>
            <Icon.Pause style={{ width: 18, height: 18 }} /> Pause
          </button>
        ) : (
          <button className="timer-btn timer-play" onClick={start}>
            <Icon.Play style={{ width: 18, height: 18 }} /> {startLabel}
          </button>
        )}
        <button className="timer-btn timer-reset" onClick={reset} aria-label="Reset">
          <Icon.Reset style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// RatingRow — 1–5 dot selector (also used by EndSessionModal in SessionView)
// ----------------------------------------------------------------------------
export function RatingRow({ label, value, onChange, sub }) {
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

// ----------------------------------------------------------------------------
// ExerciseCard — the main expandable exercise row
// ----------------------------------------------------------------------------
export function ExerciseCard({ ex, done, onToggleDone, expanded, onToggleExpand, onDragHandleTouch }) {
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
        <button
          className={`exercise-expand ${expanded ? 'open' : ''}`}
          onClick={onToggleExpand}
          aria-label="Expand"
        >
          <Icon.ChevronDown style={{ width: 18, height: 18 }} />
        </button>
        {onDragHandleTouch && (
          <div className="exercise-drag-handle drag-handle" onTouchStart={onDragHandleTouch}>
            <Icon.DragHandle style={{ width: 18, height: 18 }} />
          </div>
        )}
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
