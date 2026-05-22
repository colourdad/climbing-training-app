// ============================================================================
// HomeTab — the default landing view. Today's hero card, this-week stats,
// phase progress, and the current week's day list.
// ============================================================================

import { useMemo } from 'react';
import { getPlanPosition, todayISO, formatDateLong, formatDateShort } from '../data/sessions.js';
import { getWeekSchedule, getWeekMeta, getAllSessions } from '../services/planGenerator.js';
import { Icon } from './icons.jsx';
import { DayRow } from './DayRow.jsx';

// Partial sessions count toward "done" totals — completed work is completed work.
const isCompleted = (status) => status === 'done' || status === 'partial';

export function HomeTab({ store, openSession, openSettings }) {
  const today = todayISO();
  const pos = getPlanPosition(today);
  const week = getWeekSchedule(pos.weekNumber, store.cadenceFor(pos.weekNumber), store.patternFor(pos.weekNumber));
  const todayDay = week[pos.dayIndex];
  const meta = getWeekMeta(pos.weekNumber);
  const phase = meta.phase;

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
