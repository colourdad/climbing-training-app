// ============================================================================
// HeatmapCellModal — detail popover shown when a logged day cell in the
// Progress-tab heatmap is tapped. Read-only: surfaces effort + difficulty.
// ============================================================================

import { PLAN_START_DATE, addDays, formatDateLong } from '../data.js';

export function HeatmapCellModal({ cell, onClose }) {
  const startDate = addDays(PLAN_START_DATE, (cell.weekNumber - 1) * 7 + cell.dayIndex);
  const dateLabel = formatDateLong(startDate);

  const renderRating = (value) => {
    if (!value) return <span className="muted">—</span>;
    return (
      <span className="rating-pips">
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} className={`rating-pip ${value >= n ? 'on' : ''}`} />
        ))}
        <span className="tiny muted" style={{ marginLeft: 6 }}>{value}/5</span>
      </span>
    );
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-narrow" onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: 4 }}>{cell.sessionName}</h3>
        <div className="tiny muted" style={{ marginBottom: 16 }}>{dateLabel} · Week {cell.weekNumber}</div>

        <div className="cell-detail-row">
          <span className="cell-detail-label">Effort</span>
          {renderRating(cell.effort)}
        </div>
        <div className="cell-detail-row">
          <span className="cell-detail-label">Difficulty</span>
          {renderRating(cell.difficulty)}
        </div>

        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
