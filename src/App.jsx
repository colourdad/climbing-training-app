import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PLAN_START_DATE,
  PHASES,
  SKILL_CATEGORIES,
  SKILL_ORDER,
  getPhase,
  getWeekSchedule,
  getWeekMeta,
  getAllSessions,
  getPlanPosition,
  todayISO,
  formatDateShort,
  formatDateLong,
  NOTES_CONTENT,
} from './data.js';

// ============================================================================
// localStorage hook
// ============================================================================
const STORAGE_KEY = 'send_climbing_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

function useLocalState() {
  const [state, setState] = useState(() => {
    const loaded = loadState();
    return {
      completedSessions: loaded.completedSessions || {},
      completedExercises: loaded.completedExercises || {},
      cadence: loaded.cadence || '3day',
    };
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleSessionComplete = (weekNumber, dayIndex) => {
    const key = `w${weekNumber}_d${dayIndex}`;
    setState(s => {
      const next = { ...s.completedSessions };
      if (next[key]) delete next[key];
      else next[key] = todayISO();
      return { ...s, completedSessions: next };
    });
  };

  const toggleExerciseComplete = (weekNumber, dayIndex, exerciseId) => {
    const key = `w${weekNumber}_d${dayIndex}_${exerciseId}`;
    setState(s => {
      const next = { ...s.completedExercises };
      if (next[key]) delete next[key];
      else next[key] = true;
      return { ...s, completedExercises: next };
    });
  };

  const setCadence = (cadence) => setState(s => ({ ...s, cadence }));

  const resetAll = () => {
    setState({ completedSessions: {}, completedExercises: {}, cadence: state.cadence });
  };

  const isSessionComplete = (w, d) => !!state.completedSessions[`w${w}_d${d}`];
  const isExerciseComplete = (w, d, id) => !!state.completedExercises[`w${w}_d${d}_${id}`];

  return {
    state,
    toggleSessionComplete,
    toggleExerciseComplete,
    setCadence,
    resetAll,
    isSessionComplete,
    isExerciseComplete,
  };
}

// ============================================================================
// Icons
// ============================================================================
const Icon = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11L12 4l9 7" /><path d="M5 10v10h14V10" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  Chart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 20V8M10 20V4M16 20v-8M22 20H2" />
    </svg>
  ),
  Book: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4v16a2 2 0 0 0 2 2h14" /><path d="M20 22V4H6a2 2 0 0 0-2 2v0" /><path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  Cog: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
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
// Day row
// ============================================================================
function DayRow({ day, isToday, isComplete, onClick }) {
  const isRest = day.sessionType === 'rest';
  return (
    <button
      className={`day-row ${isRest ? 'rest' : ''} ${isComplete ? 'complete' : ''} ${isToday ? 'is-today' : ''}`}
      onClick={onClick}
    >
      <div className="day-dow">{day.dayLabel}</div>
      <div className="day-bar" style={{ background: isRest ? '#26262a' : day.session.accent }} />
      <div className="day-body">
        <div className="day-name">{day.session.name}</div>
        <div className="day-meta">
          {isRest ? 'Recovery' : `${day.session.duration} · ${day.session.location}`}
        </div>
      </div>
      {!isRest && (
        <div className={`day-check ${isComplete ? 'checked' : ''}`} aria-hidden>
          {isComplete && <Icon.Check style={{ width: 14, height: 14 }} />}
        </div>
      )}
    </button>
  );
}

// ============================================================================
// Home view
// ============================================================================
function HomeView({ store, openSession }) {
  const today = todayISO();
  const pos = getPlanPosition(today);
  const week = getWeekSchedule(pos.weekNumber, store.state.cadence);
  const todayDay = week[pos.dayIndex];
  const meta = getWeekMeta(pos.weekNumber);
  const phase = meta.phase;

  // Sessions this week
  const weekSessions = week.filter(d => d.sessionType !== 'rest');
  const weekCompleted = weekSessions.filter(d => store.isSessionComplete(d.weekNumber, d.dayIndex)).length;

  // Overall completion
  const allSessions = getAllSessions(store.state.cadence);
  const totalCompleted = allSessions.filter(s => store.isSessionComplete(s.weekNumber, s.dayIndex)).length;
  const overallPct = Math.round((totalCompleted / allSessions.length) * 100);

  const isTodayComplete = todayDay && todayDay.sessionType !== 'rest'
    ? store.isSessionComplete(todayDay.weekNumber, todayDay.dayIndex) : false;
  const isRestDay = todayDay?.sessionType === 'rest';

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Week {pos.weekNumber} of 16 · {phase.name}</div>
          <h1>Send</h1>
        </div>
        <button className="cog" onClick={() => store.openSettings()} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Hero */}
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
              className={`hero-cta ${isTodayComplete ? 'muted' : ''}`}
              onClick={() => openSession(todayDay)}
            >
              {isTodayComplete ? 'View session' : 'Open session'}
            </button>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-label">This week</div>
          <div className="stat-value">{weekCompleted}/{weekSessions.length}</div>
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

      {/* Phase progress */}
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

      {/* Rest of week */}
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
            isComplete={d.sessionType !== 'rest' && store.isSessionComplete(d.weekNumber, d.dayIndex)}
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
function ScheduleView({ store, openSession }) {
  const today = todayISO();
  const pos = getPlanPosition(today);
  const [activeWeek, setActiveWeek] = useState(pos.weekNumber);
  const week = getWeekSchedule(activeWeek, store.state.cadence);
  const meta = getWeekMeta(activeWeek);
  const phase = meta.phase;
  const stripRef = useRef(null);

  // Center current week in strip
  useEffect(() => {
    if (!stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-week="${activeWeek}"]`);
    if (el) {
      el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [activeWeek]);

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">{phase.name} · {meta.tag || 'Build'}</div>
          <h1>Schedule</h1>
        </div>
        <button className="cog" onClick={() => store.openSettings()} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div ref={stripRef} className="week-strip">
        {Array.from({ length: 16 }, (_, i) => i + 1).map(w => {
          const m = getWeekMeta(w);
          const sessionsThisWeek = getWeekSchedule(w, store.state.cadence).filter(d => d.sessionType !== 'rest');
          const done = sessionsThisWeek.filter(d => store.isSessionComplete(w, d.dayIndex)).length;
          return (
            <button
              key={w}
              data-week={w}
              className={`week-chip ${w === activeWeek ? 'active' : ''} ${w === pos.weekNumber ? 'current' : ''} ${m.isDeload ? 'deload' : ''} ${m.isTaper ? 'taper' : ''}`}
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
            </div>
          </div>
          {meta.tag && (
            <span className="phase-pill" style={{ background: `${phase.accent}24`, color: phase.accent }}>
              {meta.tag}
            </span>
          )}
        </div>
        {meta.isDeload && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
            Cut climbing volume ~40%. Maintain home training. Adaptation happens during recovery.
          </div>
        )}
        {meta.isTaper && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
            Taper: half volume, keep intensity. Arrive at outdoor season fresh.
          </div>
        )}
      </div>

      <div className="day-list">
        {week.map((d, i) => (
          <DayRow
            key={i}
            day={d}
            isToday={activeWeek === pos.weekNumber && i === pos.dayIndex}
            isComplete={d.sessionType !== 'rest' && store.isSessionComplete(d.weekNumber, d.dayIndex)}
            onClick={() => openSession(d)}
          />
        ))}
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
  const sessionComplete = !isRest && store.isSessionComplete(weekNumber, dayIndex);
  const startDate = meta.startDate;
  // compute exact date for this day
  const dayDate = (() => {
    const d = new Date(startDate + 'T00:00:00');
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
      </div>

      <div className="exercise-list">
        {session.exercises.map(ex => {
          const done = !isRest && store.isExerciseComplete(weekNumber, dayIndex, ex.id);
          return (
            <button
              key={ex.id}
              className={`exercise ${done ? 'done' : ''}`}
              onClick={() => !isRest && store.toggleExerciseComplete(weekNumber, dayIndex, ex.id)}
              disabled={isRest}
            >
              <div className={`exercise-tick ${done ? 'done' : ''}`}>
                {done && <Icon.Check style={{ width: 14, height: 14 }} />}
              </div>
              <div className="exercise-body">
                <div className="exercise-row">
                  <span className="exercise-name">{ex.name}</span>
                  <span className="exercise-meta">{ex.sets}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                  <SkillPill categoryId={ex.category} compact />
                  {ex.rest && ex.rest !== '—' && (
                    <span className="tiny muted">Rest {ex.rest}</span>
                  )}
                </div>
                {ex.notes && <div className="exercise-notes">{ex.notes}</div>}
                {ex.progression && (
                  <div className="exercise-prog">
                    <strong>Progression · </strong>{ex.progression}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!isRest && (
        <button
          className={`complete-btn ${sessionComplete ? 'done' : ''}`}
          onClick={() => store.toggleSessionComplete(weekNumber, dayIndex)}
        >
          {sessionComplete ? '✓ Session complete' : 'Mark session complete'}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Radar chart (SVG)
// ============================================================================
function RadarChart({ scores }) {
  // scores: { categoryId: 0..1 }
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const cats = SKILL_ORDER;
  const n = cats.length;
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const point = (i, r) => {
    const a = angle(i);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const polygon = cats.map((c, i) => {
    const v = Math.min(1, Math.max(0, scores[c] || 0));
    const [x, y] = point(i, radius * v);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* rings */}
      {rings.map(r => (
        <polygon
          key={r}
          points={cats.map((_, i) => {
            const [x, y] = point(i, radius * r);
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="#25252b"
          strokeWidth="1"
        />
      ))}
      {/* spokes */}
      {cats.map((_, i) => {
        const [x, y] = point(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1f1f24" strokeWidth="1" />;
      })}
      {/* data polygon */}
      <polygon
        points={polygon}
        fill="rgba(194, 168, 120, 0.22)"
        stroke="#c2a878"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* data dots */}
      {cats.map((c, i) => {
        const v = Math.min(1, Math.max(0, scores[c] || 0));
        const [x, y] = point(i, radius * v);
        return <circle key={c} cx={x} cy={y} r="3.5" fill={SKILL_CATEGORIES[c].color} />;
      })}
      {/* labels */}
      {cats.map((c, i) => {
        const [x, y] = point(i, radius + 22);
        const label = SKILL_CATEGORIES[c].short;
        return (
          <text
            key={c}
            x={x}
            y={y}
            fill="#a8a39a"
            fontSize="10.5"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ============================================================================
// Progress view
// ============================================================================
function ProgressView({ store }) {
  const today = todayISO();
  const pos = getPlanPosition(today);

  // Compute totals
  const allSessions = useMemo(() => getAllSessions(store.state.cadence), [store.state.cadence]);

  // Completed sessions total
  const completedCount = allSessions.filter(s => store.isSessionComplete(s.weekNumber, s.dayIndex)).length;
  const overallPct = Math.round((completedCount / allSessions.length) * 100);

  // Per-phase progress
  const phaseStats = PHASES.map(phase => {
    const phaseSessions = allSessions.filter(s => phase.weeks.includes(s.weekNumber));
    const done = phaseSessions.filter(s => store.isSessionComplete(s.weekNumber, s.dayIndex)).length;
    return {
      ...phase,
      done,
      total: phaseSessions.length,
      pct: phaseSessions.length ? (done / phaseSessions.length) * 100 : 0,
    };
  });

  // Skill balance — sum exercises completed per category
  // Normalised by max possible per category across plan
  const skillScores = useMemo(() => {
    const possible = {};
    const done = {};
    SKILL_ORDER.forEach(s => { possible[s] = 0; done[s] = 0; });
    allSessions.forEach(s => {
      s.session.exercises.forEach(ex => {
        possible[ex.category] += 1;
        if (store.isExerciseComplete(s.weekNumber, s.dayIndex, ex.id)) {
          done[ex.category] += 1;
        }
      });
    });
    const out = {};
    SKILL_ORDER.forEach(s => {
      out[s] = possible[s] ? done[s] / possible[s] : 0;
    });
    return out;
  }, [store.state.completedExercises, allSessions]);

  // Heatmap: 16 rows x 7 cols
  const heatmap = useMemo(() => {
    const rows = [];
    for (let w = 1; w <= 16; w++) {
      const week = getWeekSchedule(w, store.state.cadence);
      rows.push(week.map((d, i) => ({
        sessionType: d.sessionType,
        accent: d.session.accent,
        done: d.sessionType !== 'rest' && store.isSessionComplete(w, i),
        deload: d.isDeload,
        isToday: w === pos.weekNumber && i === pos.dayIndex,
      })));
    }
    return rows;
  }, [store.state.completedSessions, store.state.cadence, pos.weekNumber, pos.dayIndex]);

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Real-time</div>
          <h1>Progress</h1>
        </div>
        <button className="cog" onClick={() => store.openSettings()} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Sessions</div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-sub">of {allSessions.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Complete</div>
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-sub">overall</div>
        </div>
        <div className="stat">
          <div className="stat-label">Current</div>
          <div className="stat-value">W{pos.weekNumber}</div>
          <div className="stat-sub">of 16</div>
        </div>
      </div>

      <div className="section-head">
        <h3>Training balance</h3>
        <span className="section-sub">% of work done per skill</span>
      </div>
      <div className="card" style={{ paddingBottom: 8 }}>
        <div className="radar-wrap">
          <RadarChart scores={skillScores} />
        </div>
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
                  className={`hm-cell ${cell.sessionType === 'rest' ? 'rest' : ''} ${cell.done ? 'done' : ''} ${cell.deload ? 'deload' : ''} ${cell.isToday ? 'today' : ''}`}
                  title={`Week ${w + 1}, Day ${d + 1}`}
                  style={cell.done ? null : (cell.sessionType !== 'rest' ? { borderColor: `${cell.accent}55` } : null)}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11, color: 'var(--text-2)', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, background: 'var(--moss)', borderRadius: 3 }} /> done
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 3 }} /> planned
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 3, opacity: 0.35 }} /> rest
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, border: '2px solid var(--accent)', borderRadius: 3 }} /> today
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Notes view
// ============================================================================
function NotesView({ store }) {
  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">Reference</div>
          <h1>Notes</h1>
        </div>
        <button className="cog" onClick={() => store.openSettings()} aria-label="Settings">
          <Icon.Cog style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {NOTES_CONTENT.map(group => (
        <div className="note-group" key={group.id}>
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
        <span className="section-sub">Colour key</span>
      </div>
      <div className="card row-gap-6" style={{ flexWrap: 'wrap' }}>
        <div className="row-gap-6">
          {SKILL_ORDER.map(c => <SkillPill key={c} categoryId={c} />)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Settings modal
// ============================================================================
function SettingsModal({ store, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Settings</h3>
        <p>Plan starts Mon 18 May 2026. Your progress is saved on this device only.</p>

        <div className="modal-row">
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Gym cadence</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>
              {store.state.cadence === '3day' ? 'Mon · Wed · Fri gym' : 'Mon · Fri gym'}
            </div>
          </div>
          <div className="segmented">
            <button
              className={store.state.cadence === '3day' ? 'on' : ''}
              onClick={() => store.setCadence('3day')}
            >
              3 day
            </button>
            <button
              className={store.state.cadence === '2day' ? 'on' : ''}
              onClick={() => store.setCadence('2day')}
            >
              2 day
            </button>
          </div>
        </div>

        <button
          className="modal-danger"
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) {
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
          <button
            key={t.id}
            className={`tab ${view === t.id ? 'active' : ''}`}
            onClick={() => setView(t.id)}
          >
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
  const local = useLocalState();
  const [view, setView] = useState('home');
  const [selectedDay, setSelectedDay] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const store = {
    ...local,
    openSettings: () => setSettingsOpen(true),
  };

  const openSession = (day) => {
    setSelectedDay(day);
  };

  const handleSetView = (v) => {
    setSelectedDay(null);
    setView(v);
  };

  return (
    <div className="app">
      {selectedDay ? (
        <SessionDetail day={selectedDay} store={store} onBack={() => setSelectedDay(null)} />
      ) : view === 'home' ? (
        <HomeView store={store} openSession={openSession} />
      ) : view === 'schedule' ? (
        <ScheduleView store={store} openSession={openSession} />
      ) : view === 'progress' ? (
        <ProgressView store={store} />
      ) : (
        <NotesView store={store} />
      )}

      <TabBar view={view} setView={handleSetView} />

      {settingsOpen && <SettingsModal store={store} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
