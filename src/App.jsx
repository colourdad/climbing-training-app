import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTrainingPlan } from './hooks/useTrainingPlan.js';
import {
  SKILL_CATEGORIES,
  SKILL_ORDER,
  getWeekSchedule,
  getWeekMeta,
  getAllSessions,
  getPlanPosition,
  todayISO,
  formatDateShort,
  formatDateLong,
  ASSESSMENTS,
  PLAN_START_DATE,
  TOTAL_WEEKS,
  addDays,
} from './data.js';
import { Icon } from './components/icons.jsx';
import { DayRow } from './components/DayRow.jsx';
import { SwipeDeleteRow, SortableList } from './components/SortableList.jsx';
import { ExerciseCard } from './components/ExerciseCard.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { HeatmapCellModal } from './components/HeatmapCellModal.jsx';
import { EndSessionModal } from './components/EndSessionModal.jsx';
import { EditWeekModal } from './components/EditWeekModal.jsx';

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

  // Exercise ordering + skipping
  const customOrder = store.exerciseOrderFor(weekNumber, dayIndex);
  const skipped = store.exerciseSkippedFor(weekNumber, dayIndex);

  const orderedExercises = useMemo(() => {
    let exs = [...session.exercises];
    if (customOrder) {
      const orderMap = Object.fromEntries(customOrder.map((id, i) => [id, i]));
      exs.sort((a, b) => ((orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999)));
    }
    return exs.filter(ex => !skipped[ex.id]);
  }, [session.exercises, customOrder, skipped]);

  const skippedCount = session.exercises.filter(ex => skipped[ex.id]).length;

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
        {!isRest && orderedExercises.length > 0 ? (
          <SortableList
            items={orderedExercises}
            keyFn={(ex) => ex.id}
            onReorder={(newExs) => store.setExerciseOrder(weekNumber, dayIndex, newExs.map(e => e.id))}
            renderItem={(ex, _displayIdx, onDragHandleTouch) => {
              const done = store.isExerciseDone(weekNumber, dayIndex, ex.id);
              return (
                <SwipeDeleteRow
                  onDelete={() => store.toggleExerciseSkipped(weekNumber, dayIndex, ex.id)}
                >
                  <ExerciseCard
                    ex={ex}
                    done={done}
                    onToggleDone={() => store.toggleExercise(weekNumber, dayIndex, ex.id)}
                    expanded={!!expanded[ex.id]}
                    onToggleExpand={() => setExpanded(s => ({ ...s, [ex.id]: !s[ex.id] }))}
                    onDragHandleTouch={onDragHandleTouch}
                  />
                </SwipeDeleteRow>
              );
            }}
          />
        ) : (
          session.exercises.map(ex => {
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
          })
        )}
        {skippedCount > 0 && (
          <button
            className="restore-btn"
            onClick={() => store.restoreExercises(weekNumber, dayIndex)}
          >
            Restore {skippedCount} removed exercise{skippedCount > 1 ? 's' : ''}
          </button>
        )}
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
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => {
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

  // Average effort across every session that has a logged effort value (1–10).
  // Skips unlogged sessions and any log where effort was left at 0.
  const { avgEffort, effortSampleCount } = useMemo(() => {
    let sum = 0;
    let n = 0;
    Object.values(store.state.sessionLog || {}).forEach(log => {
      if (log && typeof log.effort === 'number' && log.effort > 0) {
        sum += log.effort;
        n += 1;
      }
    });
    return { avgEffort: n ? sum / n : 0, effortSampleCount: n };
  }, [store.state]);

  // Stacked bar chart counts: one entry per week (1–TOTAL_WEEKS), each is {skillId: count}.
  // Each ticked exercise contributes 1, scaled by actualMinutes/plannedMinutes if the session was logged.
  const countsByWeek = useMemo(() => {
    const weeks = Array.from({ length: TOTAL_WEEKS }, () => {
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
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
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
          <div className="stat-label">Avg effort</div>
          <div className="stat-value">{effortSampleCount ? avgEffort.toFixed(1) : '—'}</div>
          <div className="stat-sub">{effortSampleCount ? `over ${effortSampleCount} session${effortSampleCount === 1 ? '' : 's'}` : 'no sessions logged'}</div>
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
        <h3>17-week heatmap</h3>
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
                const showEffort = (cell.status === 'done' || cell.status === 'partial') && cell.effort > 0;
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
// Assessments view — 10 standardised tests, Week 1 baseline + Week 17 retest.
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
          Run all 10 tests in <strong>Week 1</strong> before training, and again in <strong>Week 17</strong> after two full rest days. Same order each time.
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
                      <div className="tiny muted" style={{ marginBottom: 4 }}>Week 17 retest</div>
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
  const store = useTrainingPlan();
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
