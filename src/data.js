// ============================================================================
// SEND · 17-Week Climbing Training Program
// 4 phases (Foundation, Strength, Power Endurance, Performance), two deload
// weeks (9 and 16), one testing week (17). Built for TB2 + rings/KB home gym.
// Week 1 begins Monday 18 May 2026.
// ============================================================================

export const PLAN_START_DATE = '2026-05-18';
export const TOTAL_WEEKS = 17;

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
// Two planned deload weeks: week 9 (between Phase 2 and 3) and week 16
// (before testing). Testing happens in week 17. Each phase owns its
// deload/testing week via deepDeloadWeek / testingWeek flags so getPhase
// resolves correctly.
// ----------------------------------------------------------------------------
export const PHASES = [
  {
    id: 1,
    name: 'Foundation',
    weeks: [1, 2, 3, 4],
    accent: '#7A9E5F',
    focus: 'Tendon conditioning, movement quality, aerobic base. Limit bouldering at controlled 75–80% intensity; home gym is prehab + core + mobility.',
    limitGrade: '75–80% TB2 max',
    deloadWeek: null,
  },
  {
    id: 2,
    name: 'Strength',
    weeks: [5, 6, 7, 8, 9], // week 9 is the deload that closes the phase
    accent: '#C2A878',
    focus: 'Maximum force production. Hangboard max hangs + TB2 limit bouldering at 85–92%. Home gym shifts to weighted ring pull-ups and lock-offs.',
    limitGrade: '85–92% TB2 max',
    deloadWeek: null,
    deepDeloadWeek: 9,
  },
  {
    id: 3,
    name: 'Power Endurance',
    weeks: [10, 11, 12, 13],
    accent: '#D97757',
    focus: 'Sustain hard moves with incomplete recovery. Hangboard repeaters, 4×4 / linked-circuit volume sessions, ring-progression supersets.',
    limitGrade: '90–95% TB2 max',
    deloadWeek: null,
  },
  {
    id: 4,
    name: 'Performance',
    weeks: [14, 15, 16, 17], // 14–15 = peak; 16 = deload; 17 = testing
    accent: '#B88A6F',
    focus: 'Project redpoints; volume drops, intent peaks. Hangboard cut to 3 maintenance sets. Week 16 is a deload, week 17 is testing.',
    limitGrade: 'Project grade',
    deloadWeek: null,
    deepDeloadWeek: 16,
    testingWeek: 17,
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
    ex({ id: 'warmup',          name: 'Warm-up on main wall',        sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy problems you can flash with half effort; move through different holds and angles.', muscles: ['fingers', 'wrists', 'forearms', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'tb2_warmup',      name: 'TB2 warm-up sets',            sets: '3 problems',       rest: '—',       category: 'finger_prehab', notes: 'Pick grades 4–5 below your working limit; one attempt each; get used to the board.',    muscles: ['fingers', 'forearms', 'shoulders'],           timer: { sec: 0 } }),
    ex({ id: 'tb2_limit',       name: 'Limit bouldering on TB2',     sets: '6–8 problems',     rest: '3 min',   category: 'max_strength',  notes: '75–80% of TB2 max. 3–4 attempts per problem. Focus: complete the problem, not style points.', muscles: ['fingers', 'forearms', 'lats', 'core'],  timer: { sec: 180, mode: 'rest', label: 'Rest between problems' } }),
    ex({ id: 'best_send_reps',  name: 'Repeat your best send',       sets: '3 reps',           rest: '2 min',   category: 'technique',     notes: 'Hardest problem you completed above; repeat 3× to groove the movement.',                muscles: ['fingers', 'forearms', 'lats', 'core'],        timer: { sec: 120, mode: 'rest', label: 'Rest between reps' } }),
    ex({ id: 'cooldown',        name: 'Cool-down on main wall',      sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Easy laps; loosen arms; do not go home still pumped.',                                  muscles: ['forearms', 'shoulders'],                      timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'warmup',          name: 'Warm-up on main wall',        sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy to moderate problems; last 5 min at 70% intensity; get blood into fingers before hanging.', muscles: ['fingers', 'forearms', 'shoulders'],    timer: { sec: 0 } }),
    ex({ id: 'max_hangs',       name: 'Hangboard: 7-s max hangs, 20 mm open hand', sets: '5 sets', rest: '3 min', category: 'max_strength', notes: 'Add weight (belt or KB) so you reach near-failure at 10–12 s. Open-hand only — no full crimp. Log every load.', muscles: ['fingers', 'forearms'],   timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'shake_out',       name: 'Rest / shake-out',            sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Fully relax forearms; walk around; do not rush into bouldering.',                       muscles: ['forearms'],                                   timer: { sec: 0 } }),
    ex({ id: 'tb2_warmup',      name: 'TB2 warm-up sets',            sets: '2 problems',       rest: '—',       category: 'finger_prehab', notes: 'Grade 3 below limit; one send each; get eyes sharp for the board.',                     muscles: ['fingers', 'forearms'],                        timer: { sec: 0 } }),
    ex({ id: 'tb2_limit',       name: 'Limit bouldering on TB2',     sets: '6–8 problems',     rest: '4 min',   category: 'max_strength',  notes: '85–92% of TB2 max. 3–4 attempts per problem. Log what failed each attempt.',            muscles: ['fingers', 'forearms', 'lats', 'core'],        timer: { sec: 240, mode: 'rest', label: 'Rest between attempts' } }),
    ex({ id: 'crimp_sloper',    name: 'Crimp vs. sloper contrast',   sets: '4 problems',       rest: '3 min',   category: 'max_strength',  notes: '2 crimp-heavy, 2 sloper/compression; 3 attempts each; identify your weaker grip type.',  muscles: ['fingers', 'forearms'],                        timer: { sec: 180, mode: 'rest', label: 'Rest between problems' } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Easy main wall; pump down fully before leaving.',                                       muscles: ['forearms'],                                   timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'warmup',          name: 'Warm-up on main wall',        sets: '15 min',           rest: '—',       category: 'finger_prehab', notes: 'Thorough — include dynamic movements and a few moderate problems at 70%.',              muscles: ['fingers', 'forearms', 'shoulders'],           timer: { sec: 0 } }),
    ex({ id: 'repeaters',       name: 'Hangboard: repeaters, 20 mm open hand', sets: '3 × 6 reps', rest: '3 min', category: 'muscular_endurance', notes: '7 s hang / 3 s off = 1 rep; bodyweight. Pump target 7/10 by end of final set.',  muscles: ['fingers', 'forearms'],                        timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'shake_out',       name: 'Rest / shake-out',            sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Fully relax; breathe; do not rush to the board pumped.',                                muscles: ['forearms'],                                   timer: { sec: 0 } }),
    ex({ id: 'tb2_warmup',      name: 'TB2 warm-up sets',            sets: '2 problems',       rest: '—',       category: 'finger_prehab', notes: 'Grade 3 below limit; one send each.',                                                   muscles: ['fingers', 'forearms'],                        timer: { sec: 0 } }),
    ex({ id: 'tb2_limit',       name: 'Limit bouldering on TB2',     sets: '6–8 problems',     rest: '5 min',   category: 'max_strength',  notes: '90–95% of TB2 max. Up to 4 attempts per problem; isolate crux moves if needed.',        muscles: ['fingers', 'forearms', 'lats', 'core'],        timer: { sec: 300, mode: 'rest', label: 'Rest between attempts' } }),
    ex({ id: 'crux_isolation',  name: 'Crux move isolation',         sets: '2 moves × 10 reps', rest: '90 s',   category: 'power',         notes: 'Hardest move from your session; repeat 10× with 90 s rest. Quality only — stop if movement degrades.', muscles: ['fingers', 'forearms', 'lats'],   timer: { sec: 90, mode: 'rest', label: 'Rest between reps' } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Easy main wall; fully pump down.',                                                      muscles: ['forearms', 'hips', 'shoulders'],              timer: { sec: 0 } }),
  ];
  // Phase 4 — Performance (project attempts, maintenance hangboard)
  return [
    ex({ id: 'warmup',          name: 'Warm-up on main wall',        sets: '20 min',           rest: '—',       category: 'finger_prehab', notes: 'More thorough than any previous phase; pyramid from easy to 85%; do not rush.',         muscles: ['fingers', 'forearms', 'shoulders'],           timer: { sec: 0 } }),
    ex({ id: 'max_hangs',       name: 'Hangboard: 7-s max hangs, 20 mm — maintenance', sets: '3 sets', rest: '3 min', category: 'max_strength', notes: 'Same load as Phase 3 peak. Do not push for a new record the week before your project send.', muscles: ['fingers', 'forearms'],   timer: { sec: 7, mode: 'work', label: 'Hang' } }),
    ex({ id: 'shake_out',       name: 'Rest / shake-out',            sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Fully relax before going to the board.',                                                muscles: ['forearms'],                                   timer: { sec: 0 } }),
    ex({ id: 'tb2_warmup',      name: 'TB2 warm-up sets',            sets: '2 problems',       rest: '—',       category: 'finger_prehab', notes: 'Grade 3 below project; feel sharp and confident.',                                      muscles: ['fingers', 'forearms'],                        timer: { sec: 0 } }),
    ex({ id: 'project',         name: 'Project attempts on TB2',     sets: '5–8 attempts',     rest: '12–15 min', category: 'max_strength', notes: 'Full rest. Visualise before each burn. Commit fully. Log exactly where each attempt ends.', muscles: ['fingers', 'forearms', 'lats', 'core'],  timer: { sec: 780, mode: 'rest', label: 'Rest between attempts' } }),
    ex({ id: 'crux_isolation',  name: 'Crux isolation (if not sending)', sets: '15 min',       rest: '—',       category: 'power',         notes: 'Work only unsolved moves; max 3 attempts per move; do not thrash.',                     muscles: ['fingers', 'forearms', 'lats'],                timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Easy main wall; eat something; celebrate the attempt.',                                 muscles: ['forearms'],                                   timer: { sec: 0 } }),
  ];
};

// ----- Volume session (Wed in 3-climb, Thu in 2-climb) ----------------------
const volumeExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement on main wall; gradually increase pace.',                          muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'block_1',         name: 'Continuous climbing block 1', sets: '15 min',           rest: '—',       category: 'muscular_endurance', notes: 'Climb whatever is available at comfortable grade; if you have to wait, rest and jump on as soon as a problem frees up; pump target 4/10.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 0 } }),
    ex({ id: 'rest_1',          name: 'Rest',                        sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Forearm shake, water, light stretch.',                                          muscles: ['forearms'],                                    timer: { sec: 300, mode: 'rest', label: 'Rest' } }),
    ex({ id: 'block_2',         name: 'Continuous climbing block 2', sets: '15 min',           rest: '—',       category: 'muscular_endurance', notes: 'Same approach; vary angles and hold types where possible; do not fixate on grade.', muscles: ['fingers', 'forearms', 'lats', 'core'],  timer: { sec: 0 } }),
    ex({ id: 'rest_2',          name: 'Rest',                        sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'As above.',                                                                     muscles: ['forearms'],                                    timer: { sec: 300, mode: 'rest', label: 'Rest' } }),
    ex({ id: 'block_3',         name: 'Continuous climbing block 3', sets: '10 min',           rest: '—',       category: 'muscular_endurance', notes: 'Push slightly harder than blocks 1–2; still below 6/10 pump.',           muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Easy traversing or gentle laps; forearm stretch.',                              muscles: ['forearms', 'wrists'],                          timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement on main wall.',                                                   muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: '4x4_round_1',     name: '4×4 circuit attempt 1',       sets: '4 min on / 4 min off', rest: '4 min', category: 'muscular_endurance', notes: '4 distinct problems at comfortable flash grade. Climb all 4 back-to-back with no rest. Rest exactly 4 min.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 240, mode: 'rest', label: 'Rest between rounds' } }),
    ex({ id: '4x4_round_2',     name: '4×4 circuit attempt 2',       sets: '4 min on / 4 min off', rest: '4 min', category: 'muscular_endurance', notes: 'Same 4 problems or substitute if queue is long; maintain pace.',         muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between rounds' } }),
    ex({ id: '4x4_round_3',     name: '4×4 circuit attempt 3',       sets: '4 min on / 4 min off', rest: '4 min', category: 'muscular_endurance', notes: 'Same format; pump should be 6–7/10 at end of each set by now.',         muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between rounds' } }),
    ex({ id: '4x4_round_4',     name: '4×4 circuit attempt 4',       sets: '4 min on',         rest: '—',       category: 'muscular_endurance', notes: 'Final round; commit fully; this should feel hard.',                      muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Easy laps; thorough forearm stretching; do not skip this.',                     muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Moderate pace; raise heart rate to 65%.',                                       muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'linked_1',        name: 'Linked-problem circuit 1',    sets: '3 problems back-to-back', rest: '4 min', category: 'muscular_endurance', notes: '3 problems at comfortable flash grade. Climb all 3 without stepping off the floor between them. The point is sustained effort, not grade.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 240, mode: 'rest', label: 'Rest between circuits' } }),
    ex({ id: 'linked_2',        name: 'Linked-problem circuit 2',    sets: '3 problems back-to-back', rest: '4 min', category: 'muscular_endurance', notes: 'Same or different 3 problems; pump should be 7/10 by end of the 3rd.',     muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between circuits' } }),
    ex({ id: 'linked_3',        name: 'Linked-problem circuit 3',    sets: '3 problems back-to-back', rest: '4 min', category: 'muscular_endurance', notes: 'Repeat; if pump is not reaching 7/10, step up one grade.',                  muscles: ['fingers', 'forearms', 'lats', 'core'],         timer: { sec: 240, mode: 'rest', label: 'Rest between circuits' } }),
    ex({ id: 'linked_4',        name: 'Linked-problem circuit 4',    sets: '3 problems back-to-back', rest: '—', category: 'muscular_endurance', notes: 'Final round; this should feel very hard by the 3rd problem; commit to every move.', muscles: ['fingers', 'forearms', 'lats', 'core'],   timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Easy movement; forearm drainage; thorough stretching.',                         muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
  // Phase 4 — Performance Volume (comfort grade, confidence building)
  return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Moderate pace.',                                                                muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'free_climb',      name: 'Free climbing at comfort grade', sets: '45 min',        rest: '—',       category: 'technique',     notes: 'Problems 2–3 grades below your max; flash everything; stay fluid; do not grip hard or try to push grade — this session builds confidence, not fitness.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Easy traverse, forearm stretch.',                                               muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
};

// ----- Technique session (Fri in 3-climb weeks only) ------------------------
const techExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement on main wall.',                                                   muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'quiet_feet',      name: 'Quiet feet — 20 problems',    sets: '20 min',           rest: '—',       category: 'technique',     notes: 'Any easy grade on the main wall. Place every foot in complete silence — zero noise, zero slip, zero readjust. If your foot skids, step down and restart the move.', muscles: ['feet', 'core', 'glutes'], timer: { sec: 0 } }),
    ex({ id: 'straight_arm',    name: 'Straight-arm climbing',       sets: '15 min',           rest: '—',       category: 'technique',     notes: 'Pick problems where you can keep arms nearly straight throughout. Bend only to match a hold, then straighten. Trains hip drive over arm strength.', muscles: ['lats', 'core', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'one_move_focus',  name: 'One-move focus drill',        sets: '15 min',           rest: '—',       category: 'technique',     notes: 'Find 4–5 problems with one move you find awkward. Repeat just that move 10× each with 60 s rest. Isolate the move — do not boulder the full problem.', muscles: ['feet', 'core', 'glutes'], timer: { sec: 60, mode: 'rest', label: 'Rest between reps' } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Light movement, hip flexor and shoulder stretch.',                              muscles: ['hip flexors', 'shoulders'],                    timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement.',                                                                muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'momentum',        name: 'Momentum and hip pop drills', sets: '20 min',           rest: '—',       category: 'power',         notes: '6 problems where you can use hip rotation or body momentum to reach the next hold. 5× each focusing entirely on the body motion, not the arms.', muscles: ['core', 'glutes', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'drop_knee',       name: 'Drop-knee and back-step focus', sets: '15 min',         rest: '—',       category: 'technique',     notes: '4–5 problems on the main wall with big sidewall holds. Practice the drop-knee on each move that uses one: knee in, hip down, reach long. 5 reps per move.', muscles: ['hip flexors', 'glutes', 'core'], timer: { sec: 0 } }),
    ex({ id: 'flagging',        name: 'Flagging circuits',           sets: '15 min',           rest: '—',       category: 'technique',     notes: 'Every single move on 5 problems: consciously inside-flag or outside-flag to counterbalance. No splay; no barn door. Slow and deliberate.', muscles: ['core', 'glutes', 'hip flexors'], timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Light movement and stretch.',                                                   muscles: ['hips', 'shoulders'],                           timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Moderate movement.',                                                            muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'hooks',           name: 'Heel-hook and toe-hook focus', sets: '20 min',          rest: '—',       category: 'technique',     notes: '5 problems that use hooks (or can be improved by using them). For each: first attempt arm-only; second attempt with the hook. Feel the difference in hip position and core load.', muscles: ['glutes', 'core', 'hamstrings'], timer: { sec: 0 } }),
    ex({ id: 'compression',     name: 'Compression and body tension', sets: '15 min',          rest: '—',       category: 'body_tension',  notes: '4 wide or volume-heavy problems. Generate inward pressure with your body rather than pulling — arms push the wall apart while feet push together.', muscles: ['core', 'lats', 'pecs'], timer: { sec: 0 } }),
    ex({ id: 'onsight',         name: 'Onsight simulation',          sets: '15 min',           rest: '—',       category: 'technique',     notes: '5 problems you have never done. Read each for 60 s, then climb from memory with no beta. Evaluate your decisions after each attempt — not your success rate.', muscles: ['mind'], timer: { sec: 60, mode: 'work', label: 'Read' } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Light movement, hip and shoulder stretch.',                                     muscles: ['forearms', 'hips'],                            timer: { sec: 0 } }),
  ];
  // Phase 4 — Performance Technique (style refinement)
  return [
    ex({ id: 'warmup',          name: 'Warm-up',                     sets: '10 min',           rest: '—',       category: 'finger_prehab', notes: 'Easy movement.',                                                                muscles: ['fingers', 'shoulders'],                        timer: { sec: 0 } }),
    ex({ id: 'performance',     name: 'Performance problems',        sets: '30 min',           rest: '—',       category: 'technique',     notes: 'Problems at max-minus-1 grade on main wall; every move should look and feel clean; if the style breaks, step down and try again.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 0 } }),
    ex({ id: 'beta_variations', name: 'Beta variation drill',        sets: '15 min',           rest: '—',       category: 'technique',     notes: '3 problems, 3 different beta sequences for each. Expands your movement vocabulary; useful for adapting if your project beta fails mid-attempt.', muscles: ['mind'], timer: { sec: 0 } }),
    ex({ id: 'cooldown',        name: 'Cool-down',                   sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Stretch; reflect on the session.',                                              muscles: ['forearms'],                                    timer: { sec: 0 } }),
  ];
};

// ----- Home Gym A (Tuesday — both week types) -------------------------------
// Equipment: gymnastics rings, 20 kg kettlebell, light dumbbells, resistance
// band, yoga mat. No hangboard at home.
const homeAExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'joint_prep',      name: 'Joint prep: wrist, shoulder, hip circles', sets: '5 min', rest: '—',     category: 'finger_prehab', notes: 'Every session starts here; cover every joint; increase range gradually.',       muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'band_pull_aparts',name: 'Band pull-aparts',            sets: '3 × 20',           rest: '60 s',    category: 'finger_prehab', notes: 'Arms straight forward; pull to T shape; light band; slow and controlled; crucial for rotator cuff.', muscles: ['shoulders', 'rear delts'],     timer: { sec: 0 } }),
    ex({ id: 'ring_rows',       name: 'Ring rows',                   sets: '4 × 10',           rest: '90 s',    category: 'base_strength', notes: 'Feet on floor, body at ~45°; pull chest to rings; 3 s descent; adjust angle to make last 2 reps hard.', muscles: ['lats', 'rhomboids', 'biceps'], timer: { sec: 0 } }),
    ex({ id: 'ring_pushups',    name: 'Ring push-ups',               sets: '3 × 10',           rest: '60 s',    category: 'base_strength', notes: 'Rings at knee height; full range of motion; slow 3 s descent; builds antagonist strength to prevent imbalance.', muscles: ['chest', 'triceps', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'dead_bug',        name: 'Dead bug',                    sets: '3 × 10/side',      rest: '60 s',    category: 'body_tension',  notes: 'Lower back pressed to mat throughout; reach opposite arm and leg; exhale on extension.', muscles: ['core', 'abs'],                                 timer: { sec: 0 } }),
    ex({ id: 'hollow_body',     name: 'Hollow body hold',            sets: '3 × 20 s',         rest: '40 s',    category: 'body_tension',  notes: 'Arms overhead; lower back to mat; tuck knees if needed.',                       muscles: ['core', 'abs', 'hip flexors'],                  timer: { sec: 20, mode: 'work', label: 'Hold' } }),
    ex({ id: 'kb_goblet_squat', name: 'Kettlebell goblet squat',     sets: '3 × 10',           rest: '60 s',    category: 'base_strength', notes: '20 kg KB at chest; sit deep; heels down; pause 2 s at bottom; builds leg power for big foot moves.', muscles: ['quads', 'glutes', 'core'],     timer: { sec: 0 } }),
    ex({ id: 'mobility_flow',   name: 'Hip flexor + thoracic stretch', sets: '10 min',         rest: '—',       category: 'mobility',      notes: 'Lunge hip flexor (60 s/side), pigeon (60 s/side), thoracic rotation (10/side), wrist mobility (2 min).', muscles: ['hip flexors', 'thoracic spine', 'wrists'], timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'joint_prep',      name: 'Joint prep',                  sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Wrist, shoulder, hip circles; thoracic extension over mat.',                   muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'weighted_ring_pulls', name: 'Weighted ring pull-ups',  sets: '5 × 3',            rest: '3 min',   category: 'max_strength',  notes: 'Hold 20 kg KB between feet or ankles. Dead hang start, full lock-out at top. 3 s eccentric. Primary strength exercise — do not rush it.', muscles: ['lats', 'biceps', 'rear delts'], timer: { sec: 180, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'lock_offs',       name: 'Ring lock-off holds',         sets: '3 × 10 s/arm',     rest: '2 min',   category: 'max_strength',  notes: 'Pull to 90-degree elbow flexion and hold. Other arm assists on the ring. Time each hold.', muscles: ['biceps', 'lats', 'core'],        timer: { sec: 10, mode: 'work', label: 'Hold' } }),
    ex({ id: 'kb_single_row',   name: 'KB single-arm row',           sets: '3 × 8/arm',        rest: '60 s',    category: 'max_strength',  notes: '20 kg KB; brace on mat or bench; pull to hip; 3 s lower; builds unilateral pulling for one-arm lock-off progressions.', muscles: ['lats', 'rhomboids', 'biceps'], timer: { sec: 0 } }),
    ex({ id: 'ring_pushups',    name: 'Ring push-ups',               sets: '3 × 12',           rest: '60 s',    category: 'base_strength', notes: 'Rings at mid-shin; full range; slow descent; antagonist work.',                muscles: ['chest', 'triceps', 'shoulders'],               timer: { sec: 0 } }),
    ex({ id: 'knee_raises',     name: 'Hanging knee raises from rings', sets: '3 × 10',        rest: '60 s',    category: 'body_tension',  notes: 'Full dead hang; raise knees to chest; slow lower; no swing; builds core compression.', muscles: ['abs', 'hip flexors'],          timer: { sec: 0 } }),
    ex({ id: 'wrist_ext',       name: 'Wrist extensions with DB',    sets: '3 × 15',           rest: '60 s',    category: 'finger_prehab', notes: 'Forearm on mat; light DB; extend wrist against gravity; essential for pulley health; slow.', muscles: ['forearm extensors', 'wrists'], timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'joint_prep',      name: 'Joint prep',                  sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Full routine; thoracic extension on mat.',                                       muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'ring_pull_superset', name: 'Weighted ring pull-ups superset', sets: '4 rounds',  rest: '3 min',   category: 'muscular_endurance', notes: 'Round = 3 weighted reps (20 kg KB) immediately followed by bodyweight reps to failure. Last BW set should reach 5–8 reps; adjust if too easy or hard.', muscles: ['lats', 'biceps'], timer: { sec: 180, mode: 'rest', label: 'Rest between rounds' } }),
    ex({ id: 'lock_offs',       name: 'Ring lock-off holds — both arms', sets: '3 × 12 s/arm', rest: '90 s',    category: 'max_strength',  notes: 'Progress from Phase 2: hold for 12 s instead of 10; log time.',                  muscles: ['biceps', 'lats', 'core'],                      timer: { sec: 12, mode: 'work', label: 'Hold' } }),
    ex({ id: 'kb_swing',        name: 'KB swing',                    sets: '3 × 15',           rest: '60 s',    category: 'power',         notes: '20 kg; hip hinge drive; arms passive; builds explosive hip extension for big feet-on moves and dynamic reach.', muscles: ['glutes', 'hamstrings', 'core'], timer: { sec: 0 } }),
    ex({ id: 'ring_dips',       name: 'Ring dips',                   sets: '3 × 6',            rest: '60 s',    category: 'base_strength', notes: 'Control the descent (3 s); press up powerfully; adds antagonist pushing strength; reduce range if shoulder discomfort.', muscles: ['chest', 'triceps', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'l_sit',           name: 'L-sit from rings',            sets: '3 × max hold',     rest: '90 s',    category: 'body_tension',  notes: 'Depress shoulders, raise legs; bent knees acceptable; builds core compression for high feet.', muscles: ['core', 'abs', 'hip flexors', 'triceps'], timer: { sec: 0 } }),
    ex({ id: 'lateral_raises',  name: 'DB lateral raises',           sets: '2 × 15',           rest: '60 s',    category: 'finger_prehab', notes: 'Light DBs; to shoulder height only; slow; maintain shoulder health under increased load.', muscles: ['shoulders'],                  timer: { sec: 0 } }),
  ];
  // Phase 4 — Maintenance
  return [
    ex({ id: 'joint_prep',      name: 'Joint prep',                  sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Full routine.',                                                                  muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'weighted_ring_pulls', name: 'Weighted ring pull-ups',  sets: '3 × 3',            rest: '3 min',   category: 'max_strength',  notes: 'Same load as Phase 3 peak; no new PBs — maintenance only.',                      muscles: ['lats', 'biceps'],                              timer: { sec: 180, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'lock_offs',       name: 'Ring lock-off holds',         sets: '2 × 12 s/arm',     rest: '90 s',    category: 'max_strength',  notes: 'Maintenance volume.',                                                            muscles: ['biceps', 'lats', 'core'],                      timer: { sec: 12, mode: 'work', label: 'Hold' } }),
    ex({ id: 'ring_rows',       name: 'Ring rows',                   sets: '3 × 10',           rest: '60 s',    category: 'base_strength', notes: 'Bodyweight; maintain pulling strength.',                                         muscles: ['lats', 'rhomboids', 'biceps'],                 timer: { sec: 0 } }),
    ex({ id: 'ring_pushups',    name: 'Ring push-ups',               sets: '2 × 15',           rest: '60 s',    category: 'base_strength', notes: 'Antagonist; shoulder health.',                                                   muscles: ['chest', 'triceps', 'shoulders'],               timer: { sec: 0 } }),
    ex({ id: 'l_sit',           name: 'L-sit hold from rings',       sets: '2 × max',          rest: '90 s',    category: 'body_tension',  notes: 'Maintenance.',                                                                   muscles: ['core', 'abs', 'hip flexors'],                  timer: { sec: 0 } }),
    ex({ id: 'band_circuit',    name: 'Band pull-aparts + face pulls', sets: '2 × 20 + 15',    rest: '60 s',    category: 'finger_prehab', notes: 'Back-to-back; keep shoulder rotators healthy.',                                  muscles: ['rear delts', 'rhomboids'],                     timer: { sec: 0 } }),
    ex({ id: 'mobility_flow',   name: 'Full mobility flow',          sets: '15 min',           rest: '—',       category: 'mobility',      notes: 'Hip 90/90, pigeon, chest opener, wrist routine — longer than usual; recovery focus.', muscles: ['hips', 'shoulders', 'wrists'],        timer: { sec: 0 } }),
  ];
};

// ----- Home Gym B (Sat in 3-climb, Fri in 2-climb) --------------------------
const homeBExercises = (phase, deload = false) => {
  if (phase.id === 1) return [
    ex({ id: 'joint_prep',      name: 'Joint prep',                  sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'As Home A — wrist, shoulder, hip circles.',                                       muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'ring_dead_hangs', name: 'Ring dead hangs',             sets: '4 × 20 s',         rest: '60 s',    category: 'finger_prehab', notes: 'Hang from rings with shoulders relaxed (passive hang); build connective tissue in shoulder.', muscles: ['fingers', 'forearms', 'shoulders'], timer: { sec: 20, mode: 'work', label: 'Hang' } }),
    ex({ id: 'ytwl',            name: 'Dumbbell shoulder YTWL',      sets: '3 × 8 each',       rest: '60 s',    category: 'finger_prehab', notes: 'Prone on mat; very light DBs; Y, T, W, L positions; scapular retraction focus.',  muscles: ['shoulders', 'rear delts', 'rhomboids'],         timer: { sec: 0 } }),
    ex({ id: 'kb_rdl',          name: 'KB Romanian deadlift',        sets: '3 × 10',           rest: '60 s',    category: 'base_strength', notes: '20 kg KB; hinge at hips; soft knee; feel hamstring stretch at bottom; builds posterior chain for compression moves.', muscles: ['hamstrings', 'glutes', 'low back'], timer: { sec: 0 } }),
    ex({ id: 'side_plank',      name: 'Side plank',                  sets: '3 × 30 s/side',    rest: '60 s',    category: 'body_tension',  notes: 'Elbow under shoulder; straight body; raise top arm if easy; targets lateral core for flagging.', muscles: ['core', 'obliques'],             timer: { sec: 30, mode: 'work', label: 'Hold' } }),
    ex({ id: 'glute_bridges',   name: 'Glute bridges',               sets: '3 × 15',           rest: '60 s',    category: 'base_strength', notes: 'Drive through heels; hold 2 s at top; can add KB across hips for load.',          muscles: ['glutes', 'hamstrings'],                         timer: { sec: 0 } }),
    ex({ id: 'ext_rotation',    name: 'Band external rotation',      sets: '3 × 15/arm',       rest: '60 s',    category: 'finger_prehab', notes: 'Elbow at 90° at side; rotate outward against band; slow controlled; essential for shoulder longevity.', muscles: ['rotator cuff', 'shoulders'],  timer: { sec: 0 } }),
    ex({ id: 'mobility_flow',   name: 'Full mobility flow',          sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Hip 90/90 transitions (10/side), pigeon, child\'s pose with arm reach, doorframe chest opener (60 s).', muscles: ['hips', 'shoulders', 'lats'],   timer: { sec: 0 } }),
  ];
  if (phase.id === 2) return [
    ex({ id: 'joint_prep',      name: 'Joint prep',                  sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Full routine.',                                                                    muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'ring_rows_elev',  name: 'Ring rows — feet elevated',   sets: '4 × 10',           rest: '90 s',    category: 'base_strength', notes: 'Heels on mat edge or low surface; body more horizontal than Phase 1; slow 3 s descent; challenging load.', muscles: ['lats', 'rhomboids', 'biceps'], timer: { sec: 0 } }),
    ex({ id: 'one_arm_row_prog',name: 'One-arm ring row progression', sets: '3 × 6/arm',       rest: '2 min',   category: 'max_strength',  notes: 'Hold one ring with both hands; shift weight to one side until that arm does 70–80% of the work; builds toward one-arm pull-up strength.', muscles: ['lats', 'biceps', 'core'], timer: { sec: 0 } }),
    ex({ id: 'kb_sumo',         name: 'KB sumo deadlift',            sets: '3 × 10',           rest: '60 s',    category: 'base_strength', notes: 'Wide stance; 20 kg KB; drive hips through; trains leg drive for compression and mantling.', muscles: ['glutes', 'hamstrings', 'quads'], timer: { sec: 0 } }),
    ex({ id: 'side_ext_rot',    name: 'Side-lying DB external rotation', sets: '3 × 15/arm',   rest: '60 s',    category: 'finger_prehab', notes: 'Lie on side; DB in top hand; small arc outward; slow; do not rush this — it protects the shoulder.', muscles: ['rotator cuff', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'plank_tap',       name: 'Front plank with shoulder tap', sets: '3 × 10/side',    rest: '60 s',    category: 'body_tension',  notes: 'Push-up position; lift one hand, tap opposite shoulder; keep hips still; trains rotational core stability.', muscles: ['core', 'abs', 'shoulders'], timer: { sec: 0 } }),
    ex({ id: 'band_circuit',    name: 'Band pull-aparts superset with face pulls', sets: '3 × 20 + 15', rest: '60 s', category: 'finger_prehab', notes: 'Back-to-back with no rest; light band; maintain shoulder health under increased load.', muscles: ['rear delts', 'rhomboids'], timer: { sec: 0 } }),
    ex({ id: 'mobility_flow',   name: 'Mobility: hip + shoulder',    sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Pigeon (60 s/side), hip 90/90, doorframe chest stretch (60 s), lat stretch in doorframe (60 s/side).', muscles: ['hips', 'shoulders', 'lats'], timer: { sec: 0 } }),
  ];
  if (phase.id === 3) return [
    ex({ id: 'joint_prep',      name: 'Joint prep',                  sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Full routine.',                                                                    muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'explosive_pulls', name: 'Explosive ring pull-up',      sets: '5 × 3',            rest: '3 min',   category: 'power',         notes: 'Pull as fast as possible from dead hang; controlled descent; trains contact strength and rate of force development.', muscles: ['lats', 'biceps'], timer: { sec: 180, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'one_arm_row_heavy', name: 'One-arm ring row — heavy',  sets: '4 × 6/arm',        rest: '2 min',   category: 'max_strength',  notes: 'Shift body further toward horizontal than Phase 2; increase loading on working arm.', muscles: ['lats', 'biceps', 'core'],     timer: { sec: 0 } }),
    ex({ id: 'kb_squat_pause',  name: 'KB goblet squat — pause',     sets: '3 × 8',            rest: '60 s',    category: 'base_strength', notes: '20 kg; 3 s pause at bottom; builds leg strength for explosive foot smears and mantles.', muscles: ['quads', 'glutes', 'core'],   timer: { sec: 0 } }),
    ex({ id: 'front_lever_tuck',name: 'Front lever tuck hold on rings', sets: '3 × max',       rest: '90 s',    category: 'body_tension',  notes: 'Arms straight; tuck knees; hold until you cannot maintain horizontal; progress to extending one leg if possible.', muscles: ['lats', 'core', 'abs'], timer: { sec: 0 } }),
    ex({ id: 'hollow_rock',     name: 'Hollow body rock',            sets: '3 × 10',           rest: '60 s',    category: 'body_tension',  notes: 'From hollow body hold, rock forward and back smoothly; maintain the position throughout; do not break the shape.', muscles: ['core', 'abs', 'hip flexors'], timer: { sec: 0 } }),
    ex({ id: 'band_circuit',    name: 'Band pull-apart + face pull circuit', sets: '3 × 20 + 15', rest: '60 s', category: 'finger_prehab', notes: 'Back-to-back; light band; shoulder health maintenance.',                          muscles: ['rear delts', 'rhomboids'],                      timer: { sec: 0 } }),
    ex({ id: 'mobility_flow',   name: 'Mobility',                    sets: '8 min',            rest: '—',       category: 'mobility',      notes: 'Hip 90/90, pigeon, wrist flexor and extensor stretch.',                            muscles: ['hips', 'wrists'],                               timer: { sec: 0 } }),
  ];
  // Phase 4 — Maintenance + Specificity
  return [
    ex({ id: 'joint_prep',      name: 'Joint prep',                  sets: '5 min',            rest: '—',       category: 'finger_prehab', notes: 'Full routine.',                                                                    muscles: ['wrists', 'shoulders', 'hips'],                  timer: { sec: 0 } }),
    ex({ id: 'explosive_pulls', name: 'Explosive ring pull-ups',     sets: '3 × 3',            rest: '3 min',   category: 'power',         notes: 'Maintenance; same intent as Phase 3.',                                              muscles: ['lats', 'biceps'],                               timer: { sec: 180, mode: 'rest', label: 'Rest between sets' } }),
    ex({ id: 'one_arm_row',     name: 'One-arm ring row',            sets: '3 × 5/arm',        rest: '90 s',    category: 'max_strength',  notes: 'Maintenance load; controlled.',                                                     muscles: ['lats', 'biceps', 'core'],                       timer: { sec: 0 } }),
    ex({ id: 'kb_goblet_squat', name: 'KB goblet squat',             sets: '2 × 8',            rest: '60 s',    category: 'base_strength', notes: 'Maintenance.',                                                                      muscles: ['quads', 'glutes'],                              timer: { sec: 0 } }),
    ex({ id: 'front_lever_tuck',name: 'Front lever tuck',            sets: '2 × max',          rest: '60 s',    category: 'body_tension',  notes: 'Maintenance.',                                                                      muscles: ['lats', 'core'],                                 timer: { sec: 0 } }),
    ex({ id: 'specificity',     name: 'Specificity: mimic project moves on rings', sets: '15 min', rest: '—',   category: 'technique',     notes: 'Use the rings to simulate the pulling and lock-off positions from your TB2 project. Practise the catch position, the match, the high lock-off.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 0 } }),
    ex({ id: 'mobility_flow',   name: 'Mobility',                    sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Full routine; prioritise sleep and recovery this week.',                            muscles: ['hips', 'shoulders', 'wrists'],                  timer: { sec: 0 } }),
  ];
};

// ----- Light Home (deload weeks 9 & 16, Tuesday) ----------------------------
// 30 min total per PDF. Band pull-aparts, ring rows, core, and mobility only;
// no weighted pulling.
const lightHomeExercises = () => [
  ex({ id: 'band_pull_aparts',  name: 'Band pull-aparts',            sets: '2 × 20',           rest: '60 s',    category: 'finger_prehab', notes: 'Light band; shoulder maintenance only.',                                        muscles: ['shoulders', 'rear delts'],                     timer: { sec: 0 } }),
  ex({ id: 'ring_rows',         name: 'Ring rows',                   sets: '2 × 10',           rest: '60 s',    category: 'base_strength', notes: 'Bodyweight only; easy pace; do not push.',                                      muscles: ['lats', 'rhomboids', 'biceps'],                 timer: { sec: 0 } }),
  ex({ id: 'light_core',        name: 'Light core',                  sets: '5 min',            rest: '—',       category: 'body_tension',  notes: 'Easy dead bugs and bird dogs; nothing fatiguing.',                              muscles: ['core', 'abs'],                                 timer: { sec: 0 } }),
  ex({ id: 'mobility',          name: 'Mobility',                    sets: '10 min',           rest: '—',       category: 'mobility',      notes: 'Hips, shoulders, wrists, thoracic spine.',                                       muscles: ['hips', 'shoulders', 'wrists'],                 timer: { sec: 0 } }),
];

// ----- Testing exercises (Week 17) ------------------------------------------
// Each test session in week 17 lists which assessments to run that day. The
// detailed protocol lives in ASSESSMENTS below and is captured in the
// dedicated Assessments view.
const testingExercises = (testDay) => {
  if (testDay === 'wed') return [
    ex({ id: 'test_1', name: 'Test 1 — Max-Weight Pull-Up',           sets: '—', rest: '8 min',  category: 'max_strength', notes: 'Full protocol in Assessments tab. Log result there.',  muscles: ['lats', 'biceps'],     timer: { sec: 0 } }),
    ex({ id: 'test_2', name: 'Test 2 — Max-Rep Bodyweight Pull-Ups',  sets: '—', rest: '8 min',  category: 'max_strength', notes: 'Full protocol in Assessments tab.',                    muscles: ['lats', 'biceps'],     timer: { sec: 0 } }),
    ex({ id: 'test_3', name: 'Test 3 — Ring Lock-Off (dominant arm)', sets: '—', rest: '5 min',  category: 'max_strength', notes: 'Best of 2 attempts.',                                  muscles: ['biceps', 'lats'],     timer: { sec: 0 } }),
  ];
  if (testDay === 'thu') return [
    ex({ id: 'test_4', name: 'Test 4 — L-Sit Hold from Rings',        sets: '—', rest: '15 min', category: 'body_tension', notes: 'Note bent-knee vs straight-leg.',                      muscles: ['core', 'abs'],        timer: { sec: 0 } }),
    ex({ id: 'test_5', name: 'Test 5 — Max-Rep Ring Rows (feet elevated)', sets: '—', rest: '—', category: 'max_strength', notes: 'Rings at hip height; body nearly horizontal.',          muscles: ['lats', 'rhomboids'],  timer: { sec: 0 } }),
  ];
  if (testDay === 'fri') return [
    ex({ id: 'test_6', name: 'Test 6 — TB2 Bouldering Pyramid',       sets: '—', rest: '—',      category: 'technique',    notes: 'Dedicated fresh session. Record max flash and redpoint.', muscles: ['fingers', 'forearms', 'lats', 'core'], timer: { sec: 0 } }),
  ];
  if (testDay === 'sat') return [
    ex({ id: 'test_7',  name: 'Test 7 — 4×4 Anaerobic Capacity',      sets: '—', rest: '—',      category: 'muscular_endurance', notes: '4 problems at flash grade; 4 rounds; record HR after round 4.', muscles: ['fingers', 'forearms', 'lats'], timer: { sec: 0 } }),
    ex({ id: 'test_8',  name: 'Test 8 — Frog Position Hip Mobility',  sets: '—', rest: '—',      category: 'mobility',     notes: 'Angle between thigh and torso at max comfortable range.',  muscles: ['hips', 'adductors'],   timer: { sec: 0 } }),
    ex({ id: 'test_9',  name: 'Test 9 — KB Goblet Squat Depth',       sets: '—', rest: '—',      category: 'mobility',     notes: '20 kg KB at chest; heels down; thighs below parallel; held 5 s.', muscles: ['quads', 'glutes', 'ankles'], timer: { sec: 0 } }),
    ex({ id: 'test_10', name: 'Test 10 — ARC Aerobic Base',           sets: '—', rest: '—',      category: 'muscular_endurance', notes: 'Maintain pump 3/10 for 20 min continuous easy climbing.', muscles: ['forearms', 'lats'], timer: { sec: 0 } }),
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
  1: { full: 'Prehab, Pulling Base & Core',          short: 'Prehab' },
  2: { full: 'Weighted Pulling & Finger Load',       short: 'Pulling' },
  3: { full: 'Strength Endurance & Ring Progressions', short: 'SE / Rings' },
  4: { full: 'Maintenance',                          short: 'Maintenance' },
};
const HOME_B_NAMES = {
  1: { full: 'Core, Shoulders & Mobility',           short: 'Core & Mobility' },
  2: { full: 'Accessory Strength & Shoulder Health', short: 'Accessory' },
  3: { full: 'Contact Strength & Core',              short: 'Contact' },
  4: { full: 'Maintenance + Specificity',            short: 'Specificity' },
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
// Weeks 9 & 16 (deload) and week 17 (testing) use fixed patterns regardless
// of cadence.
// ----------------------------------------------------------------------------
export function getDefaultPattern(weekNumber, cadence = '3day') {
  if (weekNumber === 9 || weekNumber === 16) {
    // Deload — 2 easy volume sessions (Mon + Fri) + 1 light home (Tue). All
    // other days complete rest.
    return ['volume', 'lightHome', 'rest', 'rest', 'volume', 'rest', 'rest'];
  }
  if (weekNumber === 17) {
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

// Week 17 maps Wed/Thu/Fri/Sat day indices to specific test days.
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
  if (diff >= TOTAL_WEEKS * 7) return { weekNumber: TOTAL_WEEKS, dayIndex: 6, afterPlan: true };
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
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
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
// Standardised assessments — Week 1 baseline + Week 17 re-test.
// ----------------------------------------------------------------------------
export const ASSESSMENTS = [
  {
    id: 'max_weight_pullup',
    number: 1,
    name: 'Max-Weight Pull-Up',
    equipment: 'Pull-up bar or rings, kettlebell, scales',
    protocol: 'From dead hang, add weight (KB between feet) until you can only complete 1 clean rep. Record total load (bodyweight + added weight). Two attempts; 8 min rest between.',
    scoring: 'Total load (BW + added weight, kg) for 1RM pull-up.',
    why: 'The most direct measure of upper-body pulling strength available without a hangboard.',
    unit: 'kg',
    day: 'wed',
  },
  {
    id: 'max_rep_pullups',
    number: 2,
    name: 'Max-Rep Bodyweight Pull-Ups',
    equipment: 'Pull-up bar or rings',
    protocol: 'Dead hang start; pull chin over bar; no kipping. Count to failure. Rest 8 min.',
    scoring: 'Total reps in one unbroken set.',
    why: 'Pulling strength-endurance and baseline volume capacity.',
    unit: 'reps',
    day: 'wed',
  },
  {
    id: 'ring_lock_off',
    number: 3,
    name: 'Ring Lock-Off Hold (Dominant Arm)',
    equipment: 'Gymnastics rings',
    protocol: 'Pull to 90-degree elbow flexion; hold as long as possible. Other arm may hold ring lightly for balance. Time stops when elbow breaks 90°. Best of 2; 5 min rest.',
    scoring: 'Duration held in seconds.',
    why: 'Lock-off strength for clipping, reaching on steep terrain.',
    unit: 's',
    day: 'wed',
  },
  {
    id: 'l_sit_rings',
    number: 4,
    name: 'L-Sit Hold from Rings',
    equipment: 'Gymnastics rings',
    protocol: 'Depress shoulders; raise both legs to horizontal; hold to failure. Bent-knee version acceptable — note which you used.',
    scoring: 'Duration in seconds (note BK vs. straight-leg).',
    why: 'Core compression for high feet, heel hooks, steep climbing.',
    unit: 's',
    day: 'thu',
  },
  {
    id: 'ring_rows',
    number: 5,
    name: 'Max-Rep Ring Rows (Feet Elevated)',
    equipment: 'Gymnastics rings',
    protocol: 'Set rings at hip height; feet on a raised surface so body is nearly horizontal; pull chest to rings; full range; count reps to failure.',
    scoring: 'Total reps to failure.',
    why: 'Horizontal pulling strength and scapular retraction endurance.',
    unit: 'reps',
    day: 'thu',
  },
  {
    id: 'pyramid',
    number: 6,
    name: 'Bouldering Pyramid on TB2',
    equipment: 'Tension Board 2',
    protocol: 'Fresh session: warm up, then climb a full pyramid starting 4 grades below max. Record (a) max flash grade and (b) max redpoint grade within 5 attempts per problem.',
    scoring: 'Max flash / max redpoint grade on TB2.',
    why: 'Direct measure of climbing performance on your primary training tool.',
    unit: 'grade',
    day: 'fri',
  },
  {
    id: '4x4_test',
    number: 7,
    name: '4×4 Anaerobic Capacity Test',
    equipment: 'Main wall, stopwatch',
    protocol: 'Choose 4 problems at a grade you can reliably flash. Climb all 4 back-to-back with no rest. Rest exactly 4 min. Repeat 4 rounds. Record how many rounds completed and your HR immediately after round 4.',
    scoring: 'Rounds completed (of 4) + post-round-4 HR (bpm).',
    why: 'Anaerobic capacity and lactate buffering — power endurance.',
    unit: 'rounds + bpm',
    day: 'sat',
  },
  {
    id: 'frog_mobility',
    number: 8,
    name: 'Frog Position Hip Mobility',
    equipment: 'Yoga mat',
    protocol: 'Face down; bring knees out to 90° (frog position); lower hips toward floor. Record the angle between thigh and torso at your maximum comfortable range. Note any asymmetry.',
    scoring: 'Angle in degrees (both sides).',
    why: 'Hip mobility governs foot height, flagging range, and tension on steep walls.',
    unit: 'degrees',
    day: 'sat',
  },
  {
    id: 'goblet_squat',
    number: 9,
    name: 'KB Goblet Squat Depth',
    equipment: '20 kg kettlebell, mat',
    protocol: 'Holding 20 kg KB at chest; squat as deep as possible with heels down; hold the bottom position for 5 s. Measure depth by taking a photo from the side. Note whether heels stay down.',
    scoring: 'Pass/Fail: heels down + thighs below parallel, held for 5 s.',
    why: 'Lower-body mobility and strength for high steps, deep rock-overs.',
    unit: 'pass/fail',
    day: 'sat',
  },
  {
    id: 'arc_test',
    number: 10,
    name: 'ARC Aerobic Base Test',
    equipment: 'Main wall or traversing wall',
    protocol: '20 continuous minutes of easy climbing at pump 3/10. If you have to queue during this test, rest and continue — note total climbing time. Record whether you maintained pump at or below 5/10 for the full duration.',
    scoring: 'Pass/Fail: pump held at 5/10 or below for 20 min of climbing.',
    why: 'Aerobic base allows forearm recovery on rests — critical for routes.',
    unit: 'pass/fail + peak pump',
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
