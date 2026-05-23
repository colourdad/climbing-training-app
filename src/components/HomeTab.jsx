// ============================================================================
// HomeTab — Block Hero redesign (Direction B).
// Full-bleed coloured hero: coral for session days, moss for rest days.
// ============================================================================

import { getPlanPosition, todayISO } from '../data/sessions.js';
import { getWeekSchedule, getWeekMeta } from '../services/planGenerator.js';

// Chips per session type — editorial labels derived from session id
const SESSION_CHIPS = {
  limit:     ['Power', 'Project', 'Wall'],
  volume:    ['Endurance', 'Volume', 'Wall'],
  homeA:     ['Prehab', 'Pulling', 'Home'],
  homeB:     ['Core', 'Mobility', 'Home'],
  tech:      ['Technique', 'Wall'],
  testing:   ['Assessment', 'Wall'],
  lightHome: ['Deload', 'Home'],
};

// Button label for the session CTA
function ctaLabel(status) {
  if (status === 'done')    return 'View session';
  if (status === 'partial') return 'Continue';
  return 'Start session';
}

// "SAT 23 MAY" from an ISO date string
function heroDateLabel(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
}

// "17–23 MAY" week range
function weekRangeLabel(startISO, endISO) {
  const s = new Date(startISO + 'T00:00:00');
  const e = new Date(endISO + 'T00:00:00');
  const monthStr = e.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  return `${s.getDate()}–${e.getDate()} ${monthStr}`;
}

// Inline check SVG for done rows
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12">
      <path d="M2 6 L5 9 L10 3" stroke="#FFF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeDayRow({ day, isToday, status, onClick }) {
  const isRest = day.sessionType === 'rest';
  const stripeColor = isRest ? 'var(--moss)' : 'var(--accent)';
  const isDone = status === 'done';

  const rowClass = [
    'home-day-row',
    isToday  ? 'is-today' : '',
    isRest   ? 'is-rest'  : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={rowClass} onClick={isRest ? undefined : onClick} disabled={isRest}>
      <div className="home-day-stripe" style={{ background: stripeColor }} />
      <div className="home-day-dow">{day.dayLabel}</div>
      <div className="home-day-body">
        <div className="home-day-name">{day.session.name}</div>
        <div className="home-day-meta">
          {isRest ? 'Recovery' : `${day.session.duration} · ${day.session.location}`}
        </div>
      </div>
      <div className="home-day-trailing">
        {isToday && <span className="home-today-pill">Today</span>}
        {!isToday && isDone && (
          <div className="home-day-check"><CheckIcon /></div>
        )}
      </div>
    </button>
  );
}

export function HomeTab({ store, openSession, openSettings }) {
  const today = todayISO();
  const pos = getPlanPosition(today, store.planStartDate);
  const week = getWeekSchedule(pos.weekNumber, store.cadenceFor(pos.weekNumber), store.patternFor(pos.weekNumber));
  const todayDay = week[pos.dayIndex];
  const meta = getWeekMeta(pos.weekNumber, store.planStartDate);
  const phase = meta.phase;

  const isRestDay = todayDay?.sessionType === 'rest';

  const todayStatus = todayDay && !isRestDay
    ? store.getSessionStatus(todayDay.weekNumber, todayDay.dayIndex, todayDay.session.exercises)
    : null;

  // Hero colours
  const heroColor     = isRestDay ? 'var(--moss)'      : 'var(--accent)';
  const heroColorDark = isRestDay ? 'var(--moss-dark)'  : 'var(--accent-dark)';

  // Phase progress within current phase
  const phaseWeekNum   = pos.weekNumber - phase.weeks[0] + 1;
  const phaseTotalWeeks = phase.weeks.length;
  const phasePct       = Math.round((phaseWeekNum / phaseTotalWeeks) * 100);

  // Hero content
  const todayLabel = heroDateLabel(today);
  const heroTitle  = isRestDay ? 'Rest.' : (todayDay?.session.name ?? 'Session') + '.';
  const heroSubtitle = isRestDay
    ? 'Active recovery — walk, mobility, gentle stretching.'
    : todayDay ? `${todayDay.session.duration} · ${todayDay.session.location}` : '';
  const chips = !isRestDay && todayDay ? (SESSION_CHIPS[todayDay.session.id] ?? []) : [];

  const weekRange = weekRangeLabel(meta.startDate, meta.endDate);

  return (
    <div className="home-view">
      {/* Hero — natural height, clips diagonally at bottom */}
      <div className="home-hero-wrapper" style={{ background: heroColor }}>
        <div
          className="home-hero-overlay"
          style={{ background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${heroColorDark} 20%, transparent) 100%)` }}
        />

        {/* Masthead */}
        <div className="home-masthead">
          <div>
            <div className="home-masthead-eyebrow">
              Week {pos.weekNumber} of 16 · {phase.name}
            </div>
            <div className="home-wordmark">Send</div>
          </div>
          <button className="home-hero-gear" onClick={openSettings} aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06A2 2 0 1 1 4.11 16.92l.06-.06A1.7 1.7 0 0 0 4.51 15 1.7 1.7 0 0 0 2.95 14H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.89a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>

        {/* Today block */}
        <div className="home-today">
          <div className="home-today-eyebrow">
            <span className="home-today-dot" />
            Today · {todayLabel}
          </div>
          <h2 className={`home-today-headline ${isRestDay ? 'rest' : 'session'}`}>
            {heroTitle}
          </h2>
          <p className="home-today-subtitle">{heroSubtitle}</p>

          {chips.length > 0 && (
            <div className="home-chips">
              {chips.map(c => <span key={c} className="home-chip">{c}</span>)}
            </div>
          )}

          {!isRestDay && todayDay && (
            <button
              className="home-start-btn"
              style={{ color: heroColor }}
              onClick={() => openSession(todayDay)}
            >
              {ctaLabel(todayStatus)}
            </button>
          )}
        </div>
      </div>

      {/* Below-hero content */}
      <div className="home-content">
        {/* Phase progress row — matches schedule tab design */}
        <div className="home-phase-row">
          <div className="home-phase-top">
            <div className="home-phase-label">
              <span style={{ color: 'var(--accent)' }}>{phase.name}</span>
              <span style={{ color: 'var(--text-3)', fontWeight: 600 }}> · {phaseWeekNum} of {phaseTotalWeeks} weeks</span>
            </div>
            <span className="home-phase-pct">{phasePct}%</span>
          </div>
          <div className="home-phase-bar-track">
            <div className="home-phase-bar-fill" style={{ width: `${phasePct}%` }} />
          </div>
        </div>

        {/* This week */}
        <div className="home-week-head">
          <h3>This week</h3>
          <span className="home-week-date">{weekRange}</span>
        </div>
        <div className="home-day-list">
          {week.map((d, i) => (
            <HomeDayRow
              key={i}
              day={d}
              isToday={i === pos.dayIndex}
              status={d.sessionType !== 'rest'
                ? store.getSessionStatus(d.weekNumber, d.dayIndex, d.session.exercises)
                : 'planned'}
              onClick={() => openSession(d)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
