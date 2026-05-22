import { useMemo, useRef, useState } from 'react';
import { useTrainingPlan } from './hooks/useTrainingPlan.js';
import {
  getWeekSchedule,
  formatDateShort,
  ASSESSMENTS,
  PLAN_START_DATE,
  addDays,
} from './data.js';
import { Icon } from './components/icons.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { SessionView } from './components/SessionView.jsx';
import { HomeTab } from './components/HomeTab.jsx';
import { ScheduleTab } from './components/ScheduleTab.jsx';
import { ProgressTab } from './components/ProgressTab.jsx';

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
        <SessionView day={dayForRender} store={store} onBack={closeSession} />
      ) : view === 'home' ? (
        <HomeTab store={store} openSession={openSession} openSettings={openSettings} />
      ) : view === 'schedule' ? (
        <ScheduleTab store={store} openSession={openSession} openSettings={openSettings} />
      ) : view === 'progress' ? (
        <ProgressTab store={store} openSettings={openSettings} />
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
