// ============================================================================
// ScheduleTab — Paper direction (A). Week view + Month view.
// No flooded hero — day-type colour reads through accents only.
// ============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { TOTAL_WEEKS, getPlanPosition, todayISO, formatDateShort } from '../data/sessions.js';
import { getWeekSchedule, getWeekMeta } from '../services/planGenerator.js';
import { PHASES } from '../data/phases.js';
import { Icon } from './icons.jsx';
import { EditWeekModal } from './EditWeekModal.jsx';

// Phase → strip/bar colour (maps to CSS variables)
const PHASE_COLORS = {
  1: 'var(--accent)',       // Foundation
  2: 'var(--slate)',        // Strength / Build
  3: 'var(--accent-dark)',  // Power Endurance
  4: 'var(--perf)',         // Performance
};

// Editorial chip labels by session id
const SESSION_CHIPS = {
  limit:     ['Power', 'Project', 'Wall'],
  volume:    ['Endurance', 'Volume', 'Wall'],
  homeA:     ['Prehab', 'Pulling', 'Home'],
  homeB:     ['Core', 'Mobility', 'Home'],
  tech:      ['Technique', 'Wall'],
  testing:   ['Assessment', 'Wall'],
  lightHome: ['Deload', 'Home'],
};

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

function isCompleted(status) {
  return status === 'done' || status === 'partial';
}

