export function MigrationPrompt({ onMigrate, onSkip }) {
  return (
    <div className="modal-bg">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Migrate existing data?</h3>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0 20px' }}>
          You have training progress saved on this device. Upload it to your account so it syncs across devices.
        </p>
        <button className="modal-primary" onClick={onMigrate}>
          Upload to my account
        </button>
        <button className="modal-close" onClick={onSkip}>
          Start fresh
        </button>
      </div>
    </div>
  );
}
