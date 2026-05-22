import { useRef, useState } from 'react';
import { useTrainingPlan } from './hooks/useTrainingPlan.js';
import { getWeekSchedule } from './data.js';
import { Icon } from './components/icons.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { SessionView } from './components/SessionView.jsx';
import { HomeTab } from './components/HomeTab.jsx';
import { ScheduleTab } from './components/ScheduleTab.jsx';
import { ProgressTab } from './components/ProgressTab.jsx';
import { NotesTab } from './components/NotesTab.jsx';
import { AssessmentsTab } from './components/AssessmentsTab.jsx';

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
        <AssessmentsTab store={store} openSettings={openSettings} />
      ) : (
        <NotesTab store={store} openSession={openSession} openSettings={openSettings} />
      )}

      <TabBar view={view} setView={handleSetView} />

      {settingsOpen && <SettingsModal store={store} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
