export function SyncStatusIndicator({ status }) {
  if (status === 'idle')    return <span className="sync-indicator sync-ok"   title="Saved to cloud" />;
  if (status === 'saving')  return <span className="sync-indicator sync-busy" title="Saving…" />;
  if (status === 'loading') return <span className="sync-indicator sync-busy" title="Loading…" />;
  if (status === 'error')   return <span className="sync-indicator sync-err"  title="Save failed — changes kept locally" />;
  return null;
}
