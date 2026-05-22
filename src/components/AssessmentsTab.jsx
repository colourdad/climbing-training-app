// ============================================================================
// AssessmentsTab — 10 standardised tests with Week 1 baseline and Week 17
// retest inputs. Each row expands to show equipment, protocol, and scoring,
// plus a small notes field. Persistence is via store.setAssessmentField.
// ============================================================================

import { useState } from 'react';
import { ASSESSMENTS } from '../data/assessments.js';
import { Icon } from './icons.jsx';

export function AssessmentsTab({ store, openSettings }) {
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
