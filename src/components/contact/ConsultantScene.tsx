import { rng } from "@/lib/art/util";

/**
 * Contact visual — a fictional planning consultant at a studio plan table. Purely editorial: no name, role or claim.
 * Five poses and five plan states are always in the markup; CSS shows them from `data-step` on `.ci-layout`
 * (set by scroll). Decorative only (aria-hidden). Generic place: no landmark, dataset or outcome.
 */
const W = 600, H = 720;
const SK = "#c99a77", SK2 = "#b8886a", BLZ = "#312d29", BLZ2 = "#1f1c19", IV = "#f1ece0", HAIR = "#191614", BUR = "#6b1f32", GOLD = "#b99352";

const r = rng(23);
const blocks: [number, number, number, number][] = [];
for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) {
  if (j === 2 && i > 2 && i < 6) continue;
  blocks.push([28 + i * 54, 22 + j * 52 + (j > 1 ? 28 : 0), 38 + Math.round(r() * 6), 32 + Math.round(r() * 8)]);
}

/** per-pose: body offset, head transform, arms and hands. Coordinates are the viewBox. */
type Pose = { body: string; head: string; arms: string[]; hands: [number, number][]; pen?: [number, number, number, number] };
const POSES: Pose[] = [
  { body: "translate(0 0)", head: "rotate(5 300 215)", arms: ["M222 266 Q194 396 240 534", "M378 266 Q406 396 360 534"], hands: [[240, 538], [360, 538]] },
  { body: "translate(0 0)", head: "rotate(-4 300 215)", arms: ["M222 266 Q194 396 240 534", "M378 266 Q448 340 458 506"], hands: [[240, 538], [462, 520]], pen: [462, 520, 486, 540] },
  { body: "translate(0 0)", head: "rotate(3 300 215)", arms: ["M222 266 Q194 396 240 534", "M378 266 Q426 420 336 582"], hands: [[240, 538], [336, 586]], pen: [336, 586, 316, 602] },
  { body: "translate(6 16)", head: "rotate(13 300 215)", arms: ["M228 282 Q212 410 268 556", "M386 282 Q436 430 394 596"], hands: [[268, 560], [394, 600]], pen: [394, 600, 376, 612] },
  { body: "translate(0 0)", head: "rotate(0 300 215)", arms: ["M222 266 Q198 404 282 536", "M378 266 Q402 404 320 536"], hands: [[283, 540], [319, 540]] },
];

function Box({ x, y, w, h, d, tone = "#f4efe2" }: { x: number; y: number; w: number; h: number; d: number; tone?: string }) {
  const k = d * 0.5;
  return (
    <g>
      <path d={`M${x} ${y}h${w}l${k} ${-k}h${-w}z`} fill={tone} stroke="#6f6652" strokeWidth=".8" />
      <path d={`M${x} ${y}v${h}h${w}v${-h}z`} fill="#e3d9c0" stroke="#6f6652" strokeWidth=".8" />
      <path d={`M${x + w} ${y}l${k} ${-k}v${h}l${-k} ${k}z`} fill="#cbbf9f" stroke="#6f6652" strokeWidth=".8" />
    </g>
  );
}

function Figure({ i }: { i: number }) {
  const p = POSES[i];
  return (
    <g transform={p.body}>
      <path d="M212 270 Q300 222 388 270 L414 520 L186 520 Z" fill={BLZ} />
      <path d="M262 244 L300 316 L338 244 Q300 262 262 244Z" fill={IV} />
      <path d="M262 244 L292 330 L300 316 M338 244 L308 330 L300 316" fill="none" stroke={BLZ2} strokeWidth="2" />
      <circle cx="334" cy="300" r="3.2" fill={GOLD} />
      <rect x="285" y="198" width="30" height="52" rx="10" fill={SK2} />
      <g transform={p.head}>
        <path d="M262 168 Q250 96 300 92 Q352 96 338 168 Q336 120 300 118 Q266 120 262 168Z" fill={HAIR} />
        <circle cx="300" cy="96" r="19" fill={HAIR} />
        <ellipse cx="300" cy="172" rx="36" ry="46" fill={SK} />
        <path d="M264 164 Q272 118 300 118 Q330 118 336 164 Q320 134 300 136 Q276 136 264 164Z" fill={HAIR} />
        <path d="M279 168 q7 -4 14 0 M307 168 q7 -4 14 0" fill="none" stroke="#3a2a22" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M279 176 q7 3 14 0 M307 176 q7 3 14 0" fill="none" stroke="#4a3328" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
        <path d="M300 178 q-3 12 2 16" fill="none" stroke={SK2} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M290 202 q10 6 20 0" fill="none" stroke="#8a3a45" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="264" cy="184" r="2.6" fill={GOLD} />
        <circle cx="336" cy="184" r="2.6" fill={GOLD} />
      </g>
    </g>
  );
}

