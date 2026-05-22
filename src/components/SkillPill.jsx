// ============================================================================
// SkillPill — coloured category label
// StatusDot — session completion indicator (circle on day rows)
// ============================================================================

import { SKILL_CATEGORIES } from '../data/phases.js';
import { Icon } from './icons.jsx';

export function SkillPill({ categoryId, compact = false }) {
  const c = SKILL_CATEGORIES[categoryId];
  if (!c) return null;
  return (
    <span className="pill" style={{ borderColor: `${c.color}55` }}>
      <span className="dot" style={{ background: c.color }} />
      {compact ? c.short : c.label}
    </span>
  );
}

export function StatusDot({ status }) {
  if (status === 'done') {
    return (
      <div className="day-check checked">
        <Icon.Check style={{ width: 14, height: 14 }} />
      </div>
    );
  }
  if (status === 'partial') {
    return (
      <div className="day-check partial" style={{ borderColor: '#C2A878', background: '#C2A87822' }}>
        <Icon.Dash style={{ width: 14, height: 14, color: '#C2A878' }} />
      </div>
    );
  }
  return <div className="day-check" />;
}
