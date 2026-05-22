// ============================================================================
// SettingsModal — global preferences modal opened from the cog icon.
// Owns the default-cadence toggle and the "Reset all progress" action.
// ============================================================================

export function SettingsModal({ store, onClose }) {
  const customized = Object.keys(store.state.weekCadence).length + Object.keys(store.state.weekPattern).length;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Settings</h3>
        <p>Plan starts Mon 18 May 2026. Progress saves to this device only.</p>

        <div className="modal-row">
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

        <button
          className="modal-danger"
          onClick={() => {
            if (confirm('Reset all progress and customisations? This cannot be undone.')) {
              store.resetAll();
              onClose();
            }
          }}
        >
          Reset all progress
        </button>

        <button className="modal-close" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
