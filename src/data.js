// ============================================================================
// CLIMBING TRAINING PLAN · V6 to V7+ · 16 weeks
// Week 1 begins Monday 18 May 2026.
// All training data is hardcoded from the source plan. No manual entry.
// ============================================================================

export const PLAN_START_DATE = '2026-05-18'; // Monday, week 1, day 0

// ----------------------------------------------------------------------------
// Skill categories (the 8 colour-coded pills)
// ----------------------------------------------------------------------------
export const SKILL_CATEGORIES = {
  finger_prehab:      { label: 'Finger Prehab',      color: '#6E94A8', short: 'Prehab' },
  base_strength:      { label: 'Base Strength',      color: '#94A3B8', short: 'Base' },
  max_strength:       { label: 'Max Strength',       color: '#C2A878', short: 'Max' },
  power:              { label: 'Power',              color: '#D97757', short: 'Power' },
  muscular_endurance: { label: 'Muscular Endurance', color: '#B88A6F', short: 'Endurance' },
  body_tension:       { label: 'Body Tension',       color: '#7A9E5F', short: 'Tension' },
  mobility:           { label: 'Mobility',           color: '#4F8585', short: 'Mobility' },
  technique:          { label: 'Technique',          color: '#A8957A', short: 'Technique' },
};

export const SKILL_ORDER = [
  'finger_prehab', 'base_strength', 'max_strength', 'power',
  'muscular_endurance', 'body_tension', 'mobility', 'technique',
];

// ----------------------------------------------------------------------------
// Training phases
// ----------------------------------------------------------------------------
export const PHASES = [
  {
    id: 1,
    name: 'Foundation',
    weeks: [1, 2, 3, 4, 5, 6],
    accent: '#7A9E5F', // moss green
    focus: 'Build volume at V4–V6. Prioritise quality movement over hard grades. Let tendons adapt before pushing limits.',
    limitGrade: 'V6–V7',
    deloadWeek: 6,
  },
  {
    id: 2,
    name: 'Strength',
    weeks: [7, 8, 9, 10, 11, 12],
    accent: '#C2A878', // warm sand
    focus: 'Push into V7–V8 territory. Drop problem count, increase rest. Begin projecting — chip away at problems that feel impossible.',
    limitGrade: 'V7–V8',
    deloadWeek: 12,
  },
  {
    id: 3,
    name: 'Peak',
    weeks: [13, 14, 15, 16],
    accent: '#D97757', // warm rust
    focus: 'Sharpen and consolidate. Add power endurance. Taper the last two weeks to arrive at outdoor season fresh.',
    limitGrade: 'V7–V8+',
    deloadWeek: null,
    taperWeeks: [15, 16],
  },
];

export function getPhase(weekNumber) {
  return PHASES.find(p => p.weeks.includes(weekNumber));
}

// ----------------------------------------------------------------------------
// Session templates
// Each session has exercises with sets/rest/category/progression notes.
// `limit` and `tech` adjust their limit-bouldering line based on phase.
// ----------------------------------------------------------------------------

const limitExercises = (phase, deload = false) => [
  {
    id: 'warmup',
    name: 'Joint warm-up',
    sets: '10 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Wrist circles, finger extensions, tendon glides.',
    progression: 'Non-negotiable with tweaky fingers — never skip or rush it.',
  },
  {
    id: 'easy',
    name: 'Easy climbing',
    sets: '20 min · V1–V4',
    rest: '—',
    category: 'technique',
    notes: 'Kilter at a low angle. Open-hand grip only until fully warm.',
    progression: 'Focus on feet. No crimping cold, ever.',
  },
  {
    id: 'moderate',
    name: 'Moderate zone',
    sets: deload ? '15 min · V4–V5' : '20 min · V4–V6',
    rest: '2–3 min',
    category: 'technique',
    notes: deload ? '2–3 problems, ramp up progressively.' : '3–4 problems, ramp up progressively.',
    progression: 'Movement quality > grade.',
  },
  {
    id: 'limit',
    name: 'Limit bouldering',
    sets: deload ? `4–5 attempts · ${phase.limitGrade}` : `6–10 attempts · ${phase.limitGrade}`,
    rest: '3–5 min',
    category: 'max_strength',
    notes: deload
      ? 'Light projecting only — deload week. Step back from your hardest project.'
      : `Aim for problems with ~20–40% chance of completing today. ${phase.id === 1 ? 'Kilter for tension, Tension Board for compression.' : 'Project — chip away systematically.'}`,
    progression: phase.id === 2
      ? 'Deconstruct the crux move. Finger strength? Body position? Footwork? Commitment? Solve that.'
      : phase.id === 3 ? 'Stay sharp — do not accumulate fatigue.' : 'Kilter at 20–25°. Earn steeper angles.',
  },
  {
    id: 'cooldown',
    name: 'Prehab cool-down',
    sets: '10 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Rubber band finger extensions, wrist rotations, shoulder openers.',
    progression: 'Massage any tweaky spots. Contrast soak if inflamed.',
  },
];

