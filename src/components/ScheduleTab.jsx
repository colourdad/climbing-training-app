// ============================================================================
// ScheduleTab — week strip + day list (week mode) or month calendar (month
// mode). Co-located helper: MonthCalendar.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { TOTAL_WEEKS, getPlanPosition, todayISO, formatDateShort } from '../data/sessions.js';
import { getWeekSchedule, getWeekMeta } from '../services/planGenerator.js';
import { PHASES } from '../data/phases.js';
import { Icon } from './icons.jsx';
import { DayRow } from './DayRow.jsx';
import { EditWeekModal } from './EditWeekModal.jsx';

// ----------------------------------------------------------------------------
// Month calendar
// ----------------------------------------------------------------------------
const INFRA_IDS = new Set(['warmup', 'tb2_warmup', 'shake_out', 'cooldown', 'rest_1', 'rest_2', 'rest_note']);

// Distinct calendar colours per phase — overrides the app-wide phase accents
// which are too similar (Strength tan ≈ Performance brown).
const CAL_PHASE_COLORS = { 1: '#4C8B5A', 2: '#4A72C4', 3: '#D95B3C', 4: '#8B55C9' };
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function MonthCalendar({ store, today, planStartDate, openSession }) {
  const d0 = new Date(today + 'T00:00:00');
  const [ym, setYm] = useState({ year: d0.getFullYear(), month: d0.getMonth() });
  const [selected, setSelected] = useState(null);

  const prevM = () => setYm(p => p.month === 0
    ? { year: p.year - 1, month: 11 }
    : { year: p.year, month: p.month - 1 });
  const nextM = () => setYm(p => p.month === 11
    ? { year: p.year + 1, month: 0 }
    : { year: p.year, month: p.month + 1 });

  const cells = useMemo(() => {
    const { year, month } = ym;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
    const out = [];
    for (let i = 0; i < firstDow; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let dayEntry = null;
      let calColor = null;
      if (planStartDate && dateStr >= planStartDate) {
        const pos = getPlanPosition(dateStr, planStartDate);
        if (pos.weekNumber >= 1 && pos.weekNumber <= TOTAL_WEEKS) {
          const week = getWeekSchedule(
            pos.weekNumber,
            store.cadenceFor(pos.weekNumber),
            store.patternFor(pos.weekNumber)
          );
          dayEntry = week[pos.dayIndex] || null;
          if (dayEntry?.sessionType !== 'rest') {
            const phaseId = getWeekMeta(pos.weekNumber, planStartDate).phase.id;
            calColor = CAL_PHASE_COLORS[phaseId] || null;
          }
        }
      }
      out.push({ date: d, dateStr, dayEntry, calColor });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [ym, store.state, planStartDate]);

  return (
    <div className="month-calendar">
      <div className="month-nav">
        <button className="month-nav-btn" onClick={prevM}>‹</button>
        <span className="month-nav-title">{MONTH_NAMES[ym.month]} {ym.year}</span>
        <button className="month-nav-btn" onClick={nextM}>›</button>
      </div>

      <div className="month-grid">
        {['M','T','W','T','F','S','S'].map((day, i) => (
          <div key={i} className="month-dow">{day}</div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="month-cell empty" />;
          const isToday    = cell.dateStr === today;
          const isPast     = cell.dateStr < today;
          const hasSession = cell.dayEntry?.sessionType && cell.dayEntry.sessionType !== 'rest';
          const clickable  = hasSession && !isPast;
          const isSelected = selected?.dateStr === cell.dateStr;
          return (
            <button
              key={i}
              className={`month-cell${isToday ? ' today' : ''}${isSelected ? ' sel' : ''}${isPast ? ' past' : ''}${!clickable ? ' inert' : ''}`}
              onClick={() => clickable ? setSelected(isSelected ? null : cell) : null}
            >
              <span className="month-date-num">{cell.date}</span>
              {hasSession && (
                <span className="month-pip" style={{ background: cell.calColor }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Session card */}
      {selected?.dayEntry && selected.dayEntry.sessionType !== 'rest' && (() => {
        const dateObj  = new Date(selected.dateStr + 'T00:00:00');
        const dow      = DOW_SHORT[dateObj.getDay()].toUpperCase();
        const dayNum   = dateObj.getDate();
        const isToday2 = selected.dateStr === today;
        const dateLabel = isToday2
          ? `Today · ${dow} ${dayNum}`
          : `${dow} ${dayNum} ${MONTH_NAMES[dateObj.getMonth()].slice(0, 3).toUpperCase()}`;
        const muscles = [];
        (selected.dayEntry.session.exercises || [])
          .filter(ex => !INFRA_IDS.has(ex.id))
          .forEach(ex => (ex.muscles || []).forEach(m => {
            if (!muscles.includes(m)) muscles.push(m);
          }));
        const muscleStr = muscles.slice(0, 3)
          .map(m => m.charAt(0).toUpperCase() + m.slice(1))
          .join(' · ') || selected.dayEntry.session.location;
        const accent = selected.calColor || 'var(--accent)';
        return (
          <div className="month-session-card">
            <div className="month-session-meta">
              <span className="month-session-date-label">{dateLabel}</span>
              <span className="month-session-duration">{selected.dayEntry.session.duration}</span>
            </div>
            <div className="month-session-name">{selected.dayEntry.session.name}</div>
            {muscleStr && <div className="month-session-muscles">{muscleStr}</div>}
            <button
              className="month-session-cta"
              style={{ background: accent }}
              onClick={() => openSession(selected.dayEntry)}
            >
              Open session
            </button>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="month-legend">
        {PHASES.map(p => (
          <span key={p.id} className="month-legend-item">
            <span className="month-pip" style={{ background: CAL_PHASE_COLORS[p.id] }} /> {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// ScheduleTab
// ----------------------------------------------------------------------------
export function ScheduleTab({ store, openSession, openSettings, activeWeek: activeWeekProp, setActiveWeek, viewMode, setViewMode }) {
  const today = todayISO();
  const pos = getPlanPosition(today, store.planStartDate);
  const activeWeek = activeWeekProp ?? pos.weekNumber;

  const [editOpen, setEditOpen] = useState(false);
  const week  = getWeekSchedule(activeWeek, store.cadenceFor(activeWeek), store.patternFor(activeWeek));
  const meta  = getWeekMeta(activeWeek, store.planStartDate);
  const phase = meta.phase;
  const stripRef = useRef(null);

  useEffect(() => {
    if (!stripRef.current || viewMode !== 'week') return;
    const el = stripRef.current.querySelector(`[data-week="${activeWeek}"]`);
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeWeek, viewMode]);

  const isCustomized = store.state.weekCadence[activeWeek] || store.state.weekPattern[activeWeek];

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub">{phase.name} · {meta.tag || 'Build'}</div>
          <h1>Schedule</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >Week</button>
            <button
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >Month</button>
          </div>
          <button className="cog" onClick={openSettings} aria-label="Settings">
            <Icon.Cog style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <>
          <div ref={stripRef} className="week-strip">
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => {
              const m = getWeekMeta(w, store.planStartDate);
              const sessionsThisWeek = getWeekSchedule(w, store.cadenceFor(w), store.patternFor(w))
                .filter(d => d.sessionType !== 'rest');
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
        </>
      ) : (
        <MonthCalendar
          store={store}
          today={today}
          planStartDate={store.planStartDate}
          openSession={openSession}
        />
      )}

      {editOpen && <EditWeekModal weekNumber={activeWeek} store={store} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
