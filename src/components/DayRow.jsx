// ============================================================================
// DayRow — one row in a week's schedule list
// Used by HomeTab, ScheduleTab, and EditWeekModal.
// ============================================================================

import { Icon } from './icons.js';
import { StatusDot } from './SkillPill.jsx';

export function DayRow({ day, isToday, status, onClick, editMode, onDragHandleTouch }) {
  const isRest = day.sessionType === 'rest';
  return (
    <div className={`day-row ${isRest ? 'rest' : ''} ${status === 'done' ? 'complete' : ''} ${isToday ? 'is-today' : ''}`}>
      <button className="day-row-main" onClick={onClick} disabled={editMode}>
        <div className="day-dow">{day.dayLabel}</div>
        <div className="day-bar" style={{ background: isRest ? '#26262a' : day.session.accent }} />
        <div className="day-body">
          <div className="day-name">{day.session.name}</div>
          <div className="day-meta">{isRest ? 'Recovery' : `${day.session.duration} · ${day.session.location}`}</div>
        </div>
        {!editMode && !isRest && <StatusDot status={status} />}
        {!editMode && isRest && <div className="day-check rest-dot" />}
      </button>
      {editMode && onDragHandleTouch && (
        <div className="day-drag-handle">
          <div className="drag-handle" onTouchStart={onDragHandleTouch}>
            <Icon.DragHandle style={{ width: 20, height: 20 }} />
          </div>
        </div>
      )}
    </div>
  );
}
