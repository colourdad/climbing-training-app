// schedule-v2.jsx — Schedule tab redesign. Same design DNA as Home (warm
// paper, coral/moss day-type logic, Geist, day-row pattern) but NO flooded
// colour hero — the day-type colour reads through accents (stripe, eyebrow,
// action button, today chip) so Schedule has its own distinct frame.

const SP = window.PALETTE;
const PhoneShellS = window.Phone;
const TabBarS = window.TabBar;
const CORAL_DARK_S = '#C03D24';
const MOSS_DARK_S  = '#1F5C3D';

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

const PHASE_COLORS = {
  foundation: SP.accent,
  build:      '#4A6FA8',
  power:      '#C03D24',
  perf:       '#7A5BA8',
};

const WEEK_DAYS_SESSION = [
  { dow: 'MON', name: 'Limit Bouldering',           meta: '~2 hrs · Wall',  state: 'today',    kind: 'session', date: '18 May' },
  { dow: 'TUE', name: 'Prehab, Pulling Base & Core', meta: '~60 min · Home', state: 'upcoming', kind: 'session', date: '19 May' },
  { dow: 'WED', name: 'Rest',                       meta: 'Recovery',        state: 'upcoming', kind: 'rest',    date: '20 May' },
  { dow: 'THU', name: 'Volume / Endurance',         meta: '~90 min · Wall',  state: 'upcoming', kind: 'session', date: '21 May' },
  { dow: 'FRI', name: 'Core, Shoulders & Mobility', meta: '~60 min · Home',  state: 'upcoming', kind: 'session', date: '22 May' },
  { dow: 'SAT', name: 'Rest',                       meta: 'Active recovery', state: 'upcoming', kind: 'rest',    date: '23 May' },
];

const WEEK_DAYS_REST = [
  { dow: 'MON', name: 'Limit Bouldering',           meta: '~2 hrs · Wall',  state: 'done',     kind: 'session', date: '18 May' },
  { dow: 'TUE', name: 'Prehab, Pulling Base & Core', meta: '~60 min · Home', state: 'done',     kind: 'session', date: '19 May' },
  { dow: 'WED', name: 'Rest',                       meta: 'Recovery',        state: 'done',     kind: 'rest',    date: '20 May' },
  { dow: 'THU', name: 'Volume / Endurance',         meta: '~90 min · Wall',  state: 'done',     kind: 'session', date: '21 May' },
  { dow: 'FRI', name: 'Core, Shoulders & Mobility', meta: '~60 min · Home',  state: 'done',     kind: 'session', date: '22 May' },
  { dow: 'SAT', name: 'Rest',                       meta: 'Active recovery', state: 'today',    kind: 'rest',    date: '23 May' },
];

const WEEK_STRIP = [
  { n: 1, done: 4, total: 4, phase: 'foundation', current: true },
  { n: 2, done: 0, total: 5, phase: 'foundation' },
  { n: 3, done: 0, total: 5, phase: 'foundation' },
  { n: 4, done: 0, total: 5, phase: 'foundation' },
  { n: 5, done: 0, total: 5, phase: 'build' },
  { n: 6, done: 0, total: 5, phase: 'build' },
  { n: 7, done: 0, total: 5, phase: 'build' },
];

// ─────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────

function CheckS({ size = 22, color = SP.moss }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, background: color,
      display: 'grid', placeItems: 'center', flex: `0 0 ${size}px`,
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12">
        <path d="M2 6 L5 9 L10 3" stroke="#FFF" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function PaperGear({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: SP.card, border: `1px solid ${SP.border}`,
      display: 'grid', placeItems: 'center',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SP.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06A2 2 0 1 1 4.11 16.92l.06-.06A1.7 1.7 0 0 0 4.51 15 1.7 1.7 0 0 0 2.95 14H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.89a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/>
      </svg>
    </div>
  );
}

// Light/paper Week ↔ Month toggle
function PaperModeToggle({ mode }) {
  const seg = (label, active) => (
    <div key={label} style={{
      padding: '6px 14px', borderRadius: 999,
      fontSize: 12, fontWeight: 700,
      color: active ? SP.text : SP.text2,
      background: active ? '#FFF' : 'transparent',
      boxShadow: active ? '0 1px 2px rgba(28,26,23,0.08)' : 'none',
    }}>{label}</div>
  );
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', padding: 3,
      borderRadius: 999, background: SP.card2,
      border: `1px solid ${SP.border}`,
    }}>
      {seg('Week',  mode === 'week')}
      {seg('Month', mode === 'month')}
    </div>
  );
}

