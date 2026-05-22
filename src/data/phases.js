// ============================================================================
// Training phases + skill categories
// ============================================================================

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
