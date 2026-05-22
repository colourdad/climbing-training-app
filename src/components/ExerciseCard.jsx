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
// ExerciseTimer — countdown / countup with ±10 s nudge and beep on zero
// ----------------------------------------------------------------------------
function ExerciseTimer({ initialSec, label }) {
  const [remaining, setRemaining] = useState(initialSec);
  const [running,   setRunning]   = useState(false);
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

  const adjust = (delta) => setRemaining(r => Math.max(0, r + delta));
  const reset  = ()      => { setRunning(false); setRemaining(initialSec); };
  const start  = ()      => { if (remaining === 0) setRemaining(initialSec); setRunning(true); };
  const pause  = ()      => setRunning(false);

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
