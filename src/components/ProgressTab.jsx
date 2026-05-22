// ============================================================================
// ProgressTab — done / avg-effort stats, the weekly load stacked bar chart
// (co-located helpers: StackedBarChart + StackedBarLegend), and the 17-week
// heatmap with HeatmapCellModal for logged days.
// ============================================================================

import React, { useMemo, useState } from 'react';
import { SKILL_CATEGORIES, SKILL_ORDER } from '../data/phases.js';
import { TOTAL_WEEKS, getPlanPosition, todayISO } from '../data/sessions.js';
import { getWeekSchedule, getAllSessions } from '../services/planGenerator.js';
import { Icon } from './icons.jsx';
import { HeatmapCellModal } from './HeatmapCellModal.jsx';

// ----------------------------------------------------------------------------
// Stacked bar chart — one bar per week, stacked by skill category.
// Y-axis auto-scales to the tallest bar. Legend below in HTML so it wraps.
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// ProgressTab
// ----------------------------------------------------------------------------
export function ProgressTab({ store, openSettings }) {
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