// Paper-on-paper top header: eyebrow + "Schedule" + toggle + gear
function ScheduleHeader({ mode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: SP.text2, marginBottom: 4,
        }}>Foundation · Build</div>
        <h1 style={{
          fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, lineHeight: 1,
        }}>Schedule</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <PaperModeToggle mode={mode} />
        <PaperGear />
      </div>
    </div>
  );
}

// Day-row used in the day list (paper card)
function DayRowS({ d }) {
  const isToday = d.state === 'today';
  const isRest  = d.kind === 'rest';
  const stripe  = isRest ? SP.moss : SP.accent;
  const accent  = isRest ? SP.moss : SP.accent;
  const softBg  = isRest ? SP.mossSoft : SP.accentSoft;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '11px 14px 11px 0',
      background: SP.card,
      border: `1px solid ${isToday ? accent : SP.border}`,
      borderRadius: 14,
      boxShadow: isToday ? `0 0 0 3px ${softBg}` : 'none',
      overflow: 'hidden',
    }}>
      <div style={{ width: 4, background: stripe, alignSelf: 'stretch' }}/>
      <div style={{
        width: 36, fontFamily: '"Geist Mono", ui-monospace, monospace',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
        color: isToday ? accent : SP.text3,
      }}>{d.dow}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
          color: isRest && !isToday ? SP.text3 : SP.text,
        }}>{d.name}</div>
        <div style={{ fontSize: 11.5, color: SP.text2, marginTop: 1 }}>{d.meta}</div>
      </div>
      {d.state === 'done' && <CheckS size={20} />}
      {isToday && (
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase',
          background: accent, color: '#FFF', padding: '5px 8px', borderRadius: 999,
        }}>Today</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Selected-day callout (paper card, NOT flooded)
// Strong left stripe in the day-type colour, eyebrow tinted to match,
// outline action button. Used in BOTH week + month modes.
// ─────────────────────────────────────────────────────────────

