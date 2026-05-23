import { useState } from 'react';
import { UserButton, useClerk } from '@clerk/clerk-react';
import { formatDateLong } from '../data/sessions.js';

// ============================================================================
// SettingsModal — global preferences modal opened from the cog icon.
// ============================================================================

export function SettingsModal({ store, onClose }) {
  const { signOut } = useClerk();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmNewCycle, setConfirmNewCycle] = useState(false);

  const customized = Object.keys(store.state.weekCadence).length + Object.keys(store.state.weekPattern).length;

  const handleReset = () => {
    store.resetAll();
    setConfirmReset(false);
    onClose();
  };

  const handleNewCycle = () => {
    store.startNewCycle();
    setConfirmNewCycle(false);
    onClose();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Settings</h3>

        <div className="modal-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Plan start date</div>
          <div className="tiny muted" style={{ marginBottom: 4 }}>
            {formatDateLong(store.planStartDate)} · all week dates update automatically
          </div>
          <input
            type="date"
            value={store.planStartDate}
            onChange={e => e.target.value && store.setPlanStartDate(e.target.value)}
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'inherit',
              fontSize: 14,
              padding: '6px 10px',
              width: '100%',
            }}
          />
        </div>

        <div className="modal-row" style={{ marginTop: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Default cadence</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>
              {store.state.cadence === '3day' ? 'Mon · Wed · Fri climbs · Tue + Sat home' : 'Mon · Thu climbs · Tue + Fri home'}
              {customized ? ` · ${customized} week${customized > 1 ? 's' : ''} customised` : ''}
            </div>
          </div>
          <div className="segmented">
            <button className={store.state.cadence === '3day' ? 'on' : ''} onClick={() => store.setGlobalCadence('3day')}>3 climbs</button>
            <button className={store.state.cadence === '2day' ? 'on' : ''} onClick={() => store.setGlobalCadence('2day')}>2 climbs</button>
          </div>
        </div>

        <div className="modal-hint tiny muted">
          Tip: tap the pencil icon on any week to override cadence or reorder days for that week only.
        </div>

        {confirmNewCycle ? (
          <div className="modal-confirm-row">
            <div className="tiny muted" style={{ marginBottom: 8 }}>Start a new 17-week cycle from today? Your progress and logs will be cleared.</div>
            <button className="modal-danger" onClick={handleNewCycle}>Yes, start new cycle</button>
            <button className="modal-close" style={{ marginTop: 6 }} onClick={() => setConfirmNewCycle(false)}>Cancel</button>
          </div>
        ) : (
          <button className="modal-secondary" style={{ marginTop: 16 }} onClick={() => setConfirmNewCycle(true)}>
            Start new cycle
          </button>
        )}

        {confirmReset ? (
          <div className="modal-confirm-row" style={{ marginTop: 8 }}>
            <div className="tiny muted" style={{ marginBottom: 8 }}>Reset all progress and customisations? This cannot be undone.</div>
            <button className="modal-danger" onClick={handleReset}>Yes, reset everything</button>
            <button className="modal-close" style={{ marginTop: 6 }} onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        ) : (
          <button className="modal-danger" style={{ marginTop: 8 }} onClick={() => setConfirmReset(true)}>
            Reset all progress
          </button>
        )}

        <div className="modal-row" style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserButton />
            <span className="tiny muted">Signed in · synced</span>
          </div>
          <button
            className="modal-secondary"
            onClick={() => { signOut(); onClose(); }}
          >
            Sign out
          </button>
        </div>

        <button className="modal-close" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