const volumeExercises = (deload = false) => [
  {
    id: 'warmup',
    name: 'Thorough warm-up',
    sets: '25 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Same warm-up as limit days — never rushed.',
    progression: 'Open-hand only until fully warm.',
  },
  {
    id: '4x4',
    name: '4x4 circuits',
    sets: deload ? '2 rounds · V4' : '4 rounds · V4–V5',
    rest: '3–4 min between rounds',
    category: 'muscular_endurance',
    notes: deload
      ? '4 problems back-to-back, repeat 2 rounds (40% cut).'
      : '4 problems back-to-back, repeat 4 rounds. On Tension Board, lap 1–2 problems to the same effect.',
    progression: 'Heart rate up. Form holds together to the last problem.',
  },
  {
    id: 'project',
    name: 'Project burns',
    sets: deload ? 'Skip on deload' : '3–5 attempts',
    rest: '3 min',
    category: 'max_strength',
    notes: deload ? 'Optional — only if feeling fresh.' : 'One notch below your absolute limit today.',
    progression: 'Quality over quantity.',
  },
  {
    id: 'core',
    name: 'Core & cool-down',
    sets: 'Hollow body 3x30s · Dead bugs 3x10',
    rest: '60 sec',
    category: 'body_tension',
    notes: 'Stretch and cool down.',
    progression: 'Hollow body → with rocks → with weight plate.',
  },
];

const techExercises = (deload = false) => [
  {
    id: 'warmup',
    name: 'Finger warm-up',
    sets: '15 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Thorough — slightly shorter than limit days but still essential.',
    progression: 'Open-hand only until fully warm.',
  },
  {
    id: 'intentional',
    name: 'Intentional movement',
    sets: deload ? '30 min · 2 grades below limit' : '45 min · 1–2 grades below limit',
    rest: 'Generous',
    category: 'technique',
    notes: 'Silent feet, deliberate hip positioning, read sequence before leaving the ground.',
    progression: 'Every rep counts. No mindless lapping.',
  },
  {
    id: 'flow',
    name: 'Flow laps',
    sets: '10 min',
    rest: 'Minimal',
    category: 'technique',
    notes: 'Comfortable-but-not-easy problems. Stay in flow state.',
    progression: 'Builds movement endurance and reinforces good patterns.',
  },
  {
    id: 'reflect',
    name: 'Cool-down & reflect',
    sets: '5 min',
    rest: '—',
    category: 'mobility',
    notes: 'Note 1–2 movement lessons from the session.',
    progression: 'Five minutes of reflection is worth 30 of mindless lapping.',
  },
];

const ringsExercises = () => [
  {
    id: 'rows',
    name: 'Rows',
    sets: '3 × 8–12',
    rest: '90 sec',
    category: 'base_strength',
    notes: 'Feet on floor to start.',
    progression: 'Feet elevated → 2 sec pause at chest → supinated grip → archer rows → weighted vest.',
  },
  {
    id: 'pushups',
    name: 'Push-ups / RTO',
    sets: '3 × 8–12',
    rest: '90 sec',
    category: 'base_strength',
    notes: 'Maintain neutral shoulder.',
    progression: 'Standard → feet elevated → RTO at bottom → RTO throughout → archer push-ups.',
  },
  {
    id: 'dips',
    name: 'Ring dips',
    sets: '3 × 6–10',
    rest: '2 min',
    category: 'base_strength',
    notes: 'Quality reps over quantity.',
    progression: 'Feet assisted → partial ROM unassisted → full ROM → pause at bottom → weighted.',
  },
  {
    id: 'facepulls',
    name: 'Ring face pulls',
    sets: '3 × 12–15',
    rest: '60 sec',
    category: 'base_strength',
    notes: 'Rings at face height, upright body.',
    progression: 'Lean further back for more load → pause at face → single arm.',
  },
  {
    id: 'lsit',
    name: 'L-sit progressions',
    sets: '3 × 10–20 sec',
    rest: '60 sec',
    category: 'body_tension',
    notes: 'Active shoulders, ribs down.',
    progression: 'Tuck → one leg extended → full L-sit → hold with shoulder depression.',
  },
];

