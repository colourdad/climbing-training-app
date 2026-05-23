// Bright iOS-native color palette applied to the Send app's key screens.
// Mirrors the existing app structure (Today hero, Schedule, Progress) but
// trades the slate/sand/moss-on-near-black for warm paper, pure whites, and
// a single confident coral accent.

const PALETTE = {
  bg: '#F5F2EC',
  card: '#FFFFFF',
  card2: '#FAF7F1',
  text: '#1C1A17',
  text2: '#6B6660',
  text3: '#B8B2A8',
  border: 'rgba(28, 26, 23, 0.07)',
  border2: 'rgba(28, 26, 23, 0.14)',
  accent: '#E94B2C',
  accentSoft: 'rgba(233, 75, 44, 0.10)',
  moss: '#2E7D55',
  mossSoft: 'rgba(46, 125, 85, 0.12)',
};

// Phone shell that any screen renders into.
function Phone({ children, statusBg = PALETTE.bg, LogoComponent }) {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: PALETTE.bg,
        borderRadius: 56,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 30px 60px -20px rgba(28,26,23,0.18)',
        border: '1px solid rgba(28,26,23,0.08)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Geist", system-ui, sans-serif',
        color: PALETTE.text,
        fontSize: 15,
        lineHeight: 1.4,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 54,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '0 32px 8px', fontSize: 15, fontWeight: 600,
        background: statusBg, zIndex: 10,
      }}>
        <span>9:41</span>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', left: '50%', top: 11,
          transform: 'translateX(-50%)',
          width: 122, height: 36, background: '#000', borderRadius: 999,
        }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* signal */}
          <svg width="18" height="12" viewBox="0 0 18 12"><g fill={PALETTE.text}><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></g></svg>
          {/* battery */}
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke={PALETTE.text} opacity="0.4"/><rect x="2" y="2" width="19" height="8" rx="1.5" fill={PALETTE.text}/><rect x="23.5" y="4" width="2" height="4" rx="1" fill={PALETTE.text} opacity="0.4"/></svg>
        </div>
      </div>
      {children}
    </div>
  );
}

// Small pill
function Pill({ children, color = PALETTE.text2, bg = PALETTE.card2, border = PALETTE.border }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em',
      padding: '4px 9px', borderRadius: 999,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      {children}
    </span>
  );
}

function Dot({ color, size = 6 }) {
  return <span style={{ width: size, height: size, background: color, borderRadius: 999, display: 'inline-block' }} />;
}

