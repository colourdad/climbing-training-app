// ============================================================================
// SEND · 16-Week Climbing Training Program
// 4 phases (Foundation, Strength, Power Endurance, Performance) + deload + test.
// Week 1 begins Monday 18 May 2026.
// ============================================================================

export const PLAN_START_DATE = '2026-05-18';

// ----------------------------------------------------------------------------
// Skill categories (8 colour-coded pills)
// ----------------------------------------------------------------------------
// 8 well-separated hues (≈ every 45° on the colour wheel) tuned slightly
// muted so they sit comfortably on the dark earthy palette.
export const SKILL_CATEGORIES = {
  finger_prehab:      { label: 'Finger Prehab',      color: '#5B8FD9', short: 'Prehab' },     // blue
  base_strength:      { label: 'Base Strength',      color: '#8B8682', short: 'Base' },       // warm slate (neutral)
  max_strength:       { label: 'Max Strength',       color: '#E0B341', short: 'Max' },        // gold
  power:              { label: 'Power',              color: '#E0594C', short: 'Power' },      // red
  muscular_endurance: { label: 'Muscular Endurance', color: '#C8689E', short: 'Endurance' },  // magenta
  body_tension:       { label: 'Body Tension',       color: '#6FB04A', short: 'Tension' },    // green
  mobility:           { label: 'Mobility',           color: '#3FB5B5', short: 'Mobility' },   // teal
  technique:          { label: 'Technique',          color: '#8B69C4', short: 'Technique' },  // purple
};

export const SKILL_ORDER = [
  'finger_prehab', 'base_strength', 'max_strength', 'power',
  'muscular_endurance', 'body_tension', 'mobility', 'technique',
];

// ----------------------------------------------------------------------------
// Training phases
// Phase 4 includes weeks 13–14 (Performance) plus week 15 (deep deload) and
// week 16 (testing). Per-week flags isDeload / isDeepDeload / isTesting drive
// pattern selection and session content.
// ----------------------------------------------------------------------------
export const PHASES = [
  {
    id: 1,
    name: 'Foundation',
    weeks: [1, 2, 3, 4],
    accent: '#7A9E5F',
    focus: 'Movement and tissue prep. Slab, footwork drills, easy circuits. Prehab, core fundamentals, mobility — bodyweight and bands only.',
    limitGrade: 'V0–V2 / 5a–6b',
    deloadWeek: 4, // natural deload — reduce climb volume 20%
  },
  {
    id: 2,
    name: 'Strength',
    weeks: [5, 6, 7, 8],
    accent: '#C2A878',
    focus: 'Max force production. Limit bouldering, crimp/sloper training. Fingerboarding (max hangs) and weighted pulls.',
    limitGrade: '85–92% max',
    deloadWeek: 8, // drop Sat Home B; reduce fingerboard volume 30%
  },
  {
    id: 3,
    name: 'Power Endurance',
    weeks: [9, 10, 11, 12],
    accent: '#D97757',
    focus: 'Sustain hard moves. 4×4 circuits, linked problems, project burns. Repeater hangs and strength-endurance supersets.',
    limitGrade: '90–95% max',
    deloadWeek: 12, // drop Sat Home B; all sessions at 80% volume
  },
  {
    id: 4,
    name: 'Performance',
    weeks: [13, 14, 15, 16],
    accent: '#B88A6F',
    focus: 'Project redpoints and peak. Maintenance gym only. Week 15 is a half-volume deload, week 16 is testing.',
    limitGrade: 'Project grade',
    deloadWeek: null,
    deepDeloadWeek: 15,
    testingWeek: 16,
  },
];

export function getPhase(weekNumber) {
  return PHASES.find(p => p.weeks.includes(weekNumber));
}

// ----------------------------------------------------------------------------
// Exercise definitions
// Each exercise carries: id, name, sets, rest, category, notes (one-line cue),
// muscles[], timer{sec, mode?, label?}. Descriptions are intentionally light
// here — flesh them out in a follow-up pass once the structure feels right.
// ----------------------------------------------------------------------------

const ex = (o) => o; // identity helper for readability

