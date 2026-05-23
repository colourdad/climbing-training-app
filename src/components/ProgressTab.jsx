// ============================================================================
// ProgressTab — done / avg-effort stats, the weekly load stacked bar chart
// (co-located helpers: StackedBarChart + StackedBarLegend), and the 17-week
// heatmap with HeatmapCellModal for logged days.
// ============================================================================

import React, { useMemo, useState } from 'react';
import { SKILL_CATEGORIES, SKILL_ORDER } from '../data/phases.js';
import { TOTAL_WEEKS, getPlanPosition, todayISO } from '../data/sessions.js';
import { getWeekSchedule, getAllSessions, getWeekMeta } from '../services/planGenerator.js';
import { Icon } from './icons.jsx';
import { HeatmapCellModal } from './HeatmapCellModal.jsx';

// ----------------------------------------------------------------------------
// Donut chart — training minutes broken down by skill category.
// ----------------------------------------------------------------------------
function DonutChart({ minutesByCategory, size = 72 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 3;
  const innerR = outerR - 11;
  const total = SKILL_ORDER.reduce((s, c) => s + (minutesByCategory[c] || 0), 0);

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="none"
          stroke="var(--border)" strokeWidth={outerR - innerR} />
      </svg>
    );
  }

  const segments = [];
  let startAngle = -Math.PI / 2;

  SKILL_ORDER.forEach(c => {
    const v = minutesByCategory[c] || 0;
    if (v === 0) return;
    const angle = (v / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    segments.push(<path key={c} d={d} fill={SKILL_CATEGORIES[c].color} />);
    startAngle = endAngle;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Stacked bar chart — one bar per week, stacked by skill category.
// Y-axis auto-scales to the tallest bar. X-axis grows with currentWeek.
// ----------------------------------------------------------------------------
// Path for a rect with rounded top corners only.
function topRoundedRect(x, y, w, h, r) {
  const safeR = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + safeR},${y}`,
    `H ${x + w - safeR}`,
    `A ${safeR},${safeR} 0 0,1 ${x + w},${y + safeR}`,
    `V ${y + h}`,
    `H ${x}`,
    `V ${y + safeR}`,
    `A ${safeR},${safeR} 0 0,1 ${x + safeR},${y}`,
    'Z',
  ].join(' ');
}

function StackedBarChart({ minutesByWeek, currentWeek }) {
  const cats = SKILL_ORDER;
  const width = 340;
  const height = 220;
  const padding = { top: 10, right: 6, bottom: 28, left: 30 };
  // Leave extra space before the first bar so it doesn't hug the y-axis corner.
  const barStartOffset = 10;
  const chartW = width - padding.left - padding.right - barStartOffset;
  const chartH = height - padding.top - padding.bottom;
  const numBars = Math.max(currentWeek, 3);
  const visibleCounts = minutesByWeek.slice(0, numBars);
  const barGap = numBars > 8 ? 2 : 4;
  const barW = (chartW - barGap * (numBars - 1)) / numBars;

  const totals = visibleCounts.map(w => cats.reduce((s, c) => s + (w[c] || 0), 0));
  const rawMaxMins = Math.max(1, ...totals);

  const niceMaxMins = (() => {
    const h = rawMaxMins / 60;
    if (h <= 0.5) return 30;
    if (h <= 1)   return 60;
    if (h <= 2)   return 120;
    if (h <= 3)   return 180;
    if (h <= 5)   return 300;
    if (h <= 8)   return 480;
    return Math.ceil(h / 2) * 120;
  })();

  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    (niceMaxMins / tickCount) * i
  );

  const fmtTick = (mins) => {
    if (mins === 0) return '0';
    const h = mins / 60;
    return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
  };

  const yFor = (mins) => padding.top + chartH - (mins / niceMaxMins) * chartH;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* gridlines + y-axis labels */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={padding.left} x2={width - padding.right} y1={yFor(t)} y2={yFor(t)}
            stroke="var(--border-2)" strokeDasharray={t === 0 ? '' : '3,4'} strokeWidth="0.8" />
          <text x={padding.left - 4} y={yFor(t) + 3} fill="#6b675f" fontSize="9" textAnchor="end">
            {fmtTick(t)}
          </text>
        </g>
      ))}

      {/* bars (one per visible week) */}
      {visibleCounts.map((counts, w) => {
        const x = padding.left + barStartOffset + w * (barW + barGap);
        let yCursor = yFor(0);
        const isCurrent = (w + 1) === currentWeek;
        const showLabel = numBars <= 8 ? true : (w + 1) % 2 === 1;

        // Find the topmost non-zero category so we can round its top.
        const nonZeroCats = cats.filter(c => (counts[c] || 0) > 0);
        const topCat = nonZeroCats[nonZeroCats.length - 1];

        return (
          <g key={w}>
            {isCurrent && totals[w] === 0 && (
              <rect x={x - 0.5} y={padding.top} width={barW + 1} height={chartH}
                fill="rgba(194,168,120,0.06)" rx="2" />
            )}
            {cats.map(cat => {
              const v = counts[cat] || 0;
              if (v === 0) return null;
              const h = (v / niceMaxMins) * chartH;
              const y = yCursor - h;
              yCursor = y;
              const isTop = cat === topCat;
              return isTop
                ? <path key={cat} d={topRoundedRect(x, y, barW, h, 3)} fill={SKILL_CATEGORIES[cat].color} />
                : <rect key={cat} x={x} y={y} width={barW} height={h} fill={SKILL_CATEGORIES[cat].color} />;
            })}
            {showLabel && (
              <text
                x={x + barW / 2}
                y={height - padding.bottom + 12}
                fill={isCurrent ? '#c2a878' : '#6b675f'}
                fontSize={isCurrent ? '10' : '9'}
                fontWeight={isCurrent ? '800' : '500'}
                textAnchor="middle"
              >
                {w + 1}
              </text>
            )}
          </g>
        );
      })}

      {/* x-axis label */}
      <text
        x={(padding.left + barStartOffset + (width - padding.right)) / 2}
        y={height - 4}
        fill="#6b675f"
        fontSize="8.5"
        fontWeight="700"
        textAnchor="middle"
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        Week
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
  const pos = getPlanPosition(today, store.planStartDate);
  const meta = getWeekMeta(pos.weekNumber, store.planStartDate);

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

  // Weekly bar chart: actual minutes per category per week, distributed by work-exercise proportion.
  // Consistent with donut — uses actualMinutes from session log, excludes infra exercises.
  const minutesByWeek = useMemo(() => {
    const weeks = Array.from({ length: TOTAL_WEEKS }, () => {
      const obj = {};
      SKILL_ORDER.forEach(s => { obj[s] = 0; });
      return obj;
    });
    const infraIds = new Set(['warmup', 'tb2_warmup', 'shake_out', 'cooldown', 'rest_1', 'rest_2', 'rest_note']);
    Object.entries(store.state.sessionLog || {}).forEach(([key, log]) => {
      if (!log || !log.endedAt || !log.actualMinutes) return;
      const match = key.match(/^w(\d+)_d(\d+)$/);
      if (!match) return;
      const w = parseInt(match[1]);
      const d = parseInt(match[2]);
      if (w < 1 || w > TOTAL_WEEKS) return;
      const sessionEntry = allSessions.find(s => s.weekNumber === w && s.dayIndex === d);
      if (!sessionEntry || sessionEntry.sessionType === 'rest') return;
      const workExs = sessionEntry.session.exercises.filter(ex => !infraIds.has(ex.id));
      const catCounts = {};
      SKILL_ORDER.forEach(c => { catCounts[c] = 0; });
      let totalDone = 0;
      workExs.forEach(ex => {
        if (store.isExerciseDone(w, d, ex.id)) { catCounts[ex.category]++; totalDone++; }
      });
      if (totalDone === 0) { workExs.forEach(ex => { catCounts[ex.category]++; totalDone++; }); }
      if (totalDone === 0) return;
      SKILL_ORDER.forEach(c => { weeks[w - 1][c] += (catCounts[c] / totalDone) * log.actualMinutes; });
    });
    return weeks;
  }, [store.state, allSessions]);

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
  const [trainingFilter, setTrainingFilter] = useState('all');

  const INFRA_IDS = new Set(['warmup', 'tb2_warmup', 'shake_out', 'cooldown', 'rest_1', 'rest_2', 'rest_note']);

  const { totalTrainingMinutes, minutesByCategory, completedInPeriod } = useMemo(() => {
    const now = new Date();
    const cutoff = trainingFilter === 'week'
      ? new Date(now - 7 * 24 * 60 * 60 * 1000)
      : trainingFilter === 'month'
        ? new Date(now - 30 * 24 * 60 * 60 * 1000)
        : null;

    const catMins = {};
    SKILL_ORDER.forEach(c => { catMins[c] = 0; });
    let total = 0;
    let completedSessions = 0;

    Object.entries(store.state.sessionLog || {}).forEach(([key, log]) => {
      if (!log || !log.endedAt || !log.actualMinutes) return;
      if (cutoff && new Date(log.endedAt) < cutoff) return;
      completedSessions++;
      total += log.actualMinutes;

      const match = key.match(/^w(\d+)_d(\d+)$/);
      if (!match) return;
      const w = parseInt(match[1]);
      const d = parseInt(match[2]);

      const sessionEntry = allSessions.find(s => s.weekNumber === w && s.dayIndex === d);
      if (!sessionEntry || sessionEntry.sessionType === 'rest') return;

      const workExercises = sessionEntry.session.exercises.filter(ex => !INFRA_IDS.has(ex.id));

      const catCounts = {};
      SKILL_ORDER.forEach(c => { catCounts[c] = 0; });
      let totalDone = 0;
      workExercises.forEach(ex => {
        if (store.isExerciseDone(w, d, ex.id)) {
          catCounts[ex.category] = (catCounts[ex.category] || 0) + 1;
          totalDone++;
        }
      });

      if (totalDone === 0) {
        workExercises.forEach(ex => {
          catCounts[ex.category] = (catCounts[ex.category] || 0) + 1;
          totalDone++;
        });
      }

      if (totalDone === 0) return;
      SKILL_ORDER.forEach(c => {
        catMins[c] += (catCounts[c] / totalDone) * log.actualMinutes;
      });
    });

    SKILL_ORDER.forEach(c => { catMins[c] = Math.round(catMins[c]); });
    return { totalTrainingMinutes: total, minutesByCategory: catMins, completedInPeriod: completedSessions };
  }, [store.state.sessionLog, trainingFilter, allSessions]);

  const fmtTraining = (mins) => {
    if (mins === 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="view">
      <div className="top">
        <div>
          <div className="top-sub"><span className="top-sub-dot" />Real-time</div>
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
          <div className="stat-sub">sessions</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg effort</div>
          <div className="stat-value-row">
            <span className="stat-value">{effortSampleCount ? avgEffort.toFixed(1) : '—'}</span>
            <span className="stat-denom">/ 5</span>
          </div>
          <div className="stat-sub">{effortSampleCount ? `over ${effortSampleCount} session${effortSampleCount === 1 ? '' : 's'}` : 'no sessions logged'}</div>
        </div>
      </div>

      <div className="total-training-card card">
        <div className="total-training-header">
          <span className="total-training-label">Total training</span>
          <div className="total-training-filters">
            {[['week', 'Week'], ['month', 'Month'], ['all', 'All time']].map(([v, label]) => (
              <button
                key={v}
                className={`tt-filter-pill${trainingFilter === v ? ' active' : ''}`}
                onClick={() => setTrainingFilter(v)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="total-training-body">
          <DonutChart minutesByCategory={minutesByCategory} size={96} />
          <div className="total-training-text">
            <div className="total-training-value">{fmtTraining(totalTrainingMinutes)}</div>
            {completedInPeriod > 0 && (
              <div className="total-training-sub">over {completedInPeriod} session{completedInPeriod === 1 ? '' : 's'}</div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="total-training-header">
          <span className="total-training-label">Weekly load</span>
          <span className="total-training-label">Hours · stacked by skill</span>
        </div>
        <StackedBarChart minutesByWeek={minutesByWeek} currentWeek={pos.weekNumber} />
        <StackedBarLegend />
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="total-training-header">
          <span className="total-training-label">17-week plan</span>
          <span className="total-training-label">Wk {pos.weekNumber} · {meta.phase.name}</span>
        </div>
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