function Arms({ i }: { i: number }) {
  const p = POSES[i];
  return (
    <g>
      {p.arms.map((d, k) => <path key={k} d={d} fill="none" stroke={BLZ} strokeWidth="32" strokeLinecap="round" />)}
      {p.pen && <path d={`M${p.pen[0]} ${p.pen[1]}L${p.pen[2]} ${p.pen[3]}`} stroke={BUR} strokeWidth="3.2" strokeLinecap="round" />}
      {p.hands.map(([x, y], k) => <ellipse key={k} cx={x} cy={y} rx="12" ry="8.5" fill={SK} stroke={SK2} strokeWidth=".8" />)}
    </g>
  );
}

export function ConsultantScene() {
  return (
    <svg className="cs-scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfe5e2" /><stop offset="1" stopColor="#eceee6" /></linearGradient>
        <linearGradient id="cs-light" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f6f1e4" stopOpacity="0" /><stop offset="1" stopColor="#f6f1e4" stopOpacity=".55" /></linearGradient>
      </defs>

      {/* studio wall */}
      <rect width={W} height={H} fill="#ece4d2" />
      <rect y="0" width={W} height="486" fill="#efe8d8" />
      <g>
        <rect x="52" y="86" width="166" height="118" fill="#f7f2e6" stroke="#6f6652" strokeWidth="1.2" />
        <g stroke="rgba(111,102,82,.28)" strokeWidth=".6" fill="none">{Array.from({ length: 8 }, (_, k) => <path key={k} d={`M${52 + k * 21} 86v118M52 ${86 + k * 15}h166`} />)}</g>
        <path d="M60 190C100 150 140 170 160 120S200 100 212 96" fill="none" stroke={BUR} strokeWidth="2" />
        <path d="M60 150C110 140 150 154 212 138" fill="none" stroke="#8ca5ae" strokeWidth="7" strokeLinecap="round" opacity=".8" />
        <path d="M70 100h60v34H70z M150 110h50v28h-50z" fill="#e6dcc0" stroke="#6f6652" strokeWidth=".8" />
      </g>
      {/* window onto a generic contemporary skyline */}
      <rect x="338" y="64" width="236" height="290" fill="url(#cs-sky)" stroke="#6f6652" strokeWidth="1.5" />
      <g fill="#b9c6c4">
        <rect x="352" y="224" width="30" height="124" /><rect x="388" y="196" width="22" height="152" fill="#a7b8ba" /><rect x="416" y="238" width="38" height="110" />
        <path d="M462 348V176l9 -34l9 34v172z" fill="#9fb0b3" /><rect x="488" y="214" width="34" height="134" /><path d="M526 348V250q18 -14 36 0v98z" fill="#b2c1c0" />
      </g>
      <g stroke="rgba(247,242,230,.75)" strokeWidth="1">{Array.from({ length: 6 }, (_, k) => <path key={k} d={`M352 ${240 + k * 18}h30M416 ${252 + k * 16}h38M488 ${230 + k * 18}h34`} />)}</g>
      <rect x="338" y="334" width="236" height="20" fill="#d6d3c2" />
      <path d="M456 64V354M338 208H574" stroke="#6f6652" strokeWidth="1.4" />
      <rect x="338" y="64" width="236" height="290" fill="url(#cs-light)" />
      {/* drawing tubes */}
      <g transform="rotate(-7 66 330)"><rect x="42" y="316" width="30" height="170" rx="4" fill="#d9ceb4" stroke="#6f6652" strokeWidth="1" /><rect x="76" y="326" width="26" height="160" rx="4" fill="#cfc3a6" stroke="#6f6652" strokeWidth="1" /></g>

      {/* consultant: figure behind the table */}
      {POSES.map((_, i) => <g key={"b" + i} className={`cs-pose cs-p${i}`}><Figure i={i} /></g>)}

      {/* table */}
      <rect x="0" y="484" width={W} height="236" fill="#d8ccb0" />
      <rect x="0" y="484" width={W} height="5" fill="#b9ad90" />
      <rect x="0" y="668" width={W} height="52" fill="#c9bd9f" />
      <path d="M0 668H600" stroke="#8d8165" strokeWidth="1.2" />
      {/* physical model */}
      <g transform="translate(446 404)">
        <path d="M0 80h120l-22 -26h-120z" fill="#e9e0c8" stroke="#6f6652" strokeWidth="1" />
        <Box x={12} y={74} w={24} h={26} d={16} />
        <Box x={44} y={70} w={20} h={46} d={14} tone="#e7d7a8" />
        <Box x={72} y={76} w={26} h={20} d={16} />
        <Box x={52} y={58} w={16} h={34} d={12} tone="#e2c9cd" />
        <path d="M-6 84H122" stroke="#8d8165" strokeWidth="1" />
      </g>

      {/* the plan sheet */}
      <g transform="translate(40 506) scale(1 .56)" className="cs-sheet">
        <rect width="520" height="270" fill="#f8f3e7" stroke="#6f6652" strokeWidth="1.4" />
        <g stroke="rgba(111,102,82,.2)" strokeWidth=".7" fill="none">{Array.from({ length: 14 }, (_, k) => <path key={k} d={`M${k * 40} 0v270`} />)}{Array.from({ length: 8 }, (_, k) => <path key={"h" + k} d={`M0 ${k * 40}h520`} />)}</g>
        <path d="M-6 130C100 112 190 150 290 126S440 112 526 134" fill="none" stroke="#8ca5ae" strokeWidth="11" strokeLinecap="round" />
        {blocks.map(([x, y, w, h], k) => <rect key={k} x={x} y={y} width={w} height={h} fill="#eee6d2" stroke="#6f6652" strokeWidth=".9" />)}
        <path d="M18 18H502V252H18Z" fill="none" stroke={BUR} strokeWidth="1.3" strokeDasharray="8 5" />
        <path d="M18 230C120 190 210 120 290 108S440 60 502 40" fill="none" stroke={BUR} strokeWidth="3.6" strokeLinecap="round" />

        {/* 02 analytical layer */}
        <g className="cs-l cs-l1">
          <path d="M270 60C320 30 400 40 430 90S440 170 380 190S250 160 270 60ZM300 78C336 58 394 66 410 98S410 152 372 164S290 140 300 78Z" fill="none" stroke="#8c7a50" strokeWidth="1.2" />
          {Array.from({ length: 12 }, (_, k) => <rect key={k} x={250 + (k % 4) * 36} y={170 + Math.floor(k / 4) * 22} width="30" height="16" fill={k % 5 === 0 ? "rgba(107,31,50,.5)" : k % 2 ? "rgba(185,147,82,.5)" : "rgba(125,145,104,.45)"} />)}
          <circle cx="352" cy="112" r="58" fill="rgba(185,147,82,.12)" stroke={BUR} strokeWidth="1.6" strokeDasharray="6 4" />
          <circle cx="352" cy="112" r="5" fill={BUR} />
        </g>
        {/* 03 phasing / delivery sequence */}
        <g className="cs-l cs-l2">
          <rect x="18" y="18" width="162" height="234" fill="rgba(107,31,50,.14)" />
          <rect x="180" y="18" width="162" height="234" fill="rgba(185,147,82,.2)" />
          <rect x="342" y="18" width="160" height="234" fill="rgba(125,145,104,.2)" />
          <path d="M70 236H450" stroke="#3b372f" strokeWidth="2" />
          {[70, 260, 450].map((x, k) => <circle key={k} cx={x} cy="236" r="9" fill="#f8f3e7" stroke={BUR} strokeWidth="2.4" />)}
        </g>
        {/* 04 the note on tracing paper */}
        <g className="cs-l cs-l3">
          <rect x="290" y="150" width="200" height="96" fill="rgba(255,253,246,.7)" stroke="#8d8165" strokeWidth="1" />
          {[0, 1, 2, 3].map((k) => <path key={k} d={`M304 ${168 + k * 18}q16 -7 32 0t32 0t32 0t${k === 3 ? 20 : 32} 0`} fill="none" stroke="#3b372f" strokeWidth="1.5" strokeLinecap="round" />)}
        </g>
        {/* 05 resolved */}
        <g className="cs-l cs-l4">
          <path d="M18 18H502V252H18Z" fill="none" stroke={BUR} strokeWidth="2.6" />
          <rect x="468" y="212" width="22" height="22" fill={GOLD} stroke="#8c7a50" strokeWidth="1" />
        </g>
      </g>

      {/* hands and arms over the sheet */}
      {POSES.map((_, i) => <g key={"a" + i} className={`cs-pose cs-p${i}`}><Arms i={i} /></g>)}
    </svg>
  );
}