// ----- Limit session (Monday) -----------------------------------------------
const limitExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'warmup',          name: 'Warm-up traversing',          sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Flowing movement; joint circles throughout; stay easy.',                      muscles: ['fingers', 'wrists', 'forearms', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'quiet_feet',      name: 'Quiet-feet problems',         sets: '3×10 problems',    rest: '—',       category: 'technique',     notes: 'V0–V1 only; place foot with zero noise; repeat each 3×; no rushing.',         muscles: ['feet', 'core', 'glutes'],                      timer: { sec: 0 } }),
    ex({ id: 'slab_balance',    name: 'Slab & balance problems',     sets: '8–10 problems',    rest: '—',       category: 'technique',     notes: 'Weight over feet; hip-in and hip-out practice; V0–V2.',                      muscles: ['feet', 'core', 'glutes', 'hip flexors'],       timer: { sec: 0 } }),
    ex({ id: 'slow_motion',     name: 'Slow-motion repeat',          sets: '5 problems × 3 reps', rest: '—',    category: 'technique',     notes: '3 s per placement; V0–V1; feel every weight shift.',                         muscles: ['feet', 'core', 'glutes'],                      timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Easy traverse, forearm and shoulder stretching.',                            muscles: ['forearms', 'shoulders'],                       timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'warmup_pyramid',  name: 'Warm-up pyramid',             sets: '15–20 min',        rest: '—',       category: 'finger_prehab', notes: 'Climb easy → moderate; last 5 min at 70% intensity before hard problems.',   muscles: ['fingers', 'forearms', 'shoulders'],            timer: { sec: 0 } }),
    ex({ id: 'limit',           name: 'Limit bouldering',            sets: '8 problems',       rest: '3–5 min', category: 'max_strength',  notes: '85–92% of max grade. Quality > quantity.',                                   muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between attempts' } }),
    ex({ id: 'crimp_sloper',    name: 'Crimp/sloper alternating set',sets: '6 problems × 2 attempts', rest: '3 min', category: 'max_strength', notes: '3 crimp-intensive, 3 sloper; rest 3 min between each.',                    muscles: ['fingers', 'forearms'],                         timer: { sec: 180, mode: 'rest', label: 'Rest between problems' } }),
    ex({ id: 'footwork_hard',   name: 'Footwork refinement on hard terrain', sets: '3 problems × 5 reps', rest: '—', category: 'technique', notes: 'Repeat for footwork precision only; note any foot improvements.',         muscles: ['feet', 'core'],                                timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down traverse',          sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Pump target 2/10; shake arms frequently.',                                   muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'warmup_pyramid',  name: 'Warm-up pyramid',             sets: '20 min',           rest: '—',       category: 'finger_prehab', notes: 'Thorough — ankle, hip, shoulder, wrist; graduate to 75% intensity.',         muscles: ['fingers', 'forearms', 'shoulders'],            timer: { sec: 0 } }),
    ex({ id: 'limit',           name: 'Limit bouldering',            sets: '6–8 problems',     rest: '4–5 min', category: 'max_strength',  notes: '90–95% of max grade. Up to 3 attempts per problem.',                          muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 270, mode: 'rest', label: 'Rest between attempts' } }),
    ex({ id: 'crux_isolation',  name: 'Crux move isolation',         sets: '2 problems × 10 reps', rest: '90 s', category: 'power',       notes: 'Identify the single hardest move on each; isolate and drill 10×.',           muscles: ['fingers', 'forearms', 'lats'],                 timer: { sec: 90, mode: 'rest', label: 'Rest between reps' } }),
    ex({ id: 'dynamic_movement',name: 'Dynamic movement',            sets: '5 problems × 3 attempts', rest: '—',category: 'power',         notes: 'Dynos, deadpoints, momentum-based sequences; commit fully.',                 muscles: ['lats', 'core', 'shoulders'],                   timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Moderate circuit V0–V1; thorough stretching.',                               muscles: ['forearms', 'hips', 'shoulders'],               timer: { sec: 0 } }),
  ];
  // Phase 4 — Performance (project attempts)
  return [
    ex({ id: 'warmup_pyramid',  name: 'Warm-up pyramid',             sets: '20–25 min',        rest: '—',       category: 'finger_prehab', notes: 'More thorough than any previous phase; V0 → 70% → 85% → 95%.',                muscles: ['fingers', 'forearms', 'shoulders'],            timer: { sec: 0 } }),
    ex({ id: 'visualisation',   name: 'Visualisation pre-attempt',   sets: '5 min / attempt',  rest: '—',       category: 'technique',     notes: 'Eyes closed; run the entire sequence; commit to the beta.',                  muscles: ['mind'],                                        timer: { sec: 0 } }),
    ex({ id: 'redpoint',        name: 'Redpoint attempts',           sets: '5–8 attempts',     rest: '12–15 min', category: 'max_strength',notes: 'Full rest between attempts. Do not attempt if mentally not ready.',          muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 780, mode: 'rest', label: 'Rest between attempts' } }),
    ex({ id: 'crux_isolation',  name: 'Crux isolation (if not sending)', sets: '20 min',       rest: '—',       category: 'power',         notes: 'Only if a specific move remains unsolved. Max 3 attempts per move.',         muscles: ['fingers', 'forearms', 'lats'],                 timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Low-intensity traversing; decompress; eat something.',                       muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
};

// ----- Volume session (Wed in 3-climb, Thu in 2-climb) ----------------------
const volumeExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Gentle movement, joint prep.',                                                muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'circuit_1',       name: 'Continuous circuit · Set 1',  sets: '30 min',           rest: '10 min',  category: 'muscular_endurance', notes: 'Non-stop V0–V1; target 20+ problems; pump target 3/10.',                muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 0 } }),
    ex({ id: 'circuit_2',       name: 'Continuous circuit · Set 2',  sets: '25 min',           rest: '—',       category: 'muscular_endurance', notes: 'Vary terrain: slab, vertical, slight overhang; V0–V2.',                  muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 0 } }),
    ex({ id: 'terrain_sample',  name: 'Terrain sampling',            sets: '15 min',           rest: '—',       category: 'technique',     notes: 'One problem on every angle in the gym.',                                      muscles: ['core', 'lats'],                                timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Gentle movement; forearm massage; wrist stretches.',                          muscles: ['forearms', 'wrists'],                          timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement, joint prep.',                                                  muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: '4x4',             name: '4×4 circuits',                sets: '4 rounds',         rest: '4 min',   category: 'muscular_endurance', notes: 'V1–V2 problems. 4 back-to-back, rest 4 min exactly. Last round hard.',  muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between rounds' } }),
    ex({ id: 'flash_circuit',   name: 'Moderate flash circuit',      sets: '20 problems',      rest: '—',       category: 'technique',     notes: 'V2–V3; single attempt per problem; record flash vs 2-go counts.',             muscles: ['fingers', 'forearms', 'lats'],                 timer: { sec: 0 } }),
    ex({ id: 'link_sets',       name: 'Link sets',                   sets: '5 × 2 linked',     rest: '2 min',   category: 'muscular_endurance', notes: 'Pick 2 adjacent problems, climb both without stepping off.',            muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 120, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Easy problems, forearm stretching.',                                          muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Raise HR to 60–65% max.',                                                     muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: '4x4_pe',          name: '4×4 PE circuits',             sets: '4 rounds',         rest: '4 min',   category: 'muscular_endurance', notes: 'V3–V4 problems. No rest within round. Final round must feel very hard.', muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between rounds' } }),
    ex({ id: 'traverse',        name: 'Traverse circuits',           sets: '4 × 5 min',        rest: '3 min',   category: 'muscular_endurance', notes: 'Continuous traversing at pump 6/10; do not stop mid-traverse.',          muscles: ['fingers', 'forearms', 'lats'],                 timer: { sec: 180, mode: 'rest', label: 'Rest between traverses' } }),
    ex({ id: 'linked',          name: 'Linked boulder sequences',    sets: '6 sets',           rest: '4 min',   category: 'muscular_endurance', notes: 'Connect 3 different problems back-to-back without stepping off.',        muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'V0 laps; forearm drainage; stretching.',                                      muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
  // Phase 4 — Performance Volume (comfort grade)
  return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Moderate.',                                                                    muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'free_climb',      name: 'Free climbing at comfort grade', sets: '45 min',        rest: '—',       category: 'technique',     notes: '1–2 grades below max; flash everything; stay fluid; no gripping hard.',       muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 0 } }),
    ex({ id: 'flash_challenge', name: 'Flash challenge',             sets: '15 problems',      rest: '—',       category: 'technique',     notes: 'Record how many you flash (target 12+/15 at comfortable grade).',             muscles: ['fingers', 'forearms', 'lats'],                 timer: { sec: 0 } }),
    ex({ id: 'traverse',        name: 'Traverse circuits',           sets: '3 × 5 min',        rest: '3 min',   category: 'muscular_endurance', notes: 'Moderate pump 5/10; stay relaxed.',                                      muscles: ['forearms', 'lats'],                            timer: { sec: 180, mode: 'rest', label: 'Rest between traverses' } }),
  ];
};

// ----- Technique session (Fri in 3-climb weeks only) ------------------------
const techExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement.',                                                              muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'hip_positioning', name: 'Hip positioning drills',      sets: '10 problems',      rest: '—',       category: 'technique',     notes: 'Consciously rotate hip into each move; V0–V1; slow.',                         muscles: ['hip flexors', 'glutes', 'core'],               timer: { sec: 0 } }),
    ex({ id: 'precise_feet',    name: 'Footwork: precise placements', sets: '3 problems × 5 reps', rest: '—',  category: 'technique',     notes: 'Pick the smallest part of the hold; zero readjustment.',                      muscles: ['feet', 'core'],                                timer: { sec: 0 } }),
    ex({ id: 'straight_arm',    name: 'Straight-arm climbing',       sets: '8 problems',       rest: '—',       category: 'technique',     notes: 'Keep arms straight as long as possible on each problem; V0–V2.',              muscles: ['lats', 'core', 'shoulders'],                   timer: { sec: 0 } }),
    ex({ id: 'route_reading',   name: 'Reading and visualisation',   sets: '5 problems',       rest: '—',       category: 'technique',     notes: 'Read the full problem before touching the wall; climb exactly as planned.',   muscles: ['mind'],                                        timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Stretching, hip flexors, thoracic rotation.',                                 muscles: ['hip flexors', 'thoracic spine'],               timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement.',                                                              muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'momentum',        name: 'Momentum and deadpoint drills', sets: '8 problems',     rest: '—',       category: 'power',         notes: 'Use body swing and hip pop rather than pure arm pull; V1–V3.',                muscles: ['core', 'glutes', 'shoulders'],                 timer: { sec: 0 } }),
    ex({ id: 'drop_knee',       name: 'Drop-knee practice',          sets: '3 problems × 5 reps', rest: '—',   category: 'technique',     notes: 'Identify problems where a drop-knee improves reach; repeat to groove.',       muscles: ['hip flexors', 'glutes', 'core'],               timer: { sec: 0 } }),
    ex({ id: 'flagging',        name: 'Flagging circuits',           sets: '6 problems',       rest: '—',       category: 'technique',     notes: 'Consciously flag on every move possible to prevent barn-door; V2–V3.',        muscles: ['core', 'glutes', 'hip flexors'],               timer: { sec: 0 } }),
    ex({ id: 'route_reading',   name: 'Route reading — then climb',  sets: '5 problems',       rest: '—',       category: 'technique',     notes: '90 s reading, then climb from memory; check moves vs plan.',                  muscles: ['mind'],                                        timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Easy movement, hip and shoulder mobility.',                                   muscles: ['hips', 'shoulders'],                           timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Moderate pace.',                                                              muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'quality_hard',    name: 'Movement quality on hard terrain', sets: '5 problems × 3 reps', rest: '—', category: 'technique', notes: '80% max; focus on body position and foot precision — not completion.',       muscles: ['feet', 'core', 'glutes'],                      timer: { sec: 0 } }),
    ex({ id: 'hooks',           name: 'Heel-hook / toe-hook practice', sets: '5 problems',     rest: '—',       category: 'technique',     notes: 'Find or set problems requiring hooks; master the engagement sequence.',      muscles: ['glutes', 'core', 'hamstrings'],                timer: { sec: 0 } }),
    ex({ id: 'compression',     name: 'Compression and squeeze technique', sets: '5 problems', rest: '—',       category: 'body_tension',  notes: 'Wide problems; use body tension and inward pressure; V3–V4.',                 muscles: ['core', 'lats', 'pecs'],                        timer: { sec: 0 } }),
    ex({ id: 'onsight',         name: 'Onsight simulation',          sets: '5 problems',       rest: '—',       category: 'technique',     notes: 'No prior inspection. First attempt only. Evaluate your decision-making.',     muscles: ['mind'],                                        timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Light movement, thorough stretching.',                                        muscles: ['forearms', 'hips'],                            timer: { sec: 0 } }),
  ];
  // Phase 4 — Performance Technique (style refinement)
  return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement.',                                                              muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'performance',     name: 'Performance climbing at hard-but-doable grade', sets: '8 problems', rest: '—', category: 'technique', notes: 'Not quite limit; focus on efficiency, minimalism, style; V(max-1)–V(max-2).', muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 0 } }),
    ex({ id: 'beta_variations', name: 'Problem variations (same start, different beta)', sets: '3 problems × 3 betas', rest: '—', category: 'technique', notes: 'Find 3 distinct ways to do the same problem.',                          muscles: ['mind'],                                        timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Stretching.',                                                                 muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
};

// ----- Home Gym A (Tuesday — both week types) -------------------------------
const homeAExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'band_pull_aparts',name: 'Band pull-aparts',            sets: '3 × 15',           rest: '60 s',    category: 'finger_prehab', notes: 'Arms straight out front; pull to T; light band; slow and controlled.',       muscles: ['shoulders', 'rear delts'],                     timer: { sec: 0 } }),
    ex({ id: 'ytwl',            name: 'YTWL raises',                 sets: '3 × 8 each',       rest: '60 s',    category: 'finger_prehab', notes: 'Prone or incline bench; scapular focus; very light weight.',                  muscles: ['shoulders', 'rear delts', 'rhomboids'],        timer: { sec: 0 } }),
    ex({ id: 'face_pulls',      name: 'Face pulls',                  sets: '3 × 15',           rest: '60 s',    category: 'finger_prehab', notes: 'Band or cable; pull to forehead; finish with external rotation.',             muscles: ['rear delts', 'rhomboids'],                     timer: { sec: 0 } }),
    ex({ id: 'ext_rotation',    name: 'External shoulder rotation',  sets: '3 × 12/side',      rest: '60 s',    category: 'finger_prehab', notes: 'Elbow at 90° against ribs; band or 1 kg; 3-1-3 tempo.',                       muscles: ['rotator cuff', 'shoulders'],                   timer: { sec: 0 } }),
    ex({ id: 'dead_bug',        name: 'Dead bug',                    sets: '3 × 10/side',      rest: '60 s',    category: 'body_tension',  notes: 'Lower back pressed to floor; slow; breathe out on extension.',                muscles: ['core', 'abs'],                                 timer: { sec: 0 } }),
    ex({ id: 'forearm_plank',   name: 'Forearm plank',               sets: '3 × 30 s',         rest: '60 s',    category: 'body_tension',  notes: 'Rigid body; breathe continuously; do not hold breath.',                       muscles: ['core', 'abs'],                                 timer: { sec: 30, mode: 'work', label: 'Hold' } }),
    ex({ id: 'hollow_body',     name: 'Hollow body hold',            sets: '3 × 20 s',         rest: '60 s',    category: 'body_tension',  notes: 'Arms overhead; lower back to floor; tuck knees if needed.',                   muscles: ['core', 'abs', 'hip flexors'],                  timer: { sec: 20, mode: 'work', label: 'Hold' } }),
    ex({ id: 'glute_bridges',   name: 'Glute bridges',               sets: '3 × 15',           rest: '60 s',    category: 'base_strength', notes: 'Feet hip-width; drive through heels; hold 2 s at top.',                       muscles: ['glutes', 'hamstrings'],                        timer: { sec: 0 } }),
    ex({ id: 'hip_stretch',     name: 'Hip flexor stretch',          sets: '60 s/side',        rest: '—',       category: 'mobility',      notes: 'Lunge, posterior tilt; breathe into the stretch.',                            muscles: ['hip flexors'],                                 timer: { sec: 0 } }),
    ex({ id: 'thoracic',        name: 'Thoracic rotation',           sets: '10/side',          rest: '—',       category: 'mobility',      notes: 'Hands behind head; rotate as far as comfortable.',                            muscles: ['thoracic spine'],                              timer: { sec: 0 } }),
    ex({ id: 'wrist_mobility',  name: 'Wrist mobility',              sets: '2 min',            rest: '—',       category: 'mobility',      notes: 'Circles, flexion/extension, prayer, reverse prayer.',                         muscles: ['wrists', 'forearms'],                          timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'max_hangs_20',    name: 'Fingerboard: 7-s max hangs, 20 mm open hand', sets: '6 sets', rest: '3–4 min', category: 'max_strength', notes: 'Add weight to reach failure at 10–12 s. Log every load.',               muscles: ['fingers', 'forearms'],                         timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'pinch_hangs',     name: 'Fingerboard: 45 mm pinch hangs', sets: '5 × 10 s',      rest: '2 min',   category: 'max_strength',  notes: 'BW or lightly loaded; open and close hand between sets.',                     muscles: ['fingers', 'forearms', 'thumb'],                timer: { sec: 10, mode: 'work', label: 'Hang' } }),
    ex({ id: 'weighted_pulls',  name: 'Weighted pull-ups',           sets: '5 × 3',            rest: '3 min',   category: 'max_strength',  notes: 'Add 10–20% BW. 3 s eccentric. Full extension at bottom.',                     muscles: ['lats', 'biceps', 'rear delts'],                timer: { sec: 180, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'lock_offs',       name: '90-degree lock-off holds',    sets: '3 × 10 s/arm',     rest: '2 min',   category: 'max_strength',  notes: 'Hold at 90° elbow flexion; resist gravity; log each arm.',                    muscles: ['biceps', 'lats', 'core'],                      timer: { sec: 10, mode: 'work', label: 'Hold' } }),
    ex({ id: 'knee_raises',     name: 'Hanging knee raises',         sets: '3 × 12',           rest: '60 s',    category: 'body_tension',  notes: 'Full hang; raise knees to chest; slow lower; no swing.',                      muscles: ['abs', 'hip flexors'],                          timer: { sec: 0 } }),
    ex({ id: 'front_lever_tuck',name: 'Front lever tuck hold',       sets: '3 × 15 s',         rest: '60 s',    category: 'body_tension',  notes: 'Arms straight, knees tucked, body horizontal.',                               muscles: ['lats', 'core', 'abs'],                         timer: { sec: 15, mode: 'work', label: 'Hold' } }),
    ex({ id: 'pushups',         name: 'Push-ups (antagonist)',       sets: '3 × 15',           rest: '60 s',    category: 'base_strength', notes: '2-0-2 tempo; no sagging; keep shoulder healthy.',                             muscles: ['chest', 'triceps', 'shoulders'],               timer: { sec: 0 } }),
    ex({ id: 'wrist_ext',       name: 'Wrist extensions',            sets: '3 × 15',           rest: '60 s',    category: 'finger_prehab', notes: 'Rice bucket, theraband, or plate; critical for pulley health.',               muscles: ['forearm extensors', 'wrists'],                 timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'repeaters_20',    name: 'Repeaters: 20 mm, 7 s on / 3 s off', sets: '3 × 6 reps', rest: '3–4 min', category: 'muscular_endurance', notes: 'BW, open hand. Pump 7/10 by end of set.',                                muscles: ['fingers', 'forearms'],                         timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'repeaters_25',    name: 'Repeaters: 25 mm, 7 s on / 3 s off', sets: '2 × 6 reps', rest: '3–4 min', category: 'muscular_endurance', notes: 'Same protocol, slightly larger edge.',                                  muscles: ['fingers', 'forearms'],                         timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'pull_max_out',    name: 'Weighted pull-ups → BW max-out', sets: '3 rounds',      rest: '3 min',   category: 'muscular_endurance', notes: '3 reps at 15% BW added → drop weight → pull to failure.',                muscles: ['lats', 'biceps'],                              timer: { sec: 180, mode: 'rest', label: 'Rest between rounds' } }),
    ex({ id: 'ring_pushups',    name: 'Ring push-ups',               sets: '3 × 15',           rest: '60 s',    category: 'base_strength', notes: 'Rings at knee height; full range; slow descent.',                             muscles: ['chest', 'triceps', 'shoulders'],               timer: { sec: 0 } }),
    ex({ id: 'pistol_squats',   name: 'Pistol squats',               sets: '3 × 8/leg',        rest: '60 s',    category: 'base_strength', notes: 'Control descent; hold 2 s at bottom; use wall for balance initially.',        muscles: ['quads', 'glutes', 'core'],                     timer: { sec: 0 } }),
    ex({ id: 'l_sit',           name: 'L-sit hold',                  sets: '3 × max time',     rest: '2 min',   category: 'body_tension',  notes: 'Straight arms and legs; bent knees acceptable.',                              muscles: ['core', 'abs', 'hip flexors', 'triceps'],       timer: { sec: 0 } }),
    ex({ id: 'compression',     name: 'Compression block / knee squeeze', sets: '3 × 8',       rest: '60 s',    category: 'body_tension',  notes: 'Seated; squeeze large block between knees; builds body-tension strength.',    muscles: ['adductors', 'core'],                           timer: { sec: 0 } }),
  ];
  // Phase 4 — Maintenance
  return [
    ex({ id: 'max_hangs_20',    name: 'Fingerboard: 7-s max hangs, 20 mm', sets: '4 sets',     rest: '4 min',   category: 'max_strength',  notes: 'Maintain Phase 3 contact strength; same load; no new PBs now.',               muscles: ['fingers', 'forearms'],                         timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'weighted_pulls',  name: 'Weighted pull-ups',           sets: '3 × 3',            rest: '3 min',   category: 'max_strength',  notes: 'Same load as Phase 3; maintenance only.',                                     muscles: ['lats', 'biceps'],                              timer: { sec: 180, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'system_board',    name: 'Specificity: system board moves', sets: '15 min',        rest: '—',       category: 'technique',     notes: 'Mimic hold types and movement patterns from your project.',                    muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 0 } }),
    ex({ id: 'antagonist',      name: 'Light antagonist: push-ups + bands', sets: '2 × 15 + 2 × 20', rest: '60 s', category: 'base_strength', notes: 'Keep shoulder health; minimal fatigue.',                                  muscles: ['chest', 'shoulders', 'rear delts'],            timer: { sec: 0 } }),
    ex({ id: 'core',            name: 'Core: front lever + L-sit',   sets: '2 × max time each',rest: '60 s',    category: 'body_tension',  notes: 'Maintenance volume only.',                                                    muscles: ['core', 'lats', 'abs'],                         timer: { sec: 0 } }),
    ex({ id: 'mobility',        name: 'Mobility routine',            sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Full body — hips, shoulders, wrists; non-negotiable.',                        muscles: ['hips', 'shoulders', 'wrists'],                 timer: { sec: 0 } }),
  ];
};

// ----- Home Gym B (Sat in 3-climb, Fri in 2-climb) --------------------------
const homeBExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'ring_rows',       name: 'Ring rows or TRX rows',       sets: '3 × 10',           rest: '60 s',    category: 'base_strength', notes: 'Body at ~45° angle; pull chest to hands; 3 s descent.',                       muscles: ['lats', 'rhomboids', 'biceps'],                 timer: { sec: 0 } }),
    ex({ id: 'band_pull_aparts',name: 'Band pull-aparts',            sets: '2 × 20',           rest: '60 s',    category: 'finger_prehab', notes: 'Faster tempo than Home A; maintain form.',                                    muscles: ['shoulders', 'rear delts'],                     timer: { sec: 0 } }),
    ex({ id: 'pushups',         name: 'Push-ups',                    sets: '3 × 12',           rest: '60 s',    category: 'base_strength', notes: 'Straight body; full range; slow descent; antagonist work.',                  muscles: ['chest', 'triceps', 'shoulders'],               timer: { sec: 0 } }),
    ex({ id: 'dead_hang',       name: 'Hanging dead hangs',          sets: '3 × 20 s',         rest: '60 s',    category: 'finger_prehab', notes: 'Relax shoulders; feel the decompression; gentle swing OK.',                   muscles: ['fingers', 'forearms', 'shoulders'],            timer: { sec: 20, mode: 'work', label: 'Hang' } }),
    ex({ id: 'frog_hold',       name: 'Frog hip mobility hold',      sets: '2 × 45 s',         rest: '60 s',    category: 'mobility',      notes: 'Face down; knees out; ease hips toward floor; no forcing.',                   muscles: ['hips', 'adductors'],                           timer: { sec: 45, mode: 'work', label: 'Hold' } }),
    ex({ id: 'pigeon',          name: 'Pigeon stretch',              sets: '60 s/side',        rest: '—',       category: 'mobility',      notes: 'Deep hip external rotation; use a pad under the hip.',                        muscles: ['glutes', 'hips'],                              timer: { sec: 0 } }),
    ex({ id: 'childs_pose',     name: "Child's pose with lat stretch",sets: '60 s/side',       rest: '—',       category: 'mobility',      notes: 'Reach one arm long; feel lat and shoulder open.',                             muscles: ['lats', 'shoulders'],                           timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'max_hangs_25',    name: 'Fingerboard: 7-s max hangs, 25 mm edge', sets: '4 sets',rest: '3–4 min', category: 'max_strength',  notes: 'Slightly larger edge; same rest protocol; log weight.',                       muscles: ['fingers', 'forearms'],                         timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'one_arm_assisted',name: 'One-arm assisted dead hangs', sets: '3 × 10 s/arm',     rest: '2 min',   category: 'max_strength',  notes: 'Band-assisted; enough support to hold 10 s with effort; log assistance.',     muscles: ['fingers', 'forearms', 'lats'],                 timer: { sec: 10, mode: 'work', label: 'Hang' } }),
    ex({ id: 'ring_rows_elev',  name: 'Ring rows — feet elevated',   sets: '3 × 10',           rest: '60 s',    category: 'base_strength', notes: 'Body horizontal; pull chest to rings; 3 s descent.',                          muscles: ['lats', 'rhomboids', 'biceps'],                 timer: { sec: 0 } }),
    ex({ id: 'ext_press',       name: 'Shoulder external rotation + overhead press', sets: '3 × 10', rest: '60 s', category: 'finger_prehab', notes: 'Band: ext. rotation → press → return; slow and controlled.',             muscles: ['shoulders', 'rotator cuff'],                   timer: { sec: 0 } }),
    ex({ id: 'weighted_plank',  name: 'Weighted plank',              sets: '3 × 40 s',         rest: '60 s',    category: 'body_tension',  notes: 'Weight plate on back; elbows under shoulders.',                               muscles: ['core', 'abs'],                                 timer: { sec: 40, mode: 'work', label: 'Hold' } }),
    ex({ id: 'hip_9090',        name: 'Hip 90/90 transitions',       sets: '10/side',          rest: '—',       category: 'mobility',      notes: 'Maintain Phase 1 hip mobility gains; do not let these slip.',                  muscles: ['hips', 'glutes'],                              timer: { sec: 0 } }),
    ex({ id: 'forearm_stretch', name: 'Forearm stretch routine',     sets: '5 min',            rest: '—',       category: 'mobility',      notes: 'Wrist extension stretch, prayer, reverse prayer, forearm cross-body.',         muscles: ['forearms', 'wrists'],                          timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'max_hangs_20',    name: 'Fingerboard: 7-s max hangs, 20 mm', sets: '4 sets',     rest: '4 min',   category: 'max_strength',  notes: 'Maintain Phase 2 strength; same load; log weight.',                            muscles: ['fingers', 'forearms'],                         timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'explosive_pulls', name: 'Explosive pull-ups',          sets: '5 × 3',            rest: '3 min',   category: 'power',         notes: 'Pull as fast as possible; feel the acceleration; no kipping.',                muscles: ['lats', 'biceps'],                              timer: { sec: 180, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'one_arm_assisted',name: 'One-arm assisted dead hangs', sets: '3 × 10 s/arm',     rest: '2 min',   category: 'max_strength',  notes: 'Log assistance level; aim to reduce vs Phase 2.',                              muscles: ['fingers', 'forearms', 'lats'],                 timer: { sec: 10, mode: 'work', label: 'Hang' } }),
    ex({ id: 'trx_pushups',     name: 'TRX ring push-ups',           sets: '3 × 12',           rest: '60 s',    category: 'base_strength', notes: 'Rings at chest height; unstable surface for shoulder health.',                muscles: ['chest', 'shoulders'],                          timer: { sec: 0 } }),
    ex({ id: 'band_pull_aparts',name: 'Band pull-aparts',            sets: '2 × 20',           rest: '60 s',    category: 'finger_prehab', notes: 'Maintain shoulder health under increased training load.',                     muscles: ['rear delts', 'rhomboids'],                     timer: { sec: 0 } }),
    ex({ id: 'mobility',        name: 'Hip and shoulder mobility',   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Non-negotiable — do not let mobility decay under fatigue.',                    muscles: ['hips', 'shoulders'],                           timer: { sec: 0 } }),
  ];
  // Phase 4 — Maintenance B (same content as Home A maintenance)
  return homeAExercises(phase, deload);
};

// ----- Light Home (Week 15 deload Tuesday) ----------------------------------
const lightHomeExercises = () => [
  ex({ id: 'bands',             name: 'Band work',                   sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Light band work only; no fingerboarding; no loaded pulling.',                  muscles: ['shoulders', 'rear delts', 'rotator cuff'],     timer: { sec: 0 } }),
  ex({ id: 'mobility',          name: 'Mobility',                    sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Hips, shoulders, wrists, thoracic spine.',                                     muscles: ['hips', 'shoulders', 'wrists'],                 timer: { sec: 0 } }),
  ex({ id: 'light_core',        name: 'Light core',                  sets: '5 min',            rest: '—',       category: 'body_tension',  notes: 'Easy dead bugs and bird dogs; nothing fatiguing.',                            muscles: ['core', 'abs'],                                 timer: { sec: 0 } }),
];

// ----- Testing exercises (Week 16) ------------------------------------------
// Each test session in week 16 lists which assessments to run that day. The
// detailed protocol lives in ASSESSMENTS below and is captured in the
// dedicated Assessments view.
const testingExercises = (testDay) => {
  if (testDay === 'wed') return [
    ex({ id: 'test_1', name: 'Test 1 — Max-Weight Dead Hang (20 mm)', sets: '—', rest: '10 min', category: 'max_strength', notes: 'Full protocol in Assessments tab. Log result there.', muscles: ['fingers', 'forearms'], timer: { sec: 0 } }),
    ex({ id: 'test_2', name: 'Test 2 — Max Dead-Hang Pull-Ups',       sets: '—', rest: '8 min',  category: 'max_strength', notes: 'Full protocol in Assessments tab.',                  muscles: ['lats', 'biceps'],     timer: { sec: 0 } }),
    ex({ id: 'test_3', name: 'Test 3 — 90° Lock-Off (dominant arm)',  sets: '—', rest: '5 min',  category: 'max_strength', notes: 'Best of 2 attempts.',                                 muscles: ['biceps', 'lats'],     timer: { sec: 0 } }),
  ];
  if (testDay === 'thu') return [
    ex({ id: 'test_4', name: 'Test 4 — L-Sit Hold',                   sets: '—', rest: '20 min', category: 'body_tension', notes: 'Note bent-knee vs straight-leg.',                     muscles: ['core', 'abs'],        timer: { sec: 0 } }),
    ex({ id: 'test_5', name: 'Test 5 — 7-3 Repeater Reps to Failure', sets: '—', rest: '12 min', category: 'muscular_endurance', notes: '20 mm, BW only, open hand.',                muscles: ['fingers', 'forearms'],timer: { sec: 0 } }),
  ];
  if (testDay === 'fri') return [
    ex({ id: 'test_6', name: 'Test 6 — Bouldering Pyramid',           sets: '—', rest: '—',      category: 'technique',    notes: 'Dedicated fresh session. Record max flash and redpoint.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 0 } }),
  ];
  if (testDay === 'sat') return [
    ex({ id: 'test_7',  name: 'Test 7 — 4×4 Anaerobic Capacity',      sets: '—', rest: '—',      category: 'muscular_endurance', notes: '4 problems at flash − 3 grades; 4 rounds.',         muscles: ['fingers', 'forearms', 'lats'], timer: { sec: 0 } }),
    ex({ id: 'test_8',  name: 'Test 8 — Campus Rung Contact',         sets: '—', rest: '5 min',  category: 'power',        notes: '1-3, 1-4, 1-5 from rung 1; 3 attempts per target.',   muscles: ['fingers', 'forearms', 'lats'], timer: { sec: 0 } }),
    ex({ id: 'test_9',  name: 'Test 9 — Frog Hip Mobility',           sets: '—', rest: '—',      category: 'mobility',     notes: 'Angle between thigh and torso at max comfortable range.', muscles: ['hips', 'adductors'],    timer: { sec: 0 } }),
    ex({ id: 'test_10', name: 'Test 10 — ARC Aerobic Base',           sets: '—', rest: '—',      category: 'muscular_endurance', notes: 'Maintain pump 3/10 for 20 min continuous traversing.', muscles: ['forearms', 'lats'],    timer: { sec: 0 } }),
  ];
  return [];
};

// ----- Rest day -------------------------------------------------------------
const restExercises = () => [
  ex({
    id: 'rest_note',
    name: 'Active recovery',
    sets: 'Light',
    rest: '—',
    category: 'mobility',
    notes: 'Walking, light mobility, gentle stretching.',
    progression: 'Tendons adapt slower than muscles — earn your gains here.',
    description: 'A 20–30 min walk. Light mobility for hips and shoulders. Light stretching. Sleep early, hit your protein target (1.8–2.2 g/kg), and warm up thoroughly before any next climbing day.',
    muscles: ['recovery'],
    timer: { sec: 0 },
  }),
];

// ----------------------------------------------------------------------------
// Home gym session names per phase (from the PDF).
// ----------------------------------------------------------------------------
const HOME_A_NAMES = {
  1: { full: 'Prehab, Core & Mobility',                short: 'Prehab' },
  2: { full: 'Fingerboard + Pulling Strength',         short: 'Fingerboard' },
  3: { full: 'Repeater Fingerboarding + SE',           short: 'Repeaters' },
  4: { full: 'Maintenance',                            short: 'Maintenance' },
};
const HOME_B_NAMES = {
  1: { full: 'Prehab & Mobility (repeat)',             short: 'Prehab' },
  2: { full: 'Accessory Strength',                     short: 'Accessory' },
  3: { full: 'Contact Strength + Maintenance',         short: 'Contact' },
  4: { full: 'Maintenance',                            short: 'Maintenance' },
};

// ----------------------------------------------------------------------------
// Build a session for a given type + week context.
// ----------------------------------------------------------------------------
function buildSession(type, phase, opts = {}) {
  const { deload = false, testDay = null } = opts;
  switch (type) {
    case 'limit':
      return { id: 'limit', name: deload ? 'Limit (deload)' : 'Limit Bouldering', short: 'Limit', duration: deload ? '90 min' : '~2 hrs', plannedMinutes: deload ? 90 : 120, location: 'Wall', accent: '#C2A878', exercises: limitExercises(phase, deload) };
    case 'volume':
      return { id: 'volume', name: deload ? 'Volume (deload)' : 'Volume / Endurance', short: 'Volume', duration: deload ? '60 min' : '~90 min', plannedMinutes: deload ? 60 : 90, location: 'Wall', accent: '#7A9E5F', exercises: volumeExercises(phase, deload) };
    case 'tech':
      return { id: 'tech', name: 'Technique', short: 'Technique', duration: '~75 min', plannedMinutes: 75, location: 'Wall', accent: '#A8957A', exercises: techExercises(phase, deload) };
    case 'homeA': {
      const n = HOME_A_NAMES[phase.id] || { full: 'Home Gym', short: 'Home' };
      return { id: 'homeA', name: n.full, short: n.short, duration: '~60 min', plannedMinutes: 60, location: 'Home', accent: '#94A3B8', exercises: homeAExercises(phase, deload) };
    }
    case 'homeB': {
      const n = HOME_B_NAMES[phase.id] || { full: 'Home Gym', short: 'Home' };
      return { id: 'homeB', name: n.full, short: n.short, duration: '~60 min', plannedMinutes: 60, location: 'Home', accent: '#94A3B8', exercises: homeBExercises(phase, deload) };
    }
    case 'lightHome':
      return { id: 'lightHome', name: 'Light Home (deload)', short: 'Light', duration: '~30 min', plannedMinutes: 30, location: 'Home', accent: '#6E94A8', exercises: lightHomeExercises() };
    case 'testing':
      return { id: 'testing', name: 'Testing', short: 'Test', duration: 'Varies', plannedMinutes: 60, location: 'Wall / Home', accent: '#D97757', exercises: testingExercises(testDay) };
    case 'rest':
    default:
      return { id: 'rest', name: 'Rest', short: 'Rest', duration: 'Full day off', plannedMinutes: 0, location: 'Active recovery only', accent: '#444', exercises: restExercises() };
  }
}

// ----------------------------------------------------------------------------
// Default weekly pattern (per cadence).
// Cadence values: '3day' (3-climb default) or '2day' (2-climb busy week).
// Week 15 (deep deload) and Week 16 (testing) use fixed patterns regardless
// of cadence. Week 4/8/12 follow the same pattern as a normal week of their
// cadence, but the `deload` flag flows through to session content.
// ----------------------------------------------------------------------------
export function getDefaultPattern(weekNumber, cadence = '3day') {
  if (weekNumber === 15) {
    // Deep deload — 2 easy climbing sessions (Mon + Fri) + 1 light home (Tue).
    return ['volume', 'lightHome', 'rest', 'rest', 'volume', 'rest', 'rest'];
  }
  if (weekNumber === 16) {
    // Testing week — Mon/Tue rest, Wed–Sat testing, Sun rest.
    return ['rest', 'rest', 'testing', 'testing', 'testing', 'testing', 'rest'];
  }
  if (cadence === '2day') {
    // 2-climb busy week: Mon Limit · Tue HomeA · Wed Rest · Thu Volume · Fri HomeB · Sat Rest · Sun Rest
    return ['limit', 'homeA', 'rest', 'volume', 'homeB', 'rest', 'rest'];
  }
  // 3-climb default: Mon Limit · Tue HomeA · Wed Volume · Thu Rest · Fri Tech · Sat HomeB · Sun Rest
  return ['limit', 'homeA', 'volume', 'rest', 'tech', 'homeB', 'rest'];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Week 16 maps Wed/Thu/Fri/Sat day indices to specific test days.
const TESTING_DAY_KEYS = { 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat' };

// ----------------------------------------------------------------------------
// Build full week schedule.
// ----------------------------------------------------------------------------
export function getWeekSchedule(weekNumber, cadence = '3day', pattern = null) {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isDeepDeload = phase.deepDeloadWeek === weekNumber;
  const isTesting = phase.testingWeek === weekNumber;
  const usePattern = pattern || getDefaultPattern(weekNumber, cadence);

  return usePattern.map((type, i) => {
    const opts = { deload: isDeload };
    if (isTesting && type === 'testing') opts.testDay = TESTING_DAY_KEYS[i] || null;
    return {
      dayLabel: DAY_LABELS[i],
      dayIndex: i,
      weekNumber,
      sessionType: type,
      session: buildSession(type, phase, opts),
      isDeload,
      isDeepDeload,
      isTesting,
    };
  });
}

export function getWeekMeta(weekNumber) {
  const phase = getPhase(weekNumber);
  const isDeload = phase.deloadWeek === weekNumber;
  const isDeepDeload = phase.deepDeloadWeek === weekNumber;
  const isTesting = phase.testingWeek === weekNumber;
  const startDate = addDays(PLAN_START_DATE, (weekNumber - 1) * 7);
  const endDate = addDays(startDate, 6);
  let tag = null;
  if (isTesting) tag = 'Testing';
  else if (isDeepDeload) tag = 'Deload';
  else if (isDeload) tag = 'Deload';
  return { weekNumber, phase, isDeload, isDeepDeload, isTesting, tag, startDate, endDate };
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
// ----------------------------------------------------------------------------
export function getAllSessions(cadenceFor = () => '3day', patternFor = () => null) {
  const out = [];
  for (let w = 1; w <= 16; w++) {
    const week = getWeekSchedule(w, cadenceFor(w), patternFor(w));
    week.forEach((d, i) => {
      out.push({ weekNumber: w, dayIndex: i, sessionType: d.sessionType, session: d.session, isDeload: d.isDeload, isDeepDeload: d.isDeepDeload, isTesting: d.isTesting });
    });
  }
  return out;
}

// ----------------------------------------------------------------------------
// Build the exercise catalog (for search). Each catalog entry is unique per
// session-type + phase + exercise id.
// ----------------------------------------------------------------------------
// Exercise ids treated as housekeeping (warm-up / cool-down / reflection) and
// hidden from the searchable catalog so they don't clutter the Notes page.
const HOUSEKEEPING_IDS = new Set(['warmup', 'warmup_pyramid', 'cooldown', 'reflect']);

export function buildExerciseCatalog() {
  const seen = new Set();
  const catalog = [];
  const sessionTypes = ['limit', 'volume', 'tech', 'homeA', 'homeB', 'lightHome', 'testing'];
  PHASES.forEach(phase => {
    sessionTypes.forEach(t => {
      // For testing sessions, pull from all 4 days. Phase 4 only.
      if (t === 'testing' && phase.id !== 4) return;
      const builds = t === 'testing'
        ? ['wed', 'thu', 'fri', 'sat'].map(td => buildSession(t, phase, { testDay: td }))
        : [buildSession(t, phase, { deload: false })];
      builds.forEach(s => {
        s.exercises.forEach(e => {
          if (HOUSEKEEPING_IDS.has(e.id)) return;
          const key = `${t}:p${phase.id}:${e.id}`;
          if (seen.has(key)) return;
          seen.add(key);
          catalog.push({
            sessionType: t,
            sessionName: s.name,
            sessionAccent: s.accent,
            phaseId: phase.id,
            phaseName: phase.name,
            id: e.id,
            name: e.name,
            category: e.category,
            description: e.description,
            muscles: e.muscles || [],
            progression: e.progression,
            sets: e.sets,
            rest: e.rest,
            timer: e.timer,
            notes: e.notes,
          });
        });
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
// Standardised assessments — Week 1 baseline + Week 16 retest.
// ----------------------------------------------------------------------------
export const ASSESSMENTS = [
  {
    id: 'dead_hang',
    number: 1,
    name: 'Max-Weight Dead Hang — 20 mm Edge',
    equipment: 'Fingerboard, weight belt, scales',
    protocol: 'Warm fingers thoroughly (10+ min easy hanging). Add weight until failure occurs at 8–12 s, open-hand grip, 20 mm edge. Two attempts max. Rest 10 min before next test.',
    scoring: 'Total load (BW + added weight, kg) held for 10 s.',
    why: 'Finger strength per kg BW is the top predictor of climbing performance.',
    unit: 'kg',
    day: 'wed',
  },
  {
    id: 'pull_ups',
    number: 2,
    name: 'Max Dead-Hang Pull-Ups',
    equipment: 'Pull-up bar',
    protocol: 'Dead hang start. Pull chin over bar. No kipping. Count to failure. Rest 8 min.',
    scoring: 'Total reps in one unbroken set.',
    why: 'Upper-body pulling strength and endurance foundation.',
    unit: 'reps',
    day: 'wed',
  },
  {
    id: 'lock_off',
    number: 3,
    name: '90-Degree Lock-Off (Dominant Arm)',
    equipment: 'Pull-up bar',
    protocol: 'Pull to 90° elbow flexion, hold max time. Timer stops when elbow breaks 90°. Best of 2 attempts, 5 min rest between.',
    scoring: 'Duration in seconds.',
    why: 'Lock-off strength for clipping, reaching, and steep climbing.',
    unit: 's',
    day: 'wed',
  },
  {
    id: 'l_sit',
    number: 4,
    name: 'L-Sit Hold',
    equipment: 'Parallel bars, rings, or sturdy chairs',
    protocol: 'Support BW on straight arms, legs horizontal. Bent knee acceptable — note which. Time to failure.',
    scoring: 'Duration in seconds (note bent-knee vs. straight-leg).',
    why: 'Core compression strength for high feet and steep terrain.',
    unit: 's',
    day: 'thu',
  },
  {
    id: 'repeaters',
    number: 5,
    name: '7-3 Repeater Reps to Failure — 20 mm, Bodyweight',
    equipment: 'Fingerboard',
    protocol: '7 s hang / 3 s off = 1 rep. Count reps until you cannot complete a full 7 s hang. Open hand, 20 mm edge, bodyweight only. Rest 12 min.',
    scoring: 'Total reps to failure.',
    why: 'Finger strength-endurance across a route or long boulder.',
    unit: 'reps',
    day: 'thu',
  },
  {
    id: 'pyramid',
    number: 6,
    name: 'Bouldering Pyramid',
    equipment: 'Bouldering wall',
    protocol: 'Fresh session: warm up, then climb a full pyramid. Record (a) max flash grade and (b) max redpoint grade within 5 attempts.',
    scoring: 'Max flash grade / max redpoint grade.',
    why: 'Direct measure of climbing performance — the ultimate goal.',
    unit: 'grade',
    day: 'fri',
  },
  {
    id: '4x4_test',
    number: 7,
    name: '4×4 Anaerobic Capacity Test',
    equipment: 'Bouldering wall, stopwatch',
    protocol: 'Choose 4 problems at comfortable flash grade (3–4 below max). Climb all 4 back-to-back. Rest 4 min. Repeat 4 rounds. Record completion and HR after round 4.',
    scoring: 'Rounds completed (of 4) + post-set HR (bpm).',
    why: 'Anaerobic capacity for crux-heavy sport routes.',
    unit: 'rounds + bpm',
    day: 'sat',
  },
  {
    id: 'campus',
    number: 8,
    name: 'Campus Rung Contact Strength',
    equipment: 'Campus board (22 mm rungs, 22 cm spacing)',
    protocol: 'From rung 1, touch rung 3 with dominant hand (dynamic). Then attempt 1-4, 1-5. 3 attempts per target, 5 min rest between levels.',
    scoring: 'Highest rung contacted with control from rung 1.',
    why: 'Explosive contact strength for dynamic moves and big spans.',
    unit: 'rung',
    day: 'sat',
  },
  {
    id: 'frog_mobility',
    number: 9,
    name: 'Frog Position Hip Mobility',
    equipment: 'Padded floor',
    protocol: 'Face down, knees out to 90°, lower hips toward floor. Record angle between thigh and torso at max comfortable range. Note any asymmetry or discomfort.',
    scoring: 'Angle in degrees at max comfortable range.',
    why: 'Hip mobility governs high steps, flags, and foot-generated tension on steep walls.',
    unit: 'degrees',
    day: 'sat',
  },
  {
    id: 'arc_test',
    number: 10,
    name: 'ARC Aerobic Base Test',
    equipment: 'Bouldering or traversing wall',
    protocol: 'Maintain pump at 3/10 for 20 continuous minutes of easy traversing. Record whether you stayed at or below 5/10 for the full duration.',
    scoring: 'Pass/Fail at 20 min; peak pump rating (0–10).',
    why: 'Aerobic capillary base — allows forearm recovery on rests during routes.',
    unit: 'pass/fail + 0-10',
    day: 'sat',
  },
];

// ----------------------------------------------------------------------------
// Notes content (reference)
// ----------------------------------------------------------------------------
export const NOTES_CONTENT = [
  {
    id: 'projecting',
    heading: 'On Projecting (Phase 2 onwards)',
    items: [
      { title: 'Pick one or two problems', body: 'Per session, pick problems that feel completely out of reach and spend real time on them.' },
      { title: 'Deconstruct the crux', body: 'Work it in isolation. Finger strength, body position, footwork, or commitment — figure out what is actually stopping you.' },
      { title: 'Earn steeper terrain', body: 'Body tension on steep board angles before you are ready just teaches you to flail. Earn the angle.' },
    ],
  },
  {
    id: 'life_intervenes',
    heading: 'When Life Intervenes',
    items: [
      { title: 'Only 2 climbing sessions this week', body: 'Use the 2-climb template. Keep both home gym sessions. The Technique session drops — do not try to squeeze it in.' },
      { title: 'Cannot make it to the wall', body: 'Run both home gym sessions. Add extra pull-up volume. Do not try to make up lost climbing the following week.' },
      { title: 'Finger tweak or pulley pain', body: 'Drop all fingerboarding immediately. Continue home gym upper-body and easy slab climbing or footwork drills only.' },
      { title: 'Under-recovered into Phase 3', body: 'Insert an extra deload week between Phase 2 and Phase 3. Repeat the Phase 2 Week 8 protocol.' },
      { title: 'Sent your project mid-Phase 4', body: 'Pick a new, slightly harder project. Continue the same session structure with the new target.' },
    ],
  },
];
