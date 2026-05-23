// Six logo concepts for "Send" — climbing training app.
// Each renders a 1024x1024 iOS-style squircle icon.
// iOS squircle radius is 22.37% — 1024 * 0.2237 ≈ 229.

const ICON_RADIUS = 229;

// ============================================================================
// 01 — RIDGE
// Refined evolution of the existing icon: a clean route zigzag rising to a
// summit dot. Warm paper background, charcoal route, coral summit. Reads as a
// climbing line, a mountain ridge, AND the letter M for "mountain".
// ============================================================================
function RidgeLogo({ size = 1024 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#F4ECDD" />
      <path
        d="M 200 760 L 360 360 L 480 560 L 620 280 L 824 760"
        fill="none"
        stroke="#1C1A17"
        strokeWidth="64"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="620" cy="280" r="56" fill="#E94B2C" />
    </svg>
  );
}

// ============================================================================
// 02 — APEX
// Single bold triangle peak rising from a clean horizon. The most reductive
// take: pure geometry, pure intent. Dawn-pink to coral gradient evokes alpine
// first light. Reads instantly at any size.
// ============================================================================
function ApexLogo({ size = 1024 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="apex-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD0B5" />
          <stop offset="1" stopColor="#E94B2C" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="url(#apex-bg)" />
      {/* horizon */}
      <rect x="120" y="744" width="784" height="14" rx="7" fill="#FFFFFF" opacity="0.85" />
      {/* peak */}
      <path
        d="M 512 220 L 824 744 L 200 744 Z"
        fill="#FFFFFF"
      />
      {/* inner shadow line for facet */}
      <path
        d="M 512 220 L 512 744"
        stroke="#E94B2C"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

// ============================================================================
// 03 — SEND
// Pure typographic: the letter S rendered as a bold geometric chevron that
// folds like a climbing route. Designed custom — two stacked chevrons fused
// into a single continuous form. Black background, cream mark.
// ============================================================================
function SendLogo({ size = 1024 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#0A0A0A" />
      <path
        d="M 240 280 L 392 280 L 512 432 L 632 280 L 784 280 L 588 528 L 784 776 L 632 776 L 512 624 L 392 776 L 240 776 L 436 528 Z"
        fill="#F4ECDD"
      />
    </svg>
  );
}

// ============================================================================
// 04 — TOPO
// Concentric topographic peaks — four stacked chevron contours, like the
// summit of a topo map. Misty sage background, deep forest lines. Quiet,
// confident, map-adjacent.
// ============================================================================
function TopoLogo({ size = 1024 }) {
  const lines = [
    { y: 700, w: 760 },
    { y: 580, w: 600 },
    { y: 460, w: 440 },
    { y: 340, w: 280 },
  ];
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#D9E3D4" />
      {lines.map((l, i) => {
        const halfW = l.w / 2;
        const apexY = l.y - halfW * 0.85;
        return (
          <path
            key={i}
            d={`M ${512 - halfW} ${l.y} L 512 ${apexY} L ${512 + halfW} ${l.y}`}
            fill="none"
            stroke="#2E4A35"
            strokeWidth="44"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

// ============================================================================
// 05 — HOLD
// Original: abstract climbing hold — an organic asymmetric pebble shape with
// a single inner curve indicating the grip undercut. Terracotta clay
// background, cream hold. Tactile, distinctive, doesn't shout "mountain".
// ============================================================================
function HoldLogo({ size = 1024 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#C2553A" />
      <path
        d="M 280 380
           C 280 240, 440 200, 560 220
           C 720 246, 820 360, 800 520
           C 786 640, 700 760, 540 790
           C 380 814, 240 720, 220 580
           C 208 500, 220 440, 280 380 Z"
        fill="#F4ECDD"
      />
      <path
        d="M 340 520
           C 420 600, 600 620, 720 540"
        fill="none"
        stroke="#C2553A"
        strokeWidth="36"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// 05B — HOLD · Lean
// The same pebble, sheared along a diagonal so the upper portion leans
// upper-right and the lower portion leans lower-left. Reads as an organic
// hold first, with a subtle S-lean only as a second read.
// (k=80 linear y-shear applied to every control point.)
// ============================================================================
function HoldLeanLogo({ size = 1024 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#C2553A" />
      <path
        d="M 300 380
           C 323 240, 489 200, 606 220
           C 762 246, 844 360, 799 520
           C 766 640, 661 760, 497 790
           C 333 814, 208 720, 209 580
           C 210 500, 232 440, 300 380 Z"
        fill="#F4ECDD"
      />
      <path
        d="M 339 520
           C 406 600, 583 620, 716 540"
        fill="none"
        stroke="#C2553A"
        strokeWidth="36"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// 05C — HOLD · Twist
// Same diagonal shear, more pronounced. The S-lean is the first read but the
// shape still feels like a single tactile pebble, not a letterform.
// (k=140 linear y-shear.)
// ============================================================================
function HoldTwistLogo({ size = 1024 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#C2553A" />
      <path
        d="M 316 380
           C 354 240, 525 200, 640 220
           C 793 246, 862 360, 798 520
           C 751 640, 632 760, 464 790
           C 297 814, 183 720, 201 580
           C 211 500, 240 440, 316 380 Z"
        fill="#F4ECDD"
      />
      <path
        d="M 338 520
           C 396 600, 571 620, 712 540"
        fill="none"
        stroke="#C2553A"
        strokeWidth="36"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// 05D — HOLD · Sway
// Instead of shearing, amplify the pebble's natural asymmetry: push the
// existing upper-right bulge further up-right, push the lower-left bulge
// further down-left, and slightly tuck the opposite quadrants. Reads as an
// organic pebble with a clearer S-lean than the linear shears.
// ============================================================================
function HoldSwayLogo({ size = 1024 }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#C2553A" />
      <path
        d="M 290 380
           C 290 220, 460 180, 600 200
           C 760 220, 870 320, 820 460
           C 790 580, 690 740, 530 800
           C 380 820, 220 760, 180 600
           C 170 510, 210 440, 290 380 Z"
        fill="#F4ECDD"
      />
      <path
        d="M 330 540
           C 410 620, 590 640, 720 560"
        fill="none"
        stroke="#C2553A"
        strokeWidth="36"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// 06 — BETA
// Route diagram: small filled circles trace a climbing route up the icon,
// connected by thin dashed lines like a guidebook topo. Bright white
// background, single dark hue. The most "training app" of the bunch — reads
// as a plotted route, a sequence, a plan.
// ============================================================================
function BetaLogo({ size = 1024 }) {
  // Points trace a climbing line bottom to top
  const points = [
    { x: 320, y: 800 },
    { x: 440, y: 660 },
    { x: 360, y: 520 },
    { x: 560, y: 420 },
    { x: 460, y: 280 },
    { x: 640, y: 200 },
  ];
  // Make a single-line path through them
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx={ICON_RADIUS} fill="#FFFFFF" />
      <rect x="0" y="0" width="1024" height="1024" rx={ICON_RADIUS} fill="none" stroke="#EAE6DD" strokeWidth="8" />
      {/* dashed route line */}
      <path
        d={linePath}
        fill="none"
        stroke="#1C1A17"
        strokeWidth="22"
        strokeDasharray="2 46"
        strokeLinecap="round"
      />
      {/* holds */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 56 : 36}
          fill={i === points.length - 1 ? '#E94B2C' : '#1C1A17'}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// Logo registry
// ============================================================================
const LOGOS = [
  {
    id: 'ridge',
    name: 'Ridge',
    Component: RidgeLogo,
    description:
      'A refined evolution of your current icon. The route line reads as a mountain ridge AND a stylized M — with a single coral summit dot marking the send.',
    palette: ['#F4ECDD', '#1C1A17', '#E94B2C'],
  },
  {
    id: 'apex',
    name: 'Apex',
    Component: ApexLogo,
    description:
      'The most reductive direction — a single bold peak rising from a clean horizon, set against an alpine-dawn gradient. Distilled to pure geometry.',
    palette: ['#FFD0B5', '#E94B2C', '#FFFFFF'],
  },
  {
    id: 'send',
    name: 'Send',
    Component: SendLogo,
    description:
      'Purely typographic. A custom S built from two fused chevrons — the letterform folds like a climbing route. Bold, confident, unmistakable on a packed home screen.',
    palette: ['#0A0A0A', '#F4ECDD'],
  },
  {
    id: 'topo',
    name: 'Topo',
    Component: TopoLogo,
    description:
      'Concentric chevron contours, like the summit of a topographic map. Quiet, map-adjacent, the most subdued and "Apple-native" feeling option.',
    palette: ['#D9E3D4', '#2E4A35'],
  },
  {
    id: 'hold',
    name: 'Hold · Original',
    Component: HoldLogo,
    description:
      "The original abstract climbing hold — an organic asymmetric pebble with an undercut grip line. No S-lean, kept here as the baseline reference.",
    palette: ['#C2553A', '#F4ECDD'],
  },
  {
    id: 'hold-lean',
    name: 'Hold · Lean',
    Component: HoldLeanLogo,
    description:
      "The same pebble, gently sheared along a diagonal — the upper portion leans upper-right, the lower portion leans lower-left. Reads as a hold first, with an S-lean as a quiet second read.",
    palette: ['#C2553A', '#F4ECDD'],
  },
  {
    id: 'hold-twist',
    name: 'Hold · Twist',
    Component: HoldTwistLogo,
    description:
      "Same diagonal shear, more pronounced. The S quality is clearer now but the shape still feels like a single tactile pebble, not a letterform.",
    palette: ['#C2553A', '#F4ECDD'],
  },
  {
    id: 'hold-sway',
    name: 'Hold · Sway',
    Component: HoldSwayLogo,
    description:
      "Amplifies the pebble's natural diagonal asymmetry — upper-right bulge pushed further up-right, lower-left bulge pushed further down-left. Clearer S-lean while staying organic.",
    palette: ['#C2553A', '#F4ECDD'],
  },
  {
    id: 'beta',
    name: 'Beta',
    Component: BetaLogo,
    description:
      'A plotted route — holds connected by a dashed line, summit marked in coral. The most "training app" of the bunch: reads as a sequence, a plan, a path.',
    palette: ['#FFFFFF', '#1C1A17', '#E94B2C'],
  },
];

Object.assign(window, {
  RidgeLogo, ApexLogo, SendLogo, TopoLogo,
  HoldLogo, HoldLeanLogo, HoldTwistLogo, HoldSwayLogo,
  BetaLogo,
  LOGOS,
});