const weightsExercises = () => [
  {
    id: 'kb_swings',
    name: 'KB swings',
    sets: '3 × 15–20',
    rest: '90 sec',
    category: 'power',
    notes: 'Hip-driven, not arm-driven.',
    progression: 'Two-hand → single-arm → KB clean → KB snatch. Increase weight when 20 reps feel easy.',
  },
  {
    id: 'tgu',
    name: 'Turkish get-ups',
    sets: '3 × 3–5 per side',
    rest: '2 min',
    category: 'body_tension',
    notes: 'Eyes on the bell. Slow and controlled.',
    progression: 'Bodyweight → light KB → heavier KB. Never rush — quality only.',
  },
  {
    id: 'wrist_curls',
    name: 'Reverse wrist curls',
    sets: '3 × 15–20',
    rest: '60 sec',
    category: 'finger_prehab',
    notes: 'Light weight. Slow tempo.',
    progression: 'Light DB → heavier DB → add rubber band finger extensions as a superset.',
  },
  {
    id: 'lat_raises',
    name: 'Lateral raises [superset]',
    sets: '3 × 12–15',
    rest: 'Straight into face pulls',
    category: 'base_strength',
    notes: 'Strict — no hip swing.',
    progression: 'Light DB strict → heavier → 2 sec hold at top → cable raise if available.',
  },
  {
    id: 'face_pulls',
    name: 'Face pulls [superset]',
    sets: '3 × 15–20',
    rest: '60 sec after pair',
    category: 'base_strength',
    notes: 'Elbows high. Pull to forehead.',
    progression: 'Light band → heavier band → DB rear delt fly.',
  },
  {
    id: 'hollow',
    name: 'Hollow body holds [superset]',
    sets: '3 × 20–30 sec',
    rest: 'Straight into dead bugs',
    category: 'body_tension',
    notes: 'Low back pressed to floor. Ribs down.',
    progression: 'Tuck → one leg → full hollow → rocks → add weight plate.',
  },
  {
    id: 'deadbugs',
    name: 'Dead bugs [superset]',
    sets: '3 × 8–10 per side',
    rest: '60 sec after pair',
    category: 'body_tension',
    notes: 'Opposite arm/leg. Slow.',
    progression: 'Standard → 2 sec pause at extension → 5 sec tempo → light DB in hands.',
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen planks',
    sets: '3 × 20–30 sec per side',
    rest: '90 sec',
    category: 'body_tension',
    notes: 'Hip square to floor.',
    progression: 'Bottom leg on bench (easier) → top leg only → add hip dip → extend hold.',
  },
];

const peExercises = (phase) => [
  {
    id: 'warmup',
    name: 'Thorough warm-up',
    sets: '20 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Never rush warm-up — power endurance is hard on tendons.',
    progression: 'Open-hand only until fully warm.',
  },
  {
    id: '4x4',
    name: '4x4 power circuits',
    sets: '4 rounds · V5–V6',
    rest: '3 min between rounds',
    category: 'muscular_endurance',
    notes: '4 problems back-to-back at moderate-to-hard. Pump should build by round 3.',
    progression: 'Bump grade one notch when you finish all 4 rounds clean.',
  },
  {
    id: 'power_burns',
    name: 'Power burns',
    sets: '4–5 attempts',
    rest: '3–4 min',
    category: 'power',
    notes: `Short, explosive problems at ${phase.limitGrade}. Dynamic moves, big throws.`,
    progression: 'Commit fully. No half-attempts.',
  },
  {
    id: 'cooldown',
    name: 'Prehab cool-down',
    sets: '10 min',
    rest: '—',
    category: 'mobility',
    notes: 'Bands, wrist rotations, shoulder openers.',
    progression: 'Contrast soak if anything feels inflamed.',
  },
];

