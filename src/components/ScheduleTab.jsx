// ============================================================================
// ScheduleTab — 16-week strip with phase-coloured chips, the selected week's
// summary card, and the day list for that week. Opens EditWeekModal from the
// pencil icon to override cadence or reorder days for a single week.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { TOTAL_WEEKS, getPlanPosition, todayISO, formatDateShort } from '../data/sessions.js';
import { getWeekSchedule, getWeekMeta } from '../services/planGenerator.js';
import { Icon } from './icons.jsx';
import { DayRow } from './DayRow.jsx';
import { EditWeekModal } from './EditWeekModal.jsx';

export function ScheduleTab({ store, openSession, openSettings }) {
  const today = todayISO();
  const pos = getPlanPosition(today, store.planStartDate);
  const [activeWeek, setActiveWeek] = useState(pos.weekNumber);
  const [editOpen, setEditOpen] = useState(false);
  const week = getWeekSchedule(activeWeek, store.cadenceFor(activeWeek), store.patternFor(activeWeek));
  const meta = getWeekMeta(activeWeek, store.planStartDate);
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
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => {
          const m = getWeekMeta(w, store.planStartDate);
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
