// ============================================================================
// NotesTab — chronological diary of session notes. Reads every sessionLog
// entry that has notes content, resolves it to its session + planned date,
// and presents them most-recent-first. Tapping an entry re-opens that
// session via the standard openSession flow.
// ============================================================================

import { useMemo } from 'react';
import { getWeekSchedule } from '../services/planGenerator.js';
import { formatDateShort, addDays } from '../data/sessions.js';
import { Icon } from './icons.jsx';

export function NotesTab({ store, openSession, openSettings }) {
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
      const dateISO = addDays(store.planStartDate, (weekNumber - 1) * 7 + dayIndex);
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