// Build session objects per week (because limit/PE intensity depends on phase)
function buildSession(type, phase, opts = {}) {
  const { deload = false } = opts;
  switch (type) {
    case 'limit':
      return {
        id: 'limit',
        name: deload ? 'Limit (deload)' : 'Limit Bouldering',
        short: 'Limit',
        duration: deload ? '90 min' : '2 hrs',
        location: 'Tension Board 2 + Kilter',
        accent: '#C2A878',
        exercises: limitExercises(phase, deload),
      };
    case 'volume':
      return {
        id: 'volume',
        name: deload ? 'Volume (deload)' : 'Volume / Endurance',
        short: 'Volume',
        duration: deload ? '75 min' : '2 hrs',
        location: 'Tension Board 2 (primary)',
        accent: '#7A9E5F',
        exercises: volumeExercises(deload),
      };
    case 'tech':
      return {
        id: 'tech',
        name: 'Technique / Moderate',
        short: 'Technique',
        duration: '75 min',
        location: 'Friday · Kilter (primary)',
        accent: '#A8957A',
        exercises: techExercises(deload),
      };
    case 'rings':
      return {
        id: 'rings',
        name: 'Gymnastics Rings',
        short: 'Rings',
        duration: '~60 min',
        location: 'Home',
        accent: '#94A3B8',
        exercises: ringsExercises(),
      };
    case 'weights':
      return {
        id: 'weights',
        name: 'Weights & Core',
        short: 'Weights',
        duration: '~60 min',
        location: 'Home',
        accent: '#B88A6F',
        exercises: weightsExercises(),
      };
    case 'pe':
      return {
        id: 'pe',
        name: 'Power Endurance',
        short: 'Power End.',
        duration: '90 min',
        location: 'Tension Board 2 + Kilter',
        accent: '#D97757',
        exercises: peExercises(phase),
      };
    case 'rest':
    default:
      return {
        id: 'rest',
        name: 'Rest',
        short: 'Rest',
        duration: 'Full day off',
        location: 'Active recovery only',
        accent: '#444',
        exercises: [
          {
            id: 'rest_note',
            name: 'Active recovery',
            sets: 'Light',
            rest: '—',
            category: 'mobility',
            notes: 'Walking, light mobility, gentle stretching.',
            progression: 'Keeps blood circulating without loading tendons. Tendons adapt slower than muscles — earn your gains here.',
          },
        ],
      };
  }
}