// ISO date for a given week + day index relative to plan start
function getDayISO(weekStartDate, dayIndex) {
  const d = new Date(weekStartDate + 'T00:00:00');
  d.setDate(d.getDate() + dayIndex);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "MON 18 MAY" from ISO
function shortDayLabel(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  const dow = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
  const day = d.getDate();
  const mon = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  return `${dow} ${day} ${mon}`;
}

// ── Inline SVG atoms ──────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12">
      <path d="M2 6 L5 9 L10 3" stroke="#FFF" strokeWidth="2.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06A2 2 0 1 1 4.11 16.92l.06-.06A1.7 1.7 0 0 0 4.51 15 1.7 1.7 0 0 0 2.95 14H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.89a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/>
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function SchedHeader({ eyebrow, viewMode, setViewMode, openSettings }) {
  return (
    <div className="sched-header">
      <div>
        <div className="sched-eyebrow">{eyebrow}</div>
        <h1 className="sched-h1">Schedule</h1>
      </div>
      <div className="sched-controls">
        <div className="sched-mode-toggle">
          <button
            className={`sched-mode-btn${viewMode === 'week' ? ' active' : ''}`}
            onClick={() => setViewMode('week')}
          >Week</button>
          <button
            className={`sched-mode-btn${viewMode === 'month' ? ' active' : ''}`}
            onClick={() => setViewMode('month')}
          >Month</button>
        </div>
        <button className="sched-gear" onClick={openSettings} aria-label="Settings">
          <GearIcon />
        </button>
      </div>
    </div>
  );
}

// ── Week strip ────────────────────────────────────────────────────────────────

const SchedWeekStrip = function({ activeWeek, currentWeek, store, planStartDate, onSelect, stripRef }) {
  return (
    <div className="sched-week-strip" ref={stripRef}>
      {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => {
        const m = getWeekMeta(w, planStartDate);
        const sessions = getWeekSchedule(w, store.cadenceFor(w), store.patternFor(w))
          .filter(d => d.sessionType !== 'rest');
        const done = sessions.filter(d =>
          isCompleted(store.getSessionStatus(w, d.dayIndex, d.session.exercises))
        ).length;
        const isCurrent = w === currentWeek;
        const isDeload = m.isDeload || m.isDeepDeload;
        const phaseColor = PHASE_COLORS[m.phase.id] || 'var(--border-2)';

        return (
          <button
            key={w}
            data-week={w}
            className={`sched-week-card${isCurrent ? ' is-current' : ''}`}
            onClick={() => onSelect(w)}
            aria-label={`Week ${w}`}
          >
            <div className="sched-week-stripe" style={{ background: phaseColor }} />
            <div className="sched-week-wk">WK</div>
            <div className="sched-week-num">{w}</div>
            <div className="sched-week-done">
              {isDeload ? 'DL' : `${done}/${sessions.length}`}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ── Selected-day card ─────────────────────────────────────────────────────────

function SchedDayCard({ day, dateISO, openSession }) {
  if (!day) return null;
  const isRest    = day.sessionType === 'rest';
  const accent    = isRest ? 'var(--moss)'      : 'var(--accent)';
  const accentDk  = isRest ? 'var(--moss-dark)' : 'var(--accent-dark)';
  const softBg    = isRest ? 'var(--moss-soft)' : 'var(--accent-soft)';
  const chips     = !isRest ? (SESSION_CHIPS[day.session.id] ?? []) : [];

  const eyebrow   = `${shortDayLabel(dateISO)} · ${isRest ? 'Rest' : 'Session'}`;
  const title     = isRest ? 'Active recovery' : day.session.name;
  const meta      = isRest
    ? 'Walk, mobility, gentle stretching'
    : `${day.session.duration} · ${day.session.location}`;
  const primaryLabel = isRest ? 'Log recovery' : 'Open session';

  return (
    <div className="sched-day-card">
      <div className="sched-day-stripe" style={{ background: accent }} />
      <div className="sched-day-content">
        <div className="sched-day-eyebrow">
          <span className="sched-day-dot" style={{ background: accent }} />
          <span className="sched-day-eyebrow-text" style={{ color: accentDk }}>{eyebrow}</span>
        </div>
        <h2 className="sched-day-h2">{title}</h2>
        <div className="sched-day-meta">{meta}</div>

        {chips.length > 0 && (
          <div className="sched-chips">
            {chips.map(c => (
              <span key={c} className="sched-chip"
                style={{ background: softBg, color: accentDk }}>{c}</span>
            ))}
          </div>
        )}

        {!isRest && (
          <div className="sched-day-actions">
            <button
              className="sched-primary-btn"
              style={{ background: accent }}
              onClick={() => openSession(day)}
            >
              {primaryLabel}
            </button>
            <button className="sched-skip-btn">Skip day</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Day row ───────────────────────────────────────────────────────────────────

function SchedDayRow({ day, isToday, isSelected, status, dateISO, onClick }) {
  const isRest   = day.sessionType === 'rest';
  const isDone   = isCompleted(status);
  const stripe   = isRest ? 'var(--moss)' : 'var(--accent)';

  const cls = [
    'sched-row',
    isToday    ? 'is-today'    : '',
    isRest     ? 'is-rest'     : '',
    isSelected ? 'is-selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} onClick={onClick}>
      <div className="sched-row-stripe" style={{ background: stripe }} />
      <div className="sched-row-dow">{day.dayLabel}</div>
      <div className="sched-row-body">
        <div className="sched-row-name">{day.session.name}</div>
        <div className="sched-row-meta">
          {isRest ? 'Recovery' : `${day.session.duration} · ${day.session.location}`}
        </div>
      </div>
      <div className="sched-row-trailing">
        {isToday && <span className="sched-today-pill">Today</span>}
        {!isToday && isDone && (
          <div className="sched-row-check"><CheckIcon /></div>
        )}
      </div>
    </button>
  );
}

// ── Month grid ────────────────────────────────────────────────────────────────

function SchedMonthGrid({ calYm, store, today, selectedDate, planStartDate, onSelectDate }) {
  const cells = useMemo(() => {
    const { year, month } = calYm;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
    const out = [];
    for (let i = 0; i < firstDow; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let phaseId = null;
      let isRest  = false;
      if (planStartDate && dateStr >= planStartDate) {
        const p = getPlanPosition(dateStr, planStartDate);
        if (p.weekNumber >= 1 && p.weekNumber <= TOTAL_WEEKS) {
          const wk  = getWeekSchedule(p.weekNumber, store.cadenceFor(p.weekNumber), store.patternFor(p.weekNumber));
          const day = wk[p.dayIndex];
          isRest   = day?.sessionType === 'rest';
          phaseId  = getWeekMeta(p.weekNumber, planStartDate).phase.id;
        }
      }
      out.push({ d, dateStr, phaseId, isRest });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [calYm, store.state, planStartDate]);

  // chunk into weeks
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div className="sched-month-grid">
      <div className="sched-month-dow-row">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="sched-month-dow">{d}</div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="sched-month-week-row">
          {row.map((cell, ci) => {
            if (!cell) return <div key={ci} className="sched-month-cell is-empty" />;
            const isSel   = cell.dateStr === selectedDate;
            const isPast  = cell.dateStr < today && !isSel;
            const isInPlan = !!cell.phaseId;
            const cellAccent = cell.isRest ? 'var(--moss)' : 'var(--accent)';
            const phaseColor = PHASE_COLORS[cell.phaseId] || 'var(--text-3)';
            const barColor   = isSel ? 'rgba(255,255,255,0.7)' : phaseColor;

            const cls = [
              'sched-month-cell',
              isSel   ? 'is-selected' : '',
              isPast  ? 'is-past'     : '',
              !isInPlan ? 'is-empty'  : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={ci}
                className={cls}
                style={isSel ? { background: cellAccent } : undefined}
                onClick={() => isInPlan ? onSelectDate(cell.dateStr) : null}
                disabled={!isInPlan}
              >
                <span className="sched-month-cell-num">{cell.d}</span>
                {isInPlan && (
                  <span
                    className="sched-month-phase-bar"
                    style={{
                      background: barColor,
                      opacity: isPast && !isSel ? 0.4 : 1,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Month view ────────────────────────────────────────────────────────────────

const LEGEND_PHASES = [
  { name: 'Foundation',      color: 'var(--accent)'      },
  { name: 'Strength',        color: 'var(--slate)'       },
  { name: 'Power Endurance', color: 'var(--accent-dark)' },
  { name: 'Performance',     color: 'var(--perf)'        },
];

function SchedMonthView({ store, today, planStartDate, selectedDate, onSelectDate, calYm, setCalYm, selDay, openSession }) {
  const prevM = () => setCalYm(p => p.month === 0
    ? { year: p.year - 1, month: 11 }
    : { year: p.year, month: p.month - 1 });
  const nextM = () => setCalYm(p => p.month === 11
    ? { year: p.year + 1, month: 0 }
    : { year: p.year, month: p.month + 1 });

  return (
    <>
      {/* Month navigator */}
      <div className="sched-month-nav">
        <button className="sched-month-nav-btn" onClick={prevM} aria-label="Previous month">
          <ChevronLeft />
        </button>
        <span className="sched-month-title">
          {MONTH_NAMES[calYm.month]} {calYm.year}
        </span>
        <button className="sched-month-nav-btn" onClick={nextM} aria-label="Next month">
          <ChevronRight />
        </button>
      </div>

      {/* Month grid */}
      <SchedMonthGrid
        calYm={calYm}
        store={store}
        today={today}
        selectedDate={selectedDate}
        planStartDate={planStartDate}
        onSelectDate={onSelectDate}
      />

      {/* Phase legend */}
      <div className="sched-legend">
        {LEGEND_PHASES.map(p => (
          <div key={p.name} className="sched-legend-item">
            <span className="sched-legend-bar" style={{ background: p.color }} />
            <span>{p.name}</span>
          </div>
        ))}
      </div>

      {/* Selected-day card */}
      <SchedDayCard day={selDay} dateISO={selectedDate} openSession={openSession} />
    </>
  );
}

// ── ScheduleTab (main export) ─────────────────────────────────────────────────

export function ScheduleTab({ store, openSession, openSettings, activeWeek: activeWeekProp, setActiveWeek, viewMode, setViewMode }) {
  const today      = todayISO();
  const pos        = getPlanPosition(today, store.planStartDate);
  const activeWeek = activeWeekProp ?? pos.weekNumber;

  const [selectedDate, setSelectedDate] = useState(today);
  const [editOpen, setEditOpen]         = useState(false);
  const [calYm, setCalYm]               = useState(() => {
    const d = new Date(today + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const stripRef = useRef(null);

  // Week data
  const week  = getWeekSchedule(activeWeek, store.cadenceFor(activeWeek), store.patternFor(activeWeek));
  const meta  = getWeekMeta(activeWeek, store.planStartDate);
  const phase = meta.phase;

  // Phase progress
  const phaseWeekNum   = activeWeek - phase.weeks[0] + 1;
  const phaseTotalWeeks = phase.weeks.length;
  const phasePct       = Math.round((phaseWeekNum / phaseTotalWeeks) * 100);

  // Done counts for day list header
  const weekSessions = week.filter(d => d.sessionType !== 'rest');
  const weekDone     = weekSessions.filter(d =>
    isCompleted(store.getSessionStatus(d.weekNumber, d.dayIndex, d.session.exercises))
  ).length;

  // Selected day data
  const selPos  = getPlanPosition(selectedDate, store.planStartDate);
  const selWeek = getWeekSchedule(selPos.weekNumber, store.cadenceFor(selPos.weekNumber), store.patternFor(selPos.weekNumber));
  const selDay  = selPos.weekNumber >= 1 && selPos.weekNumber <= TOTAL_WEEKS
    ? selWeek[selPos.dayIndex]
    : null;

  // When user taps a week card
  const handleWeekSelect = (w) => {
    setActiveWeek(w);
    const wMeta = getWeekMeta(w, store.planStartDate);
    // stay on today if it's in the chosen week, otherwise go to first day of week
    const newSel = pos.weekNumber === w ? today : wMeta.startDate;
    setSelectedDate(newSel);
  };

  // When user taps a day row
  const handleDaySelect = (dateISO) => {
    setSelectedDate(dateISO);
  };

  // When user taps a month cell
  const handleMonthDateSelect = (dateISO) => {
    setSelectedDate(dateISO);
    const p = getPlanPosition(dateISO, store.planStartDate);
    setActiveWeek(p.weekNumber);
  };

  // Scroll active week into view
  useEffect(() => {
    if (!stripRef.current || viewMode !== 'week') return;
    const el = stripRef.current.querySelector(`[data-week="${activeWeek}"]`);
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeWeek, viewMode]);

  // Week-phase eyebrow: "Foundation · Build" or "Foundation · Deload" etc.
  const eyebrow = meta.tag
    ? `${phase.name} · ${meta.tag}`
    : phase.name;

  // Phase row label: "Foundation · Wk 1 of 4 · 17–23 May"
  const weekRangeStr = `${formatDateShort(meta.startDate)} – ${formatDateShort(meta.endDate)}`;

  return (
    <div className="sched-view">
      <SchedHeader
        eyebrow={eyebrow}
        viewMode={viewMode}
        setViewMode={setViewMode}
        openSettings={openSettings}
      />

      {viewMode === 'week' ? (
        <>
          <SchedWeekStrip
            stripRef={stripRef}
            activeWeek={activeWeek}
            currentWeek={pos.weekNumber}
            store={store}
            planStartDate={store.planStartDate}
            onSelect={handleWeekSelect}
          />

          <SchedDayCard
            day={selDay}
            dateISO={selectedDate}
            openSession={openSession}
          />

          {/* Phase progress row */}
          <div className="sched-phase-row">
            <div className="sched-phase-top">
              <div className="sched-phase-label">
                <span style={{ color: 'var(--accent)' }}>{phase.name}</span>
                <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>
                  {' '}· Wk {phaseWeekNum} of {phaseTotalWeeks} · {weekRangeStr}
                </span>
              </div>
              <div className="sched-phase-right">
                <button className="sched-edit-btn" onClick={() => setEditOpen(true)} aria-label="Edit week">
                  <Icon.Pencil style={{ width: 14, height: 14 }} />
                </button>
                <span className="sched-phase-pct">{phasePct}%</span>
              </div>
            </div>
            <div className="sched-phase-track">
              <div className="sched-phase-fill" style={{ width: `${phasePct}%` }} />
            </div>
          </div>

          {/* Day list */}
          <div>
            <div className="sched-section-head">
              <h3 className="sched-section-h3">Days</h3>
              <span className="sched-section-done">
                {weekDone} / {weekSessions.length} DONE
              </span>
            </div>
            <div className="sched-day-list">
              {week.map((d, i) => {
                const dayISO  = getDayISO(meta.startDate, i);
                const isToday = activeWeek === pos.weekNumber && i === pos.dayIndex;
                const status  = d.sessionType !== 'rest'
                  ? store.getSessionStatus(d.weekNumber, d.dayIndex, d.session.exercises)
                  : 'planned';
                return (
                  <SchedDayRow
                    key={i}
                    day={d}
                    isToday={isToday}
                    isSelected={dayISO === selectedDate}
                    status={status}
                    dateISO={dayISO}
                    onClick={() => handleDaySelect(dayISO)}
                  />
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <SchedMonthView
          store={store}
          today={today}
          planStartDate={store.planStartDate}
          selectedDate={selectedDate}
          onSelectDate={handleMonthDateSelect}
          calYm={calYm}
          setCalYm={setCalYm}
          selDay={selDay}
          openSession={openSession}
        />
      )}

      {editOpen && (
        <EditWeekModal
          weekNumber={activeWeek}
          store={store}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
