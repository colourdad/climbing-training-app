import { useRef, useState, useEffect } from 'react';
import { useTrainingPlan } from './hooks/useTrainingPlan.js';
import { getWeekSchedule } from './services/planGenerator.js';
import { loadState } from './services/migrations.js';
import { AuthGuard } from './components/AuthGuard.jsx';
import { MigrationPrompt } from './components/MigrationPrompt.jsx';
import { SyncStatusIndicator } from './components/SyncStatusIndicator.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { SessionView } from './components/SessionView.jsx';
import { HomeTab } from './components/HomeTab.jsx';
import { ScheduleTab } from './components/ScheduleTab.jsx';
import { ProgressTab } from './components/ProgressTab.jsx';
import { NotesTab } from './components/NotesTab.jsx';
import { AssessmentsTab } from './components/AssessmentsTab.jsx';
import { Navigation } from './components/Navigation.jsx';

// ============================================================================
// Root App — owns the tab/view + session selection state and routes between
// the five tab views, the session detail screen, and the global settings
// modal. Everything else lives in its own component file.
// ============================================================================

export default function App() {
  const store = useTrainingPlan();
  const [view, setView] = useState('home');
  const [selectedDay, setSelectedDay] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  // Tab the user was on when they opened a session — restored on back.
  const prevViewRef = useRef('home');

  // Show migration prompt once when signed in but no cloud row exists and
  // there is existing data in localStorage.
  useEffect(() => {
    if (store.cloudState !== 'not-found') return;
    const local = loadState();
    const hasData = local && (
      Object.keys(local.completedExercises || {}).length > 0 ||
      Object.keys(local.sessionLog || {}).length > 0 ||
      Object.keys(local.assessments || {}).length > 0
    );
    if (hasData) setShowMigration(true);
  }, [store.cloudState]);

  const handleMigrate = () => {
    const local = loadState();
    store.setState({
      cadence:            local.cadence            || '3day',
      weekCadence:        local.weekCadence        || {},
      weekPattern:        local.weekPattern        || {},
      completedExercises: local.completedExercises || {},
      sessionLog:         local.sessionLog         || {},
      assessments:        local.assessments        || {},
      exerciseOrder:      local.exerciseOrder      || {},
      exerciseSkipped:    local.exerciseSkipped    || {},
    });
    setShowMigration(false);
  };

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
    <AuthGuard>
      {showMigration && (
        <MigrationPrompt
          onMigrate={handleMigrate}
          onSkip={() => setShowMigration(false)}
        />
      )}
      <div className="app">
        <SyncStatusIndicator status={store.syncStatus} />
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

        <Navigation view={view} setView={handleSetView} />

        {settingsOpen && <SettingsModal store={store} onClose={() => setSettingsOpen(false)} />}
      </div>
    </AuthGuard>
  );
}