// ----------------------------------------------------------------------------
// Weekly schedule generator
// Returns 7 days (Mon → Sun) with session objects.
// `cadence` is '3day' or '2day'.
// ----------------------------------------------------------------------------
export function getWeekSchedule(weekNumber, cadence = '3day') {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isTaper = phase.taperWeeks?.includes(weekNumber);
  const isPhase3PE = weekNumber === 13 || weekNumber === 14;

  let pattern;

  if (isTaper) {
    // Weeks 15-16: half volume, keep intensity. Drop volume + weights, keep limit + rings + tech.
    pattern = ['limit', 'rings', 'rest', 'rest', 'tech', 'rest', 'rest'];
  } else if (isDeload) {
    // Deload: drop Wed volume entirely; keep home sessions to preserve adaptation cues.
    pattern = ['limit', 'rings', 'rest', 'weights', 'tech', 'rest', 'rest'];
  } else if (cadence === '2day') {
    // 2-day: drop Wed volume
    pattern = ['limit', 'rings', 'rest', 'weights', 'tech', 'rest', 'rest'];
  } else {
    // Default 3-day. In Phase 3 (weeks 13-14), Wed is Power Endurance instead of Volume.
    const wed = isPhase3PE ? 'pe' : 'volume';
    pattern = ['limit', 'rings', wed, 'weights', 'tech', 'rest', 'rest'];
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return pattern.map((type, i) => ({
    dayLabel: dayLabels[i],
    dayIndex: i,
    weekNumber,
    sessionType: type,
    session: buildSession(type, phase, { deload: isDeload }),
    isDeload,
    isTaper,
  }));
}

// ----------------------------------------------------------------------------
// Week metadata
// ----------------------------------------------------------------------------
export function getWeekMeta(weekNumber) {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isTaper = phase.taperWeeks?.includes(weekNumber);
  const startDate = addDays(PLAN_START_DATE, (weekNumber - 1) * 7);
  const endDate = addDays(startDate, 6);
  let tag = null;
  if (isDeload) tag = 'Deload';
  else if (isTaper) tag = 'Taper';
  return { weekNumber, phase, isDeload, isTaper, tag, startDate, endDate };
}

// ----------------------------------------------------------------------------
// Date helpers
// ----------------------------------------------------------------------------
export function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.floor((db - da) / 86400000);
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Returns { weekNumber, dayIndex } for an ISO date, or null if outside the plan.
export function getPlanPosition(isoDate) {
  const diff = daysBetween(PLAN_START_DATE, isoDate);
  if (diff < 0) return { weekNumber: 1, dayIndex: 0, beforePlan: true };
  if (diff >= 16 * 7) return { weekNumber: 16, dayIndex: 6, afterPlan: true };
  const weekNumber = Math.floor(diff / 7) + 1;
  const dayIndex = diff % 7;
  return { weekNumber, dayIndex };
}

export function formatDateShort(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDateLong(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ----------------------------------------------------------------------------
// Total counts for progress calculations
// ----------------------------------------------------------------------------
export function getAllSessions(cadence = '3day') {
  const out = [];
  for (let w = 1; w <= 16; w++) {
    const week = getWeekSchedule(w, cadence);
    week.forEach((d, i) => {
      if (d.sessionType !== 'rest') {
        out.push({ weekNumber: w, dayIndex: i, sessionType: d.sessionType, session: d.session, isDeload: d.isDeload, isTaper: d.isTaper });
      }
    });
  }
  return out;
}

// Notes content (recovery + projecting reference from the source plan)
export const NOTES_CONTENT = [
  {
    id: 'recovery',
    heading: 'Recovery Protocol',
    items: [
      { title: 'Sleep', body: '8 hrs minimum. Tendons repair during sleep. This matters more than almost anything else.' },
      { title: 'Collagen + vitamin C', body: '15 g collagen peptides + 50 mg vitamin C, taken 30–60 min before climbing. Good evidence for tendon synthesis — particularly relevant with tweaky fingers.' },
      { title: 'Protein', body: '1.6–2 g per kg of bodyweight daily, spread across meals. Essential for tissue repair.' },
      { title: 'Finger care', body: 'Always warm up open-hand. Never crimp cold. Massage after sessions. Contrast soak (warm then cold) if anything feels inflamed.' },
      { title: 'Rest between sessions', body: 'At least one full day between climbing days. Tendons adapt on a slower cycle than muscles.' },
      { title: 'Active recovery', body: 'Walking, light mobility, gentle stretching on off days. Keeps blood circulating without loading tendons.' },
      { title: 'Deload weeks', body: 'Every 4th week: cut climbing volume by 40–50%. Adaptation happens during recovery — deloads are when you get stronger.' },
    ],
  },
  {
    id: 'projecting',
    heading: 'On Projecting (Phase 2 onwards)',
    items: [
      { title: 'Pick one or two problems', body: 'Per session, pick problems that feel completely out of reach and spend real time on them — not just a couple of tries before moving on.' },
      { title: 'Deconstruct the crux', body: 'Work it in isolation. Figure out what is actually stopping you: finger strength, body position, footwork, or commitment? This is where grade jumps come from.' },
      { title: 'Kilter angle', body: 'Start at 20–25° in Phase 1 and do not rush to steeper terrain. Body tension on a 35° board before you are ready just teaches you to flail. Earn steeper angles.' },
    ],
  },
  {
    id: 'boards',
    heading: 'Board Strategy',
    items: [
      { title: 'Tension Board 2', body: 'Primary board for limit bouldering and volume. On busy days, lap 1–2 problems for endurance — same stimulus as 4x4s with four problems.' },
      { title: 'Kilter 8x12', body: 'Body tension and positional problems. The smaller footprint rules out big lateral moves but is excellent for steeper terrain. Start at 20–25°.' },
      { title: 'Busy gym', body: 'Busy sessions are well-suited to limit bouldering — wait time between turns doubles as built-in rest (3–5 min). Save volume sessions for quieter slots.' },
    ],
  },
];
