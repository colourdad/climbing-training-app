// ============================================================================
// localStorage — keys, schema version, load/save, legacy migration
// ============================================================================
// This is the single source of truth for every localStorage key name used by
// the app. Changing a key name here is the only place it ever needs changing.
// ============================================================================

export const STORAGE_KEY    = 'send_climbing_v4';
export const SCHEMA_VERSION = 4;
export const LEGACY_KEYS    = ['send_climbing_v2', 'send_climbing_v3'];

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion === SCHEMA_VERSION) return parsed;
    }
    // First load on this schema version — clear any legacy keys so old session
    // IDs (rings/weights/pe) don't linger.
    LEGACY_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    return {};
  } catch (e) { return {}; }
}

export function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, schemaVersion: SCHEMA_VERSION }));
  } catch (e) {}
}