function SelectedDayCard({ dayMode }) {
  const isSession = dayMode === 'session';
  const accent    = isSession ? SP.accent     : SP.moss;
  const accentDk  = isSession ? CORAL_DARK_S  : MOSS_DARK_S;
  const softBg    = isSession ? SP.accentSoft : SP.mossSoft;

  const data = isSession ? {
    eyebrow: 'Mon 18 May · Session',
    title:   'Limit Bouldering',
    meta:    '~2 hrs · Wall',
    body:    'Project session — work the V6 from last week.',
    tags:    ['Power', 'Project', 'Wall'],
    primary: 'Open session',
  } : {
    eyebrow: 'Sat 23 May · Rest',
    title:   'Active recovery',
    meta:    '~30 min · Home',
    body:    'Walk, mobility, gentle stretching. No board today.',
    tags:    null,
    primary: 'Log recovery',
  };

  return (
    <div style={{
      background: SP.card,
      border: `1px solid ${SP.border}`,
      borderRadius: 18,
      padding: '0',
      display: 'flex', overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(28,26,23,0.04)',
      position: 'relative',
    }}>
      {/* fat left colour stripe */}
      <div style={{ flex: '0 0 6px', background: accent }}/>
      <div style={{ flex: 1, padding: '16px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: accent }}/>
          <span style={{
            fontSize: 10.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: accentDk,
          }}>{data.eyebrow}</span>
        </div>
        <h2 style={{
          fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.05,
          color: SP.text,
        }}>{data.title}</h2>
        <div style={{ fontSize: 12.5, color: SP.text2, marginTop: 4 }}>{data.meta}</div>
        <p style={{
          fontSize: 13, lineHeight: 1.45, margin: '10px 0 0',
          color: SP.text, maxWidth: 290,
        }}>{data.body}</p>
        {data.tags && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {data.tags.map((t) => (
              <span key={t} style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 9px', borderRadius: 999,
                background: softBg, color: accentDk,
              }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button style={{
            background: accent, color: '#FFF',
            padding: '11px 18px', borderRadius: 999,
            fontWeight: 800, fontSize: 13.5, border: 'none', letterSpacing: '0.01em',
          }}>{data.primary}</button>
          <button style={{
            background: 'transparent', color: SP.text,
            padding: '11px 16px', borderRadius: 999,
            fontWeight: 700, fontSize: 13.5, border: `1px solid ${SP.border2}`,
          }}>Skip day</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Week navigator — horizontal week-strip
// ─────────────────────────────────────────────────────────────

function WeekStrip() {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'hidden', paddingBottom: 4 }}>
      {WEEK_STRIP.map((w) => {
        const current = w.current;
        const phaseColor = PHASE_COLORS[w.phase] || SP.text3;
        return (
          <div key={w.n} style={{
            flex: '0 0 64px',
            background: SP.card,
            border: `1px solid ${current ? SP.accent : SP.border}`,
            borderRadius: 12,
            padding: '8px 6px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            boxShadow: current ? `0 0 0 3px ${SP.accentSoft}` : 'none',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: phaseColor,
            }}/>
            <div style={{
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em',
              color: current ? SP.accent : SP.text3, marginTop: 2,
            }}>WK</div>
            <div style={{
              fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
              color: current ? SP.accent : SP.text,
            }}>{w.n}</div>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
              color: current ? SP.accent : SP.text3,
            }}>{w.done}/{w.total}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Week view — Paper direction (A)
// ─────────────────────────────────────────────────────────────

function ScheduleWeekA({ LogoComponent, dayMode = 'session' }) {
  const days = dayMode === 'session' ? WEEK_DAYS_SESSION : WEEK_DAYS_REST;

  return (
    <PhoneShellS LogoComponent={LogoComponent}>
      <div style={{
        padding: '64px 20px 20px', height: '100%', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <ScheduleHeader mode="week" />

        {/* Week navigator */}
        <WeekStrip />

        {/* Selected-day callout */}
        <SelectedDayCard dayMode={dayMode} />

        {/* Phase progress — slim row, not a card */}
        <div style={{ padding: '0 2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SP.text }}>
              <span style={{ color: SP.accent }}>Foundation</span>{' '}
              <span style={{ color: SP.text3, fontWeight: 600 }}>· Wk 1 of 4 · 17–23 May</span>
            </div>
            <div style={{ fontSize: 11, color: SP.text3, fontFamily: '"Geist Mono", ui-monospace, monospace' }}>25%</div>
          </div>
          <div style={{ height: 6, background: SP.card2, borderRadius: 999, overflow: 'hidden', border: `1px solid ${SP.border}` }}>
            <div style={{ width: '25%', height: '100%', background: SP.accent, borderRadius: 999 }}/>
          </div>
        </div>

        {/* Day list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>Days</h3>
            <span style={{
              fontSize: 10.5, color: SP.text3,
              fontFamily: '"Geist Mono", ui-monospace, monospace', letterSpacing: '0.06em',
            }}>{dayMode === 'session' ? '0 / 5 DONE' : '5 / 5 DONE'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {days.slice(0, dayMode === 'session' ? 3 : 3).map((d) => <DayRowS key={d.dow} d={d} />)}
          </div>
        </div>

        <TabBarS active="schedule" />
      </div>
    </PhoneShellS>
  );
}

// ─────────────────────────────────────────────────────────────
// Month grid
// ─────────────────────────────────────────────────────────────

// May 2026: 1st is Friday, 31 days.
const MAY_GRID_SESSION = [
  [null, null, null, null, { d:1, ph:'foundation' }, { d:2, ph:'foundation' }, { d:3, ph:'foundation' }],
  [{ d:4, ph:'foundation' }, { d:5, ph:'foundation' }, { d:6, ph:'foundation' }, { d:7, ph:'foundation' }, { d:8, ph:'foundation' }, { d:9, ph:'foundation' }, { d:10, ph:'foundation' }],
  [{ d:11, ph:'foundation' }, { d:12, ph:'foundation' }, { d:13, ph:'foundation' }, { d:14, ph:'foundation' }, { d:15, ph:'foundation' }, { d:16, ph:'foundation' }, { d:17, ph:'foundation' }],
  [{ d:18, ph:'foundation', selected:true, today:true, session:true }, { d:19, ph:'foundation' }, { d:20, ph:'foundation' }, { d:21, ph:'foundation' }, { d:22, ph:'foundation' }, { d:23, ph:'foundation' }, { d:24, ph:'foundation' }],
  [{ d:25, ph:'build' }, { d:26, ph:'build' }, { d:27, ph:'build' }, { d:28, ph:'build' }, { d:29, ph:'build' }, { d:30, ph:'build' }, { d:31, ph:'build' }],
];

const MAY_GRID_REST = [
  [null, null, null, null, { d:1, ph:'foundation', done:true }, { d:2, ph:'foundation', done:true }, { d:3, ph:'foundation', done:true }],
  [{ d:4, ph:'foundation', done:true }, { d:5, ph:'foundation', done:true }, { d:6, ph:'foundation', done:true }, { d:7, ph:'foundation', done:true }, { d:8, ph:'foundation', done:true }, { d:9, ph:'foundation', done:true }, { d:10, ph:'foundation', done:true }],
  [{ d:11, ph:'foundation', done:true }, { d:12, ph:'foundation', done:true }, { d:13, ph:'foundation', done:true }, { d:14, ph:'foundation', done:true }, { d:15, ph:'foundation', done:true }, { d:16, ph:'foundation', done:true }, { d:17, ph:'foundation', done:true }],
  [{ d:18, ph:'foundation', done:true }, { d:19, ph:'foundation', done:true }, { d:20, ph:'foundation', done:true }, { d:21, ph:'foundation', done:true }, { d:22, ph:'foundation', done:true }, { d:23, ph:'foundation', selected:true, today:true, rest:true }, { d:24, ph:'foundation' }],
  [{ d:25, ph:'build' }, { d:26, ph:'build' }, { d:27, ph:'build' }, { d:28, ph:'build' }, { d:29, ph:'build' }, { d:30, ph:'build' }, { d:31, ph:'build' }],
];

function MonthGrid({ grid, selectedColor }) {
  const cell = (c, k) => {
    if (!c) return <div key={k} style={{ aspectRatio: '1' }}/>;
    const phaseColor = PHASE_COLORS[c.ph] || SP.text3;
    const isSel = c.selected;
    return (
      <div key={k} style={{
        position: 'relative',
        aspectRatio: '1',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 4,
        borderRadius: 12,
        background: isSel ? selectedColor : 'transparent',
        color: isSel ? '#FFF' : (c.done ? SP.text3 : SP.text),
        fontSize: 14, fontWeight: 600,
      }}>
        <span style={{ lineHeight: 1 }}>{c.d}</span>
        <span style={{
          width: 18, height: 3, borderRadius: 2,
          background: isSel ? 'rgba(255,255,255,0.7)' : phaseColor,
          opacity: c.done && !isSel ? 0.4 : 1,
        }}/>
      </div>
    );
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{
            fontFamily: '"Geist Mono", ui-monospace, monospace',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            color: SP.text3, textAlign: 'center',
          }}>{d}</div>
        ))}
      </div>
      {grid.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {row.map((c, ci) => cell(c, ci))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Month view — Paper direction (A)
// ─────────────────────────────────────────────────────────────

function ScheduleMonthA({ LogoComponent, dayMode = 'session' }) {
  const isSession = dayMode === 'session';
  const accent    = isSession ? SP.accent : SP.moss;
  const grid      = isSession ? MAY_GRID_SESSION : MAY_GRID_REST;

  return (
    <PhoneShellS LogoComponent={LogoComponent}>
      <div style={{
        padding: '64px 20px 20px', height: '100%', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <ScheduleHeader mode="month" />

        {/* Month navigator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2px',
        }}>
          <button style={{
            width: 32, height: 32, borderRadius: 999,
            background: SP.card, border: `1px solid ${SP.border}`,
            display: 'grid', placeItems: 'center', color: SP.text2,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>May 2026</div>
          <button style={{
            width: 32, height: 32, borderRadius: 999,
            background: SP.card, border: `1px solid ${SP.border}`,
            display: 'grid', placeItems: 'center', color: SP.text2,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <MonthGrid grid={grid} selectedColor={accent} />

        {/* Phase legend */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12,
          padding: '2px 2px 0',
          fontSize: 10.5, color: SP.text2,
        }}>
          {[
            { name: 'Foundation', color: PHASE_COLORS.foundation },
            { name: 'Build',      color: PHASE_COLORS.build },
            { name: 'Power Endurance', color: PHASE_COLORS.power },
            { name: 'Performance', color: PHASE_COLORS.perf },
          ].map((p) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 3, background: p.color, borderRadius: 2, display: 'block' }}/>
              <span>{p.name}</span>
            </div>
          ))}
        </div>

        {/* Selected-day callout */}
        <SelectedDayCard dayMode={dayMode} />

        <TabBarS active="schedule" />
      </div>
    </PhoneShellS>
  );
}

// ─────────────────────────────────────────────────────────────
// Editorial direction (B) — magazine-style schedule. Same palette,
// but with a hairline-divided header, large mono labels, and a
// huge day-code numeral for the selected day.
// ─────────────────────────────────────────────────────────────

function ScheduleWeekEditorial({ LogoComponent, dayMode = 'session' }) {
  const isSession = dayMode === 'session';
  const accent    = isSession ? SP.accent     : SP.moss;
  const accentDk  = isSession ? CORAL_DARK_S  : MOSS_DARK_S;
  const softBg    = isSession ? SP.accentSoft : SP.mossSoft;
  const days      = isSession ? WEEK_DAYS_SESSION : WEEK_DAYS_REST;

  const data = isSession ? {
    big: '18', dow: 'MON', date: 'May 26',
    title: 'Limit Bouldering',
    meta: '~2 hrs · Wall',
    note: 'Project session — V6 from last week.',
    tag: 'Session day',
  } : {
    big: '23', dow: 'SAT', date: 'May 26',
    title: 'Active recovery',
    meta: '~30 min · Home',
    note: 'Walk, mobility, gentle stretching.',
    tag: 'Rest day',
  };

  return (
    <PhoneShellS LogoComponent={LogoComponent}>
      <div style={{
        padding: '60px 0 20px', height: '100%', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Editorial masthead */}
        <div style={{ padding: '0 20px 12px', borderBottom: `1.5px solid ${SP.text}` }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            fontFamily: '"Geist Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: SP.text2,
          }}>
            <span>Send · Plan · Wk 1/16</span>
            <span>Foundation</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginTop: 6,
          }}>
            <h1 style={{
              fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em',
              margin: 0, lineHeight: 0.9,
            }}>Schedule<span style={{ color: SP.accent }}>.</span></h1>
            <PaperModeToggle mode="week" />
          </div>
        </div>

        {/* Hero — big day code + selected-day */}
        <div style={{
          padding: '18px 20px 18px',
          display: 'flex', gap: 16, alignItems: 'flex-start',
        }}>
          <div style={{ flex: '0 0 96px' }}>
            <div style={{
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
              color: SP.text3, textTransform: 'uppercase', marginBottom: 4,
            }}>{data.dow}</div>
            <div style={{
              fontSize: 92, fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 0.85,
              color: accent,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            }}>{data.big}</div>
            <div style={{
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
              color: SP.text3, textTransform: 'uppercase', marginTop: 4,
            }}>{data.date}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 8px', background: softBg, borderRadius: 4,
            }}>
              <span style={{ width: 6, height: 6, background: accent, borderRadius: 999 }}/>
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: accentDk,
              }}>{data.tag}</span>
            </div>
            <h2 style={{
              fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
              margin: '8px 0 0', lineHeight: 1.05,
            }}>{data.title}</h2>
            <div style={{ fontSize: 12.5, color: SP.text2, marginTop: 4 }}>{data.meta}</div>
            <p style={{
              fontSize: 12.5, color: SP.text, lineHeight: 1.5, margin: '8px 0 0',
            }}>{data.note}</p>
            <button style={{
              background: accent, color: '#FFF',
              padding: '9px 14px', borderRadius: 999,
              fontWeight: 800, fontSize: 12, border: 'none',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              marginTop: 12,
            }}>{isSession ? 'Open session' : 'Log recovery'}</button>
          </div>
        </div>

        {/* Week strip — also editorial: just rows of phase blocks + week n */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
          }}>
            {WEEK_STRIP.map((w) => {
              const current = w.current;
              const phaseColor = PHASE_COLORS[w.phase] || SP.text3;
              return (
                <div key={w.n} style={{
                  textAlign: 'center', padding: '8px 0 6px',
                  borderTop: `3px solid ${phaseColor}`,
                  borderBottom: current ? `2px solid ${SP.text}` : 'none',
                }}>
                  <div style={{
                    fontFamily: '"Geist Mono", ui-monospace, monospace',
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                    color: current ? SP.text : SP.text3, textTransform: 'uppercase',
                  }}>WK</div>
                  <div style={{
                    fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
                    color: current ? SP.text : SP.text2, lineHeight: 1,
                  }}>{w.n}</div>
                  <div style={{
                    fontSize: 9, fontWeight: 600,
                    color: current ? SP.text2 : SP.text3,
                  }}>{w.done}/{w.total}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section label */}
        <div style={{
          padding: '20px 20px 8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, background: accent }}/>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>This week</h3>
          </div>
          <span style={{
            fontSize: 10.5, color: SP.text3,
            fontFamily: '"Geist Mono", ui-monospace, monospace',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>17–23 May · Customised</span>
        </div>

        {/* Day list — editorial rows */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
          {days.slice(0, 4).map((d, i, arr) => (
            <DayRowEditorial key={d.dow} d={d} last={i === arr.length - 1} />
          ))}
        </div>

        <TabBarS active="schedule" />
      </div>
    </PhoneShellS>
  );
}

function DayRowEditorial({ d, last }) {
  const isToday = d.state === 'today';
  const isRest  = d.kind === 'rest';
  const accent  = isRest ? SP.moss : SP.accent;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '52px 1fr auto',
      gap: 12, alignItems: 'center',
      padding: '12px 0',
      borderBottom: last ? 'none' : `1px solid ${SP.border}`,
    }}>
      <div style={{
        fontFamily: '"Geist Mono", ui-monospace, monospace',
        fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
        color: isToday ? accent : SP.text,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ width: 3, height: 22, background: accent, borderRadius: 2 }}/>
        {d.dow}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
          color: isRest && !isToday ? SP.text3 : SP.text,
        }}>{d.name}</div>
        <div style={{ fontSize: 11.5, color: SP.text2, marginTop: 1 }}>{d.meta}</div>
      </div>
      <div>
        {d.state === 'done' && <CheckS size={20} color={SP.moss}/>}
        {isToday && (
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: SP.text, color: SP.bg, padding: '5px 8px', borderRadius: 2,
          }}>Now</span>
        )}
        {d.state === 'upcoming' && <span style={{ fontSize: 10, color: SP.text3 }}>—</span>}
      </div>
    </div>
  );
}

Object.assign(window, { ScheduleWeekA, ScheduleMonthA, ScheduleWeekEditorial });