// ============================================================================
// TODAY screen — hero session, stats, today's exercises peek
// ============================================================================
function TodayScreen({ LogoComponent }) {
  return (
    <Phone LogoComponent={LogoComponent}>
      <div style={{ padding: '64px 20px 20px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: PALETTE.text2, marginBottom: 2 }}>
              Monday · Week 2
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Today</h1>
          </div>
          <div style={{
            width: 40, height: 40, background: PALETTE.card,
            border: `1px solid ${PALETTE.border}`, borderRadius: 999,
            display: 'grid', placeItems: 'center',
          }}>
            {LogoComponent && <LogoComponent size={28} />}
          </div>
        </div>

        {/* Hero session card */}
        <div style={{
          background: PALETTE.card,
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 24,
          padding: '20px 20px 22px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(28,26,23,0.04)',
        }}>
          {/* corner glow */}
          <div style={{
            position: 'absolute', top: -80, right: -80, width: 220, height: 220,
            background: `radial-gradient(circle, ${PALETTE.accentSoft}, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: PALETTE.accent }}>
              Next up · 60 min
            </span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px', lineHeight: 1.1 }}>
            Max Hang &amp; Pull
          </h2>
          <div style={{ fontSize: 13, color: PALETTE.text2, marginBottom: 18 }}>
            Fingerboard · Weighted pull-ups · Core
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            <Pill color={PALETTE.accent} bg={PALETTE.accentSoft} border="transparent"><Dot color={PALETTE.accent}/>Strength</Pill>
            <Pill><Dot color="#4A6FA8"/>Fingers</Pill>
            <Pill><Dot color="#7A5BA8"/>Pull</Pill>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 11, color: PALETTE.text3, letterSpacing: '0.05em' }}>6 exercises</div>
            </div>
            <button style={{
              background: PALETTE.accent, color: '#FFFFFF',
              padding: '12px 22px', borderRadius: 999,
              fontWeight: 700, fontSize: 14, letterSpacing: '0.01em',
              border: 'none',
            }}>
              Start session
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Phase', value: 'Build', sub: 'Wk 2 of 4' },
            { label: 'Streak', value: '6', sub: 'sessions' },
            { label: 'Plan', value: '12%', sub: 'complete' },
          ].map((s, i) => (
            <div key={i} style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 16, padding: '12px 12px 14px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: PALETTE.text2, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: PALETTE.text3, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* This week peek */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>This week</h3>
            <span style={{ fontSize: 12, color: PALETTE.text2 }}>3 sessions · 1 rest</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { dow: 'MON', name: 'Max Hang & Pull', meta: '60 min · Strength', state: 'today' },
              { dow: 'TUE', name: 'Rest', meta: 'Active recovery', state: 'rest' },
              { dow: 'WED', name: 'Boulder Project', meta: '90 min · Power', state: 'upcoming' },
              { dow: 'FRI', name: 'Endurance ARC', meta: '75 min · Aerobic', state: 'upcoming' },
            ].map((d) => (
              <div key={d.dow} style={{
                background: PALETTE.card,
                border: `1px solid ${d.state === 'today' ? PALETTE.accent : PALETTE.border}`,
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: d.state === 'today' ? `0 0 0 3px ${PALETTE.accentSoft}` : 'none',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  color: d.state === 'today' ? PALETTE.accent : PALETTE.text2,
                  width: 32, flex: '0 0 32px',
                }}>
                  {d.dow}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: d.state === 'rest' ? PALETTE.text3 : PALETTE.text }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: 12, color: PALETTE.text2, marginTop: 1 }}>{d.meta}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 999,
                  border: `2px solid ${d.state === 'today' ? PALETTE.accent : PALETTE.border2}`,
                  background: 'transparent',
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar (bottom) */}
        <TabBar active="today" />
      </div>
    </Phone>
  );
}

// ============================================================================
// SESSION DETAIL screen — inside a workout, exercises with timer
// ============================================================================
function SessionScreen({ LogoComponent }) {
  return (
    <Phone LogoComponent={LogoComponent}>
      <div style={{ padding: '64px 20px 20px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* back row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: PALETTE.accent, fontSize: 15, fontWeight: 600, marginTop: -4 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Today
        </div>

        {/* header */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: PALETTE.text2 }}>
            Session 1 · 60 min
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0 4px', lineHeight: 1.05 }}>Max Hang &amp; Pull</h1>
          <div style={{ fontSize: 13, color: PALETTE.text2 }}>6 exercises · 2 done</div>
        </div>

        {/* exercise list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {[
            { name: 'Warm-up · Easy boulders', meta: '10 min · v0–v2', done: true, expanded: false },
            { name: 'Hangboard repeaters', meta: '7 sets · 10mm edge', done: true, expanded: false },
            { name: 'Weighted pull-ups', meta: '5 × 5 · +12 kg', done: false, expanded: true },
            { name: 'Front lever progression', meta: '4 sets', done: false, expanded: false },
            { name: 'Antagonist push', meta: '3 × 12', done: false, expanded: false },
          ].map((ex, i) => (
            <div key={i} style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 16, overflow: 'hidden',
              opacity: ex.done ? 0.55 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 999,
                  background: ex.done ? PALETTE.moss : 'transparent',
                  border: `2px solid ${ex.done ? PALETTE.moss : PALETTE.border2}`,
                  display: 'grid', placeItems: 'center', flex: '0 0 24px',
                }}>
                  {ex.done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6 L5 9 L10 3" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                    textDecoration: ex.done ? 'line-through' : 'none',
                  }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: PALETTE.text2, marginTop: 1 }}>{ex.meta}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: ex.expanded ? 'rotate(180deg)' : 'none', color: ex.expanded ? PALETTE.accent : PALETTE.text3 }}><path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {ex.expanded && (
                <div style={{ background: PALETTE.card2, padding: '14px', borderTop: `1px solid ${PALETTE.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PALETTE.text3, marginBottom: 6 }}>
                    How to
                  </div>
                  <div style={{ fontSize: 13, color: PALETTE.text, lineHeight: 1.5, marginBottom: 12 }}>
                    5 reps with bodyweight + 12kg. Slow eccentric, full lockout at top. 3 min rest between sets.
                  </div>
                  {/* Timer */}
                  <div style={{
                    background: PALETTE.card,
                    border: `1px solid ${PALETTE.border2}`,
                    borderRadius: 14, padding: 12,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: PALETTE.accent }}>
                        Rest timer
                      </span>
                      <span style={{ fontSize: 12, color: PALETTE.text3 }}>3:00 default</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button style={{ width: 48, padding: '8px', background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: 8, fontWeight: 700, color: PALETTE.text2, fontSize: 13 }}>−15</button>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>2:42</div>
                      <button style={{ width: 48, padding: '8px', background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: 8, fontWeight: 700, color: PALETTE.text2, fontSize: 13 }}>+15</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button style={{ flex: 1, background: PALETTE.moss, color: '#FFF', padding: 12, borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none' }}>
                        Start
                      </button>
                      <button style={{ flex: '0 0 48px', background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, color: PALETTE.text2, padding: 12, borderRadius: 10, fontWeight: 700 }}>↺</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <TabBar active="today" />
      </div>
    </Phone>
  );
}

// ============================================================================
// PROGRESS screen — heatmap + phase bars
// ============================================================================
function ProgressScreen({ LogoComponent }) {
  // 16 weeks × 7 days heatmap state
  const phases = [
    { name: 'Base', weeks: 4, color: '#4A6FA8' },
    { name: 'Build', weeks: 4, color: PALETTE.accent },
    { name: 'Peak', weeks: 4, color: '#A85B7A' },
    { name: 'Taper', weeks: 2, color: '#7A5BA8' },
    { name: 'Send', weeks: 2, color: PALETTE.moss },
  ];

  // Pseudo-random fill for the heatmap, deterministic by index
  const cellState = (w, d) => {
    if (w > 1 || (w === 1 && d > 0)) return 'future'; // only week 0 + Mon of wk1 filled
    if (d === 1 || d === 5) return 'rest';
    const seed = (w * 7 + d) * 19;
    const r = (seed * 2654435761 >>> 0) % 100;
    if (w === 1 && d === 0) return 'today';
    return r > 80 ? 'partial' : 'done';
  };

  return (
    <Phone LogoComponent={LogoComponent}>
      <div style={{ padding: '64px 20px 20px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: PALETTE.text2 }}>
            16 weeks · V6 → V7+
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0 0' }}>Progress</h1>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: '14px 14px 16px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: PALETTE.text2, marginBottom: 6 }}>Completed</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>6 <span style={{ fontSize: 14, color: PALETTE.text3, fontWeight: 600 }}>/ 52</span></div>
            <div style={{ fontSize: 11, color: PALETTE.text3, marginTop: 4 }}>sessions</div>
          </div>
          <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: '14px 14px 16px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: PALETTE.text2, marginBottom: 6 }}>Avg effort</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 2 }}>3.8<span style={{ fontSize: 14, color: PALETTE.text3, fontWeight: 600 }}>/5</span></div>
            <div style={{ fontSize: 11, color: PALETTE.text3, marginTop: 4 }}>last 4 weeks</div>
          </div>
        </div>

        {/* Heatmap */}
        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 18, padding: '16px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>16-week plan</h3>
            <span style={{ fontSize: 11, color: PALETTE.text2 }}>Wk 2 · Build</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '24px repeat(7, 1fr)', gap: 4 }}>
            {/* col headers */}
            <div />
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ fontSize: 9, fontWeight: 700, color: PALETTE.text3, textAlign: 'center', letterSpacing: '0.06em' }}>{d}</div>
            ))}
            {/* rows */}
            {Array.from({ length: 16 }).map((_, w) => (
              <React.Fragment key={w}>
                <div style={{ fontSize: 9, fontWeight: 700, color: PALETTE.text3, textAlign: 'right', alignSelf: 'center' }}>{w + 1}</div>
                {Array.from({ length: 7 }).map((_, d) => {
                  const s = cellState(w, d);
                  let bg = PALETTE.card2, border = PALETTE.border, color = 'transparent';
                  if (s === 'rest') { bg = PALETTE.card2; }
                  if (s === 'future') { bg = '#F0EDE6'; }
                  if (s === 'partial') { bg = 'rgba(46, 125, 85, 0.45)'; border = 'transparent'; }
                  if (s === 'done') { bg = PALETTE.moss; border = 'transparent'; }
                  if (s === 'today') {
                    bg = 'transparent';
                    border = PALETTE.accent;
                  }
                  return (
                    <div key={d} style={{
                      aspectRatio: '1', borderRadius: 4, background: bg,
                      border: s === 'today' ? `2px solid ${PALETTE.accent}` : `1px solid ${border}`,
                      boxShadow: s === 'today' ? `0 0 0 2px ${PALETTE.bg}, 0 0 0 4px ${PALETTE.accent}` : 'none',
                    }}/>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Phase progress bars */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', margin: '0 0 10px' }}>Phases</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {phases.map((p, i) => {
              const pct = i === 0 ? 100 : i === 1 ? 25 : 0;
              return (
                <div key={p.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: PALETTE.text }}>{p.name}</span>
                    <span style={{ color: PALETTE.text2 }}>{p.weeks} wk · {pct}%</span>
                  </div>
                  <div style={{ height: 6, background: PALETTE.card2, borderRadius: 999, overflow: 'hidden', border: `1px solid ${PALETTE.border}` }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 999 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <TabBar active="progress" />
      </div>
    </Phone>
  );
}

// ============================================================================
// Tab bar — used by all screens
// ============================================================================
function TabBar({ active = 'today' }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: <path d="M3 11 L12 4 L21 11 V20 H14 V14 H10 V20 H3 Z" /> },
    { id: 'schedule', label: 'Plan', icon: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9 H20"/><path d="M9 3 V7 M15 3 V7"/></> },
    { id: 'progress', label: 'Progress', icon: <><path d="M4 19 V11 M9 19 V7 M14 19 V13 M19 19 V5"/></> },
    { id: 'notes', label: 'Diary', icon: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8 H16 M8 12 H16 M8 16 H13"/></> },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '8px 12px 28px',
      background: 'rgba(255, 255, 255, 0.78)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderTop: `1px solid ${PALETTE.border}`,
      display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: active === t.id ? PALETTE.accent : PALETTE.text3,
          fontSize: 10, fontWeight: 600, letterSpacing: '0.02em',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {t.icon}
          </svg>
          {t.label}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// iPhone Home Screen mockup — to show the icon in real context
// ============================================================================
function HomeScreen({ LogoComponent, logoName }) {
  // Apple-y placeholder app icons
  const apps = [
    { c: '#5B7CFB', g: '⚙' }, // Settings-ish
    { c: '#34C759', g: '☎' }, // Phone
    { c: '#0A7AFF', g: '✉' }, // Messages
    { c: '#FF3B30', g: '♥' }, // Health
    { c: '#FF9500', g: '◷' }, // Clock
    { c: '#5856D6', g: '☼' }, // Weather
    { c: '#FFCC00', g: '✎' }, // Notes
    { c: '#FF2D55', g: '♪' }, // Music
  ];
  return (
    <div style={{
      width: 390, height: 844, borderRadius: 56,
      background: 'linear-gradient(180deg, #FFD0B5 0%, #FFA078 45%, #C2553A 100%)',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 30px 60px -20px rgba(28,26,23,0.22)',
      border: '1px solid rgba(28,26,23,0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    }}>
      {/* status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 54,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '0 32px 8px', fontSize: 15, fontWeight: 600, color: '#FFF',
        zIndex: 10,
      }}>
        <span>9:41</span>
        <div style={{ position: 'absolute', left: '50%', top: 11, transform: 'translateX(-50%)', width: 122, height: 36, background: '#000', borderRadius: 999 }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="18" height="12" viewBox="0 0 18 12"><g fill="#FFF"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></g></svg>
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="#FFF" opacity="0.6"/><rect x="2" y="2" width="19" height="8" rx="1.5" fill="#FFF"/><rect x="23.5" y="4" width="2" height="4" rx="1" fill="#FFF" opacity="0.6"/></svg>
        </div>
      </div>

      {/* app grid */}
      <div style={{
        position: 'absolute', top: 74, left: 24, right: 24,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px 18px',
      }}>
        {/* Send goes first, top-left */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          }}>
            <LogoComponent size={68} />
          </div>
          <div style={{ color: '#FFF', fontSize: 11.5, fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Send</div>
        </div>
        {apps.slice(0, 7).map((a, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 16,
              background: a.c, color: '#FFF',
              display: 'grid', placeItems: 'center',
              fontSize: 32, lineHeight: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            }}>{a.g}</div>
            <div style={{ width: 50, height: 8, background: 'rgba(255,255,255,0.55)', borderRadius: 2 }}/>
          </div>
        ))}
        {/* row 2: more placeholders */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 16,
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}/>
            <div style={{ width: 40, height: 8, background: 'rgba(255,255,255,0.45)', borderRadius: 2 }}/>
          </div>
        ))}
      </div>

      {/* dock */}
      <div style={{
        position: 'absolute', bottom: 28, left: 18, right: 18, height: 96,
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderRadius: 30,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center', padding: '0 14px',
      }}>
        {['#34C759','#0A7AFF','#FF3B30','#FF9500'].map((c, i) => (
          <div key={i} style={{ display: 'grid', placeItems: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: c, boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            }}/>
          </div>
        ))}
      </div>
      {/* home indicator */}
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, background: '#FFF', borderRadius: 3, opacity: 0.95 }}/>
    </div>
  );
}

Object.assign(window, {
  Phone, TodayScreen, SessionScreen, ProgressScreen, HomeScreen, PALETTE,
});
