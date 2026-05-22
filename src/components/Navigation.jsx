// ============================================================================
// Navigation — the bottom tab bar. Five tabs: Home / Schedule / Progress /
// Tests (assessments) / Notes. Driven by App-level `view` state.
// ============================================================================

import { Icon } from './icons.jsx';

const TABS = [
  { id: 'home',     label: 'Home',     icon: Icon.Home },
  { id: 'schedule', label: 'Schedule', icon: Icon.Calendar },
  { id: 'progress', label: 'Progress', icon: Icon.Chart },
  { id: 'assess',   label: 'Tests',    icon: Icon.Target },
  { id: 'notes',    label: 'Notes',    icon: Icon.Book },
];

export function Navigation({ view, setView }) {
  return (
    <nav className="tabbar">
      {TABS.map(t => {
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
