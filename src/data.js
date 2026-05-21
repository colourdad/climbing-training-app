// ============================================================================
// CLIMBING TRAINING PLAN · V6 to V7+ · 16 weeks
// Week 1 begins Monday 18 May 2026.
// ============================================================================

export const PLAN_START_DATE = '2026-05-18';

// ----------------------------------------------------------------------------
// Skill categories (8 colour-coded pills)
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
    accent: '#7A9E5F',
    focus: 'Build volume at V4–V6. Prioritise quality movement over hard grades. Let tendons adapt before pushing limits.',
    limitGrade: 'V6–V7',
    deloadWeek: 6,
  },
  {
    id: 2,
    name: 'Strength',
    weeks: [7, 8, 9, 10, 11, 12],
    accent: '#C2A878',
    focus: 'Push into V7–V8 territory. Drop problem count, increase rest. Begin projecting — chip away at problems that feel impossible.',
    limitGrade: 'V7–V8',
    deloadWeek: 12,
  },
  {
    id: 3,
    name: 'Peak',
    weeks: [13, 14, 15, 16],
    accent: '#D97757',
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
// Exercise definitions
// Each exercise now carries: description, muscles[], timer{sec, mode, label}
// ----------------------------------------------------------------------------

const ex = (o) => o; // identity helper for readability

const limitExercises = (phase, deload = false) => [
  ex({
    id: 'warmup',
    name: 'Joint warm-up',
    sets: '10 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Wrist circles, finger extensions, tendon glides.',
    progression: 'Non-negotiable with tweaky fingers — never skip or rush it.',
    description: 'Mobilise wrists in both directions, perform finger tendon glides (fist → hook → straight → claw), gently pull each finger to stretch flexors. Rotate shoulders. The goal is blood flow and gentle joint loading, not stretching cold tissue.',
    muscles: ['fingers', 'wrists', 'forearms', 'shoulders'],
    timer: { sec: 0 },
  }),
  ex({
    id: 'easy',
    name: 'Easy climbing',
    sets: '20 min · V1–V4',
    rest: '—',
    category: 'technique',
    notes: 'Kilter at a low angle. Open-hand grip only until fully warm.',
    progression: 'Focus on feet. No crimping cold, ever.',
    description: 'Climb easy problems on the Kilter at 20–25°. Open-hand grip only. Smooth, controlled movement. The point is to bring up your body temperature and prime the climbing-specific patterns before harder work.',
    muscles: ['fingers', 'forearms', 'lats', 'core'],
    timer: { sec: 1200, mode: 'work', label: 'Easy block' },
  }),
  ex({
    id: 'moderate',
    name: 'Moderate zone',
    sets: deload ? '15 min · V4–V5' : '20 min · V4–V6',
    rest: '2–3 min',
    category: 'technique',
    notes: deload ? '2–3 problems, ramp up progressively.' : '3–4 problems, ramp up progressively.',
    progression: 'Movement quality over grade.',
    description: 'Submaximal problems at V4–V6. Use this block to dial in body position before going to limit attempts. Mix tension-heavy and friction-dependent styles. Rest 2–3 min between problems.',
    muscles: ['fingers', 'forearms', 'lats', 'core', 'glutes'],
    timer: { sec: 150, mode: 'rest', label: 'Rest between problems' },
  }),
  ex({
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
    description: '6–10 attempts on problems at your absolute current limit. Rest 3–5 min between burns — you should feel almost fully recovered before each go. Pick problems with roughly 20–40% chance of completion today. Quality of attempt matters more than count.',
    muscles: ['fingers', 'forearms', 'lats', 'biceps', 'core', 'glutes', 'shoulders'],
    timer: { sec: 240, mode: 'rest', label: 'Rest between burns' },
  }),
  ex({
    id: 'cooldown',
    name: 'Prehab cool-down',
    sets: '10 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Rubber band finger extensions, wrist rotations, shoulder openers.',
    progression: 'Massage any tweaky spots. Contrast soak if inflamed.',
    description: 'Wrap rubber band around fingertips and extend against resistance — strengthens extensors. Slow wrist rotations. Shoulder dislocates with a band. Massage forearms and any tweaky finger pulleys with thumb pressure.',
    muscles: ['fingers', 'wrists', 'forearm extensors', 'shoulders'],
    timer: { sec: 0 },
  }),
];

const volumeExercises = (deload = false) => [
  ex({
    id: 'warmup',
    name: 'Thorough warm-up',
    sets: '25 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Same warm-up as limit days — never rushed.',
    progression: 'Open-hand only until fully warm.',
    description: 'Same as limit days. Wrist mobility, tendon glides, easy climbing on the Kilter open-hand. Volume sessions hit fingers hard — give them every chance to be ready.',
    muscles: ['fingers', 'wrists', 'forearms', 'shoulders'],
    timer: { sec: 0 },
  }),
  ex({
    id: '4x4',
    name: '4x4 circuits',
    sets: deload ? '2 rounds · V4' : '4 rounds · V4–V5',
    rest: '3–4 min between rounds',
    category: 'muscular_endurance',
    notes: deload
      ? '4 problems back-to-back, repeat 2 rounds (40% cut).'
      : '4 problems back-to-back, repeat 4 rounds. On Tension Board, lap 1–2 problems to the same effect.',
    progression: 'Heart rate up. Form holds together to the last problem.',
    description: 'Pick 4 problems at V4–V5. Climb all four back-to-back with minimal rest between problems. Rest 3–4 min between rounds. Repeat for 4 rounds. The last problem of the last round should feel like a true effort but be completable.',
    muscles: ['fingers', 'forearms', 'lats', 'biceps', 'core', 'shoulders'],
    timer: { sec: 210, mode: 'rest', label: 'Rest between rounds' },
  }),
  ex({
    id: 'project',
    name: 'Project burns',
    sets: deload ? 'Skip on deload' : '3–5 attempts',
    rest: '3 min',
    category: 'max_strength',
    notes: deload ? 'Optional — only if feeling fresh.' : 'One notch below your absolute limit today.',
    progression: 'Quality over quantity.',
    description: 'After the pump from 4x4s, do 3–5 quality attempts on a single problem one notch below today\'s absolute limit. Focus on the crux move. Rest 3 min between attempts.',
    muscles: ['fingers', 'forearms', 'lats', 'core', 'shoulders'],
    timer: { sec: 180, mode: 'rest', label: 'Rest between attempts' },
  }),
  ex({
    id: 'core',
    name: 'Core & cool-down',
    sets: 'Hollow body 3x30s · Dead bugs 3x10',
    rest: '60 sec',
    category: 'body_tension',
    notes: 'Stretch and cool down.',
    progression: 'Hollow body → with rocks → with weight plate.',
    description: 'Hollow body holds 3×30s with 60s rest. Dead bugs 3×10/side. Finish with light stretching for fingers, hips, and shoulders.',
    muscles: ['core', 'abs', 'hip flexors'],
    timer: { sec: 30, mode: 'work', label: 'Hold' },
  }),
];

const techExercises = (deload = false) => [
  ex({
    id: 'warmup',
    name: 'Finger warm-up',
    sets: '15 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Thorough — slightly shorter than limit days but still essential.',
    progression: 'Open-hand only until fully warm.',
    description: 'Standard warm-up — wrist mobility, tendon glides, easy climbing. Slightly shorter than limit days because the day\'s effort is lower, but still thorough.',
    muscles: ['fingers', 'wrists', 'forearms'],
    timer: { sec: 0 },
  }),
  ex({
    id: 'intentional',
    name: 'Intentional movement',
    sets: deload ? '30 min · 2 grades below limit' : '45 min · 1–2 grades below limit',
    rest: 'Generous',
    category: 'technique',
    notes: 'Silent feet, deliberate hip positioning, read sequence before leaving the ground.',
    progression: 'Every rep counts. No mindless lapping.',
    description: 'Pick problems 1–2 grades below your limit and execute them with maximum technical precision. Silent feet, deliberate weight transfers, deliberate hip positioning. Read every sequence from the ground before committing. This is the most important session for grade transfer.',
    muscles: ['fingers', 'forearms', 'lats', 'core', 'glutes', 'hip flexors'],
    timer: { sec: 180, mode: 'rest', label: 'Rest between problems' },
  }),
  ex({
    id: 'flow',
    name: 'Flow laps',
    sets: '10 min',
    rest: 'Minimal',
    category: 'technique',
    notes: 'Comfortable-but-not-easy problems. Stay in flow state.',
    progression: 'Builds movement endurance and reinforces good patterns.',
    description: 'String together 2–3 comfortable-but-not-easy problems with minimal rest. Stay in flow state — quick reads, fluid movement. Builds movement endurance and reinforces the good patterns from the intentional block.',
    muscles: ['fingers', 'forearms', 'lats', 'core'],
    timer: { sec: 600, mode: 'work', label: 'Flow block' },
  }),
  ex({
    id: 'reflect',
    name: 'Cool-down & reflect',
    sets: '5 min',
    rest: '—',
    category: 'mobility',
    notes: 'Note 1–2 movement lessons from the session.',
    progression: 'Five minutes of reflection is worth 30 of mindless lapping.',
    description: 'Light stretching for forearms and hips. Most importantly: write down 1–2 specific movement lessons from today. The reflection is what locks the learning in.',
    muscles: ['mind', 'forearms', 'hips'],
    timer: { sec: 0 },
  }),
];

const ringsExercises = () => [
  ex({
    id: 'rows',
    name: 'Rows',
    sets: '3 × 8–12',
    rest: '90 sec',
    category: 'base_strength',
    notes: 'Feet on floor to start.',
    progression: 'Feet elevated → 2 sec pause at chest → supinated grip → archer rows → weighted vest.',
    description: 'Set rings at roughly hip height. Walk feet under so body forms a straight line from heels to head. Pull chest to rings, keeping shoulder blades pulled down and back. Lower slowly with control.',
    muscles: ['lats', 'rhomboids', 'biceps', 'rear delts', 'core'],
    timer: { sec: 90, mode: 'rest', label: 'Rest between sets' },
  }),
  ex({
    id: 'pushups',
    name: 'Push-ups / RTO',
    sets: '3 × 8–12',
    rest: '90 sec',
    category: 'base_strength',
    notes: 'Maintain neutral shoulder.',
    progression: 'Standard → feet elevated → RTO at bottom → RTO throughout → archer push-ups.',
    description: 'Ring push-up: lower chest to rings, push back up. For RTO (rings turned out), rotate the rings outward so palms face forward at the bottom — this loads the biceps tendon, an important stimulus for climbers. Body straight throughout.',
    muscles: ['chest', 'triceps', 'shoulders', 'biceps tendon', 'core'],
    timer: { sec: 90, mode: 'rest', label: 'Rest between sets' },
  }),
  ex({
    id: 'dips',
    name: 'Ring dips',
    sets: '3 × 6–10',
    rest: '2 min',
    category: 'base_strength',
    notes: 'Quality reps over quantity.',
    progression: 'Feet assisted → partial ROM unassisted → full ROM → pause at bottom → weighted.',
    description: 'Support on rings, body slightly forward. Lower until shoulder is below elbow (or wherever you have control). Press up actively. Ring dips demand massive shoulder stability — go slow.',
    muscles: ['triceps', 'chest', 'shoulders', 'core'],
    timer: { sec: 120, mode: 'rest', label: 'Rest between sets' },
  }),
  ex({
    id: 'facepulls',
    name: 'Ring face pulls',
    sets: '3 × 12–15',
    rest: '60 sec',
    category: 'base_strength',
    notes: 'Rings at face height, upright body.',
    progression: 'Lean further back for more load → pause at face → single arm.',
    description: 'Rings at face height. Walk feet forward so body angles back. Pull rings to forehead with elbows high and wide. Externally rotate hands at the top. Critical for posterior shoulder health, especially when climbing volume goes up.',
    muscles: ['rear delts', 'rhomboids', 'rotator cuff', 'biceps'],
    timer: { sec: 60, mode: 'rest', label: 'Rest between sets' },
  }),
  ex({
    id: 'lsit',
    name: 'L-sit progressions',
    sets: '3 × 10–20 sec',
    rest: '60 sec',
    category: 'body_tension',
    notes: 'Active shoulders, ribs down.',
    progression: 'Tuck → one leg extended → full L-sit → hold with shoulder depression.',
    description: 'Hands by hips on rings or floor. Press down to lift body. Tuck legs (easy), extend one (medium), or hold full L (hard). Actively depress shoulders. Builds core, hip flexor strength, and shoulder stability — directly transfers to body tension on the wall.',
    muscles: ['core', 'abs', 'hip flexors', 'quads', 'lats'],
    timer: { sec: 15, mode: 'work', label: 'Hold' },
  }),
];

const weightsExercises = () => [
  ex({
    id: 'kb_swings',
    name: 'KB swings',
    sets: '3 × 15–20',
    rest: '90 sec',
    category: 'power',
    notes: 'Hip-driven, not arm-driven.',
    progression: 'Two-hand → single-arm → KB clean → KB snatch. Increase weight when 20 reps feel easy.',
    description: 'Hinge at the hips (not a squat). Swing the bell back between legs, then snap hips forward to lift the bell to chest height. Arms are just a rope. The bell floats. Glutes and hamstrings do the work — this teaches the hip extension power used on heel hooks and dynamic moves.',
    muscles: ['glutes', 'hamstrings', 'lower back', 'core', 'shoulders'],
    timer: { sec: 90, mode: 'rest', label: 'Rest between sets' },
  }),
  ex({
    id: 'tgu',
    name: 'Turkish get-ups',
    sets: '3 × 3–5 per side',
    rest: '2 min',
    category: 'body_tension',
    notes: 'Eyes on the bell. Slow and controlled.',
    progression: 'Bodyweight first → light KB → heavier KB. Never rush — quality only.',
    description: 'Lie on back, KB pressed overhead in one hand. Move to standing in 7–8 deliberate steps while keeping the bell vertical the entire time. Reverse the steps to lie down. Eyes on the bell. Whole-body coordination and stability drill — climbing in disguise.',
    muscles: ['shoulders', 'core', 'obliques', 'glutes', 'quads', 'hip flexors'],
    timer: { sec: 120, mode: 'rest', label: 'Rest between sides' },
  }),
  ex({
    id: 'wrist_curls',
    name: 'Reverse wrist curls',
    sets: '3 × 15–20',
    rest: '60 sec',
    category: 'finger_prehab',
    notes: 'Light weight. Slow tempo.',
    progression: 'Light DB → heavier DB → add rubber band finger extensions as a superset.',
    description: 'Hold light DB with palm facing down, forearm resting on bench. Slowly curl wrist up toward you, lower with control. Strengthens forearm extensors — counterbalance to all the flexor work climbing gives you.',
    muscles: ['forearm extensors', 'wrists'],
    timer: { sec: 60, mode: 'rest', label: 'Rest between sets' },
  }),
  ex({
    id: 'lat_raises',
    name: 'Lateral raises [superset]',
    sets: '3 × 12–15',
    rest: 'Straight into face pulls',
    category: 'base_strength',
    notes: 'Strict — no hip swing.',
    progression: 'Light DB strict → heavier → 2 sec hold at top → cable raise if available.',
    description: 'Hold light DBs at sides. Raise straight out to shoulder height (no higher). Pause briefly, lower with control. Strict — no hip swing or shrug. Targets the side delts that get neglected in climbing.',
    muscles: ['side delts', 'shoulders'],
    timer: { sec: 0, mode: 'rest', label: 'No rest — into face pulls' },
  }),
  ex({
    id: 'face_pulls',
    name: 'Face pulls [superset]',
    sets: '3 × 15–20',
    rest: '60 sec after pair',
    category: 'base_strength',
    notes: 'Elbows high. Pull to forehead.',
    progression: 'Light band → heavier band → DB rear delt fly.',
    description: 'Band anchored at face height. Pull rope/band to forehead, elbows high and wide. Externally rotate at the top so thumbs point back. Most important shoulder health movement for climbers.',
    muscles: ['rear delts', 'rotator cuff', 'rhomboids'],
    timer: { sec: 60, mode: 'rest', label: 'Rest after pair' },
  }),
  ex({
    id: 'hollow',
    name: 'Hollow body holds [superset]',
    sets: '3 × 20–30 sec',
    rest: 'Straight into dead bugs',
    category: 'body_tension',
    notes: 'Low back pressed to floor. Ribs down.',
    progression: 'Tuck → one leg → full hollow → rocks → add weight plate.',
    description: 'Lie on back. Press low back hard into the floor. Lift head and shoulders, arms overhead, legs straight. Body forms a slight banana curve. Ribs pulled down — no flaring. The shape that holds you to a steep wall.',
    muscles: ['core', 'abs', 'hip flexors', 'quads'],
    timer: { sec: 30, mode: 'work', label: 'Hold' },
  }),
  ex({
    id: 'deadbugs',
    name: 'Dead bugs [superset]',
    sets: '3 × 8–10 per side',
    rest: '60 sec after pair',
    category: 'body_tension',
    notes: 'Opposite arm/leg. Slow.',
    progression: 'Standard → 2 sec pause at extension → 5 sec tempo → light DB in hands.',
    description: 'Lie on back, knees bent at 90° in air, arms straight up. Slowly lower opposite arm and leg until inches from the floor. Hold one beat. Return. Switch sides. Low back must stay glued to the floor — that\'s the whole point.',
    muscles: ['core', 'abs', 'hip flexors'],
    timer: { sec: 60, mode: 'rest', label: 'Rest after pair' },
  }),
  ex({
    id: 'copenhagen',
    name: 'Copenhagen planks',
    sets: '3 × 20–30 sec per side',
    rest: '90 sec',
    category: 'body_tension',
    notes: 'Hip square to floor.',
    progression: 'Bottom leg on bench (easier) → top leg only → add hip dip → extend hold.',
    description: 'Side plank with the top leg resting on a bench (or top leg only for hard mode). Hip square to the floor. Hits the adductors — protective for the inside of the knee on heel hooks and drop-knee positions.',
    muscles: ['adductors', 'obliques', 'core', 'glutes'],
    timer: { sec: 30, mode: 'work', label: 'Hold' },
  }),
];

const peExercises = (phase) => [
  ex({
    id: 'warmup',
    name: 'Thorough warm-up',
    sets: '20 min',
    rest: '—',
    category: 'finger_prehab',
    notes: 'Never rush warm-up — power endurance is hard on tendons.',
    progression: 'Open-hand only until fully warm.',
    description: 'Wrist mobility, tendon glides, easy climbing. PE sessions are tendon-stressful — give the warm-up its full time.',
    muscles: ['fingers', 'wrists', 'forearms', 'shoulders'],
    timer: { sec: 0 },
  }),
  ex({
    id: '4x4',
    name: '4x4 power circuits',
    sets: '4 rounds · V5–V6',
    rest: '3 min between rounds',
    category: 'muscular_endurance',
    notes: '4 problems back-to-back at moderate-to-hard. Pump should build by round 3.',
    progression: 'Bump grade one notch when all 4 rounds finish clean.',
    description: 'Pick 4 problems harder than your usual 4x4 set — V5–V6. Climb all 4 back-to-back. Rest 3 min. Repeat for 4 rounds. The pump should be real by round 3. Trains the body to keep performing while pumped — the climbing-specific energy system for outdoor sends.',
    muscles: ['fingers', 'forearms', 'lats', 'biceps', 'core', 'shoulders'],
    timer: { sec: 180, mode: 'rest', label: 'Rest between rounds' },
  }),
  ex({
    id: 'power_burns',
    name: 'Power burns',
    sets: '4–5 attempts',
    rest: '3–4 min',
    category: 'power',
    notes: `Short, explosive problems at ${phase.limitGrade}. Dynamic moves, big throws.`,
    progression: 'Commit fully — no half-attempts.',
    description: `Pick a short, explosive problem with dynamic moves at ${phase.limitGrade}. 4–5 attempts with full rest. Commit fully — half-attempts teach you to bail.`,
    muscles: ['fingers', 'forearms', 'lats', 'core', 'glutes', 'shoulders'],
    timer: { sec: 210, mode: 'rest', label: 'Rest between burns' },
  }),
  ex({
    id: 'cooldown',
    name: 'Prehab cool-down',
    sets: '10 min',
    rest: '—',
    category: 'mobility',
    notes: 'Bands, wrist rotations, shoulder openers.',
    progression: 'Contrast soak if anything feels inflamed.',
    description: 'Rubber band finger extensions, wrist rotations, shoulder dislocates. PE work loads fingers and elbows — give them recovery attention.',
    muscles: ['fingers', 'wrists', 'shoulders', 'elbows'],
    timer: { sec: 0 },
  }),
];

const restExercises = () => [
  ex({
    id: 'rest_note',
    name: 'Active recovery',
    sets: 'Light',
    rest: '—',
    category: 'mobility',
    notes: 'Walking, light mobility, gentle stretching.',
    progression: 'Keeps blood circulating without loading tendons. Tendons adapt slower than muscles — earn your gains here.',
    description: 'A 20–30 min walk. Light mobility for hips and shoulders. Light stretching. Sleep early, hit your protein target (1.6–2 g/kg), and take 15 g collagen + 50 mg vit C 30–60 min before any next climbing day.',
    muscles: ['recovery'],
    timer: { sec: 1800, mode: 'work', label: 'Walk' },
  }),
];

function buildSession(type, phase, opts = {}) {
  const { deload = false } = opts;
  switch (type) {
    case 'limit':
      return { id: 'limit', name: deload ? 'Limit (deload)' : 'Limit Bouldering', short: 'Limit', duration: deload ? '90 min' : '2 hrs', plannedMinutes: deload ? 90 : 120, location: 'Tension Board 2 + Kilter', accent: '#C2A878', exercises: limitExercises(phase, deload) };
    case 'volume':
      return { id: 'volume', name: deload ? 'Volume (deload)' : 'Volume / Endurance', short: 'Volume', duration: deload ? '75 min' : '2 hrs', plannedMinutes: deload ? 75 : 120, location: 'Tension Board 2 (primary)', accent: '#7A9E5F', exercises: volumeExercises(deload) };
    case 'tech':
      return { id: 'tech', name: 'Technique / Moderate', short: 'Technique', duration: '75 min', plannedMinutes: 75, location: 'Friday · Kilter (primary)', accent: '#A8957A', exercises: techExercises(deload) };
    case 'rings':
      return { id: 'rings', name: 'Gymnastics Rings', short: 'Rings', duration: '~60 min', plannedMinutes: 60, location: 'Home', accent: '#94A3B8', exercises: ringsExercises() };
    case 'weights':
      return { id: 'weights', name: 'Weights & Core', short: 'Weights', duration: '~60 min', plannedMinutes: 60, location: 'Home', accent: '#B88A6F', exercises: weightsExercises() };
    case 'pe':
      return { id: 'pe', name: 'Power Endurance', short: 'Power End.', duration: '90 min', plannedMinutes: 90, location: 'Tension Board 2 + Kilter', accent: '#D97757', exercises: peExercises(phase) };
    case 'rest':
    default:
      return { id: 'rest', name: 'Rest', short: 'Rest', duration: 'Full day off', plannedMinutes: 0, location: 'Active recovery only', accent: '#444', exercises: restExercises() };
  }
}

// ----------------------------------------------------------------------------
// Default weekly pattern (per cadence)
// Returns array of 7 session-type ids (Mon → Sun).
// ----------------------------------------------------------------------------
export function getDefaultPattern(weekNumber, cadence = '3day') {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isTaper = phase.taperWeeks?.includes(weekNumber);
  const isPhase3PE = weekNumber === 13 || weekNumber === 14;

  if (isTaper) return ['limit', 'rings', 'rest', 'rest', 'tech', 'rest', 'rest'];
  if (isDeload) return ['limit', 'rings', 'rest', 'weights', 'tech', 'rest', 'rest'];
  if (cadence === '2day') return ['limit', 'rings', 'rest', 'weights', 'tech', 'rest', 'rest'];
  const wed = isPhase3PE ? 'pe' : 'volume';
  return ['limit', 'rings', wed, 'weights', 'tech', 'rest', 'rest'];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ----------------------------------------------------------------------------
// Build full week schedule.
// `pattern` may be supplied (overrides default).
// ----------------------------------------------------------------------------
export function getWeekSchedule(weekNumber, cadence = '3day', pattern = null) {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isTaper = phase.taperWeeks?.includes(weekNumber);
  const usePattern = pattern || getDefaultPattern(weekNumber, cadence);

  return usePattern.map((type, i) => ({
    dayLabel: DAY_LABELS[i],
    dayIndex: i,
    weekNumber,
    sessionType: type,
    session: buildSession(type, phase, { deload: isDeload }),
    isDeload,
    isTaper,
  }));
}

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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function getPlanPosition(isoDate) {
  const diff = daysBetween(PLAN_START_DATE, isoDate);
  if (diff < 0) return { weekNumber: 1, dayIndex: 0, beforePlan: true };
  if (diff >= 16 * 7) return { weekNumber: 16, dayIndex: 6, afterPlan: true };
  return { weekNumber: Math.floor(diff / 7) + 1, dayIndex: diff % 7 };
}
export function formatDateShort(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
export function formatDateLong(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ----------------------------------------------------------------------------
// Plan iteration helpers
// `cadenceFor(w)` and `patternFor(w)` callbacks let the caller plug in their
// per-week overrides from app state.
// ----------------------------------------------------------------------------
export function getAllSessions(cadenceFor = () => '3day', patternFor = () => null) {
  const out = [];
  for (let w = 1; w <= 16; w++) {
    const week = getWeekSchedule(w, cadenceFor(w), patternFor(w));
    week.forEach((d, i) => {
      out.push({ weekNumber: w, dayIndex: i, sessionType: d.sessionType, session: d.session, isDeload: d.isDeload, isTaper: d.isTaper });
    });
  }
  return out;
}

// ----------------------------------------------------------------------------
// Build the exercise catalog (for muscle search). Each catalog entry is unique
// per session-type + exercise id. Same exercise across phases is deduped.
// ----------------------------------------------------------------------------
export function buildExerciseCatalog() {
  const seen = new Set();
  const catalog = [];
  const allTypes = ['limit', 'volume', 'tech', 'rings', 'weights', 'pe'];
  // Use phase 2 for limit-specific intensity placeholder; we just want the structure.
  const phase = PHASES[1];
  allTypes.forEach(t => {
    const s = buildSession(t, phase, { deload: false });
    s.exercises.forEach(e => {
      const key = `${t}:${e.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      catalog.push({
        sessionType: t,
        sessionName: s.name,
        sessionAccent: s.accent,
        id: e.id,
        name: e.name,
        category: e.category,
        description: e.description,
        muscles: e.muscles || [],
        progression: e.progression,
        sets: e.sets,
        rest: e.rest,
        timer: e.timer,
      });
    });
  });
  return catalog;
}

export function getAllMuscles() {
  const set = new Set();
  buildExerciseCatalog().forEach(e => e.muscles.forEach(m => set.add(m)));
  return Array.from(set).sort();
}

// ----------------------------------------------------------------------------
// Notes content (reference)
// ----------------------------------------------------------------------------
export const NOTES_CONTENT = [
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
