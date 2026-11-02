"use client";

import { useId } from "react";
import { BookOpenText, Brain, FileType, MessageSquareText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { howItWorksCopy, type FlowNodeId, type FlowOutcome } from "@/config/how-it-works";

/**
 * Animated "how it works" diagram: a voice wave travels from the customer,
 * through the engine (speech to text → reasoning brain ↔ knowledge base →
 * response), and out to either Leseding's spoken answer or a human agent.
 *
 * Pure render of a clock value: the parent owns time, so the step captions
 * and this diagram can never drift apart. Geometry is data (two layouts:
 * wide for kiosk/laptop screens, tall for portrait phones).
 *
 * </ABM>
 */

/* Timeline ------------------------------------------------------------- */

type PathId = "toStt" | "toBrain" | "toKb" | "toCompose" | "toAi" | "toHuman";
type NodeRef = FlowNodeId | "target";
type PathRef = Exclude<PathId, "toAi" | "toHuman"> | "toTarget";
type Packet = "voice" | "text";

type Stage =
  | { kind: "dwell"; node: NodeRef; ms: number; step: number }
  | { kind: "travel"; path: PathRef; reverse?: boolean; packet: Packet; ms: number; step: number }
  | { kind: "fade"; ms: number; step: number };

/** One loop of the story. `step` is the caption shown during each stage. */
const STAGES: Stage[] = [
  { kind: "dwell", node: "customer", ms: 1500, step: 0 },
  { kind: "travel", path: "toStt", packet: "voice", ms: 1400, step: 0 },
  { kind: "dwell", node: "stt", ms: 1100, step: 1 },
  { kind: "travel", path: "toBrain", packet: "text", ms: 1000, step: 1 },
  { kind: "dwell", node: "brain", ms: 700, step: 2 },
  { kind: "travel", path: "toKb", packet: "text", ms: 850, step: 2 },
  { kind: "dwell", node: "kb", ms: 800, step: 2 },
  { kind: "travel", path: "toKb", reverse: true, packet: "text", ms: 850, step: 2 },
  { kind: "dwell", node: "brain", ms: 800, step: 2 },
  { kind: "travel", path: "toCompose", packet: "text", ms: 1000, step: 2 },
  { kind: "dwell", node: "compose", ms: 1100, step: 3 },
  { kind: "travel", path: "toTarget", packet: "voice", ms: 1500, step: 3 },
  { kind: "dwell", node: "target", ms: 2800, step: 4 },
  { kind: "fade", ms: 700, step: 4 },
];

const STAGE_STARTS = STAGES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + STAGES[i - 1].ms], []);

/** Length of one full loop, in ms. */
export const LOOP_MS = STAGE_STARTS[STAGES.length - 1] + STAGES[STAGES.length - 1].ms;

/** Number of caption steps in a loop. */
export const STEP_COUNT = 5;

/** Start time (within a loop) of each caption step. */
export const STEP_STARTS = Array.from({ length: STEP_COUNT }, (_, step) => STAGE_STARTS[STAGES.findIndex((s) => s.step === step)]);

function locate(t: number) {
  let i = STAGES.length - 1;
  while (i > 0 && STAGE_STARTS[i] > t) i--;
  return { index: i, p: Math.min(1, Math.max(0, (t - STAGE_STARTS[i]) / STAGES[i].ms)) };
}

/** Caption step and its progress (0–1) at time `t` within a loop. */
export function stepAt(t: number) {
  const step = STAGES[locate(t).index].step;
  const end = step + 1 < STEP_COUNT ? STEP_STARTS[step + 1] : LOOP_MS;
  return { step, progress: (t - STEP_STARTS[step]) / (end - STEP_STARTS[step]) };
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* Geometry ------------------------------------------------------------- */

type Pt = readonly [number, number];
type Seg = { l: Pt } | { c: readonly [Pt, Pt, Pt] };
type PathDef = { from: Pt; segs: Seg[] };
type LabelPos = { dx: number; dy: number; anchor: "start" | "middle" | "end"; wrap?: number };
type NodeGeom = { x: number; y: number; r: number; label: LabelPos };

export type FlowLayout = {
  /** viewBox: x from 0 to w, y from `top` to `top + h`. */
  top: number;
  w: number;
  h: number;
  font: { label: number; sub: number; title: number };
  engine: { x: number; y: number; w: number; h: number; title: { x: number; y: number; anchor: "start" | "middle" } };
  nodes: Record<FlowNodeId, NodeGeom>;
  paths: Record<PathId, PathDef>;
};

/** Landscape: mirrors the pitch-deck slide, left to right. */
export const wideLayout: FlowLayout = {
  top: 56,
  w: 1240,
  h: 520,
  font: { label: 19, sub: 15, title: 21 },
  engine: { x: 268, y: 118, w: 652, h: 352, title: { x: 594, y: 164, anchor: "middle" } },
  nodes: {
    customer: { x: 124, y: 294, r: 70, label: { dx: 0, dy: 114, anchor: "middle" } },
    stt: { x: 378, y: 294, r: 42, label: { dx: 0, dy: 76, anchor: "middle" } },
    brain: { x: 594, y: 294, r: 58, label: { dx: 0, dy: -74, anchor: "middle" } },
    kb: { x: 594, y: 470, r: 40, label: { dx: 0, dy: 74, anchor: "middle" } },
    compose: { x: 810, y: 294, r: 42, label: { dx: 0, dy: 76, anchor: "middle" } },
    ai: { x: 1128, y: 156, r: 64, label: { dx: 0, dy: 104, anchor: "middle" } },
    human: { x: 1128, y: 432, r: 62, label: { dx: 0, dy: 104, anchor: "middle" } },
  },
  paths: {
    toStt: { from: [200, 294], segs: [{ l: [330, 294] }] },
    toBrain: { from: [424, 294], segs: [{ l: [530, 294] }] },
    toKb: { from: [594, 357], segs: [{ l: [594, 424] }] },
    toCompose: { from: [657, 294], segs: [{ l: [762, 294] }] },
    toAi: { from: [856, 294], segs: [{ l: [950, 294] }, { c: [[1000, 294], [992, 156], [1056, 156]] }] },
    toHuman: { from: [856, 294], segs: [{ l: [950, 294] }, { c: [[1000, 294], [992, 432], [1058, 432]] }] },
  },
};

/** Portrait: the same story top to bottom, for phones. */
export const tallLayout: FlowLayout = {
  top: 0,
  w: 640,
  h: 1190,
  font: { label: 25, sub: 19, title: 22 },
  engine: { x: 36, y: 220, w: 568, h: 604, title: { x: 64, y: 262, anchor: "start" } },
  nodes: {
    customer: { x: 330, y: 88, r: 64, label: { dx: 92, dy: -4, anchor: "start" } },
    stt: { x: 330, y: 340, r: 42, label: { dx: 64, dy: 9, anchor: "start" } },
    brain: { x: 330, y: 530, r: 58, label: { dx: 80, dy: 9, anchor: "start" } },
    kb: { x: 136, y: 530, r: 40, label: { dx: 0, dy: 74, anchor: "middle", wrap: 14 } },
    compose: { x: 330, y: 716, r: 42, label: { dx: 64, dy: 9, anchor: "start" } },
    ai: { x: 170, y: 1004, r: 64, label: { dx: 0, dy: 104, anchor: "middle", wrap: 14 } },
    human: { x: 490, y: 1004, r: 62, label: { dx: 0, dy: 104, anchor: "middle", wrap: 14 } },
  },
  paths: {
    toStt: { from: [330, 158], segs: [{ l: [330, 292] }] },
    toBrain: { from: [330, 388], segs: [{ l: [330, 466] }] },
    toKb: { from: [268, 530], segs: [{ l: [182, 530] }] },
    toCompose: { from: [330, 592], segs: [{ l: [330, 668] }] },
    toAi: { from: [330, 764], segs: [{ l: [330, 860] }, { c: [[330, 902], [170, 890], [170, 932]] }] },
    toHuman: { from: [330, 764], segs: [{ l: [330, 860] }, { c: [[330, 902], [490, 892], [490, 934]] }] },
  },
};

function toD({ from, segs }: PathDef) {
  return (
    `M${from[0]} ${from[1]}` +
    segs.map((s) => ("l" in s ? ` L${s.l[0]} ${s.l[1]}` : ` C${s.c.map((p) => `${p[0]} ${p[1]}`).join(" ")}`)).join("")
  );
}

/** Polyline approximation of a path, for placing the wave by distance travelled. */
function sample({ from, segs }: PathDef) {
  const pts: Pt[] = [from];
  let cur = from;
  for (const s of segs) {
    if ("l" in s) {
      pts.push(s.l);
      cur = s.l;
      continue;
    }
    const [c1, c2, end] = s.c;
    for (let i = 1; i <= 32; i++) {
      const t = i / 32;
      const u = 1 - t;
      const b = (a: number, b1: number, b2: number, b3: number) => u * u * u * a + 3 * u * u * t * b1 + 3 * u * t * t * b2 + t * t * t * b3;
      pts.push([b(cur[0], c1[0], c2[0], end[0]), b(cur[1], c1[1], c2[1], end[1])]);
    }
    cur = end;
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
}

type Sampled = ReturnType<typeof sample>;

function pointAt({ pts, cum, len }: Sampled, frac: number): Pt {
  const d = Math.min(1, Math.max(0, frac)) * len;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const k = (d - cum[i - 1]) / seg;
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
}

const sampledCache = new WeakMap<FlowLayout, Record<PathId, Sampled>>();
function sampledFor(layout: FlowLayout) {
  let s = sampledCache.get(layout);
  if (!s) {
    s = Object.fromEntries(Object.entries(layout.paths).map(([k, v]) => [k, sample(v)])) as Record<PathId, Sampled>;
    sampledCache.set(layout, s);
  }
  return s;
}

function wrap(text: string, max = Infinity) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + " " + word).length <= max) lines[lines.length - 1] = last + " " + word;
    else lines.push(word);
  }
  return lines;
}

/* Rendering ------------------------------------------------------------ */

/** The steps inside the engine are icons; the people and Leseding's answer are pictures. */
const ICONS: Partial<Record<FlowNodeId, LucideIcon>> = {
  stt: FileType,
  brain: Brain,
  kb: BookOpenText,
  compose: MessageSquareText,
};

const PHOTOS: Partial<Record<FlowNodeId, string>> = {
  customer: howItWorksCopy.images.customer,
  human: howItWorksCopy.images.human,
};

/** Every picture the diagram uses, for preloading before it opens. */
export const FLOW_IMAGES = Object.values(howItWorksCopy.images).filter(Boolean);

const TILES: FlowNodeId[] = ["stt", "kb", "compose"];

/** How much a node grows when the wave reaches it. */
const POP = 0.09;
const POP_IN_MS = 480;
const POP_OUT_MS = 380;

/** Ease-out with a small overshoot: the "pop". */
const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

type NodeState = "idle" | "visited" | "active";

function Shape({ tile, r, className, style }: { tile: boolean; r: number; className?: string; style?: React.CSSProperties }) {
  return tile ? (
    <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={r * 0.34} className={className} style={style} />
  ) : (
    <circle r={r} className={className} style={style} />
  );
}

const fade = "transition-[fill,stroke,color,opacity] duration-500";

export function FlowDiagram({
  layout,
  t,
  clock,
  outcome,
  reduced,
  engineName,
  className = "",
}: {
  layout: FlowLayout;
  /** Time within the current loop, 0 – LOOP_MS. */
  t: number;
  /** Ever-increasing time, for the pulsing rings. */
  clock: number;
  outcome: FlowOutcome;
  reduced: boolean;
  engineName: string;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const L = layout;
  const sampled = sampledFor(L);
  const { index, p } = locate(t);
  const stage = STAGES[index];
  const fading = stage.kind === "fade";
  const trailOpacity = fading ? 1 - p : 1;

  const nodeOf = (n: NodeRef): FlowNodeId => (n === "target" ? outcome : n);
  const pathOf = (r: PathRef): PathId => (r === "toTarget" ? (outcome === "ai" ? "toAi" : "toHuman") : r);

  const stateOf = (node: FlowNodeId): NodeState => {
    if (fading) return "idle";
    if (stage.kind === "dwell" && nodeOf(stage.node) === node) return "active";
    return STAGES.slice(0, index).some((s) => s.kind === "dwell" && nodeOf(s.node) === node) ? "visited" : "idle";
  };

  /**
   * Scale of a node: pops up (with a small overshoot) when the wave arrives,
   * and settles back once it leaves.
   */
  const lastDwell = (node: FlowNodeId) => {
    for (let i = index; i >= 0; i--) {
      const s = STAGES[i];
      if (s.kind === "dwell" && nodeOf(s.node) === node) return i;
    }
    return -1;
  };

  const scaleOf = (node: FlowNodeId) => {
    const j = lastDwell(node);
    if (reduced || j < 0) return 1;
    const start = STAGE_STARTS[j];
    if (j === index) return 1 + POP * easeOutBack(Math.min(1, (t - start) / POP_IN_MS));
    const out = (t - start - STAGES[j].ms) / POP_OUT_MS;
    return out >= 1 ? 1 : 1 + POP * (1 - easeInOut(out));
  };

  /** Leseding's ring of ticks turns while it speaks, then holds its angle. */
  const aiDwell = lastDwell("ai");
  const tickAngle = reduced || aiDwell < 0 ? 0 : Math.min(t - STAGE_STARTS[aiDwell], STAGES[aiDwell].ms) * 0.03;

  const progressOf = (path: PathId) => {
    let prog = 0;
    STAGES.forEach((s, i) => {
      if (i > index || s.kind !== "travel" || s.reverse || pathOf(s.path) !== path) return;
      prog = i < index || reduced ? 1 : easeInOut(p);
    });
    return prog;
  };

  // The wave itself: only while travelling, and not with reduced motion.
  let packet: { x: number; y: number; kind: Packet; opacity: number } | null = null;
  if (stage.kind === "travel" && !reduced) {
    const e = easeInOut(p);
    const [x, y] = pointAt(sampled[pathOf(stage.path)], stage.reverse ? 1 - e : e);
    const edge = Math.min(p, 1 - p) / 0.12;
    packet = { x, y, kind: stage.packet, opacity: Math.min(1, edge) };
  }

  // The engine glows while the call is inside it.
  const busy = !fading && index >= 2 && index <= 10;
  const ringPhase = (clock % 1600) / 1600;
  const pathIds = Object.keys(L.paths) as PathId[];
  const nodeIds = Object.keys(L.nodes) as FlowNodeId[];
  const fs = L.font;

  return (
    <svg
      viewBox={`0 ${L.top} ${L.w} ${L.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
      className={className}
    >
      <title id={`${uid}-t`}>How {engineName} handles a call</title>
      <desc id={`${uid}-d`}>
        The customer speaks. {engineName} turns speech into text, its reasoning brain checks the client knowledge base,
        and a response is prepared. Leseding then answers by voice, or escalates the call to a human agent.
      </desc>
      <defs>
        <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" orient="auto-start-reverse">
          <path d="M2 1.5 L8 5 L2 8.5" fill="none" stroke="var(--border-strong)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0%" stopColor="var(--brand-secondary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--brand-secondary)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-engine`} cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.03" />
        </radialGradient>
      </defs>

      {/* Engine box */}
      <g>
        <rect
          x={L.engine.x}
          y={L.engine.y}
          width={L.engine.w}
          height={L.engine.h}
          rx={28}
          fill={`url(#${uid}-engine)`}
          strokeWidth={2}
          className={`${fade} ${busy ? "stroke-primary" : "stroke-primary/35"}`}
        />
        <text
          x={L.engine.title.x}
          y={L.engine.title.y}
          textAnchor={L.engine.title.anchor}
          fontSize={fs.title}
          fontWeight={800}
          letterSpacing="-0.02em"
          className="font-display"
        >
          <tspan fontSize={fs.title * 0.7} dy={-fs.title * 0.06} className={`${fade} ${busy ? "fill-secondary" : "fill-secondary/40"}`}>
            ●
          </tspan>
          <tspan dx={fs.title * 0.4} dy={fs.title * 0.06} className="fill-fg">
            {engineName}
          </tspan>
        </text>
      </g>

      {/* Paths: dotted track, then the lit trail the wave leaves behind */}
      <g fill="none" strokeLinecap="round">
        {pathIds.map((id) => (
          <path
            key={id}
            d={toD(L.paths[id])}
            stroke="var(--border-strong)"
            strokeWidth={2.5}
            strokeDasharray="1 9"
            markerEnd={`url(#${uid}-arrow)`}
            markerStart={id === "toKb" ? `url(#${uid}-arrow)` : undefined}
          />
        ))}
        <g opacity={trailOpacity}>
          {pathIds.map((id) => {
            const prog = progressOf(id);
            if (prog <= 0) return null;
            // A wide faint stroke under the line gives the glow without a filter.
            return [12, 4].map((width) => (
              <path
                key={`${id}-${width}`}
                d={toD(L.paths[id])}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - prog}
                stroke="var(--brand-secondary)"
                strokeOpacity={width === 4 ? 1 : 0.2}
                strokeWidth={width}
              />
            ));
          })}
        </g>
      </g>

      {/* Nodes */}
      {nodeIds.map((id) => {
        const g = L.nodes[id];
        const state = stateOf(id);
        const tile = TILES.includes(id);
        const lit = state !== "idle";
        const active = state === "active";
        const copy = howItWorksCopy.nodes[id] as { label: string; sub?: string };
        const lines = wrap(copy.label, g.label.wrap);
        const lx = g.label.dx;
        const Icon = ICONS[id];
        const photo = PHOTOS[id];
        const ringClass = state === "idle" ? "stroke-line-strong" : active ? "stroke-secondary" : "stroke-secondary/70";
        return (
          <g key={id} transform={`translate(${g.x} ${g.y})`}>
            {/* rings while active */}
            {active &&
              !reduced &&
              [ringPhase, (ringPhase + 0.5) % 1].map((ph, i) => (
                <Shape key={i} tile={tile} r={g.r + 6 + ph * 34} className="fill-none stroke-secondary" style={{ opacity: (1 - ph) * 0.5, strokeWidth: 2 }} />
              ))}

            {/* the node itself pops up and glows */}
            <g transform={`scale(${scaleOf(id)})`}>
              <Shape tile={tile} r={g.r + (photo || id === "ai" ? 10 : 16)} className={`fill-secondary/15 ${fade} ${active ? "opacity-100" : "opacity-0"}`} />

              {photo ? (
                <>
                  <clipPath id={`${uid}-clip-${id}`}>
                    <circle r={g.r} />
                  </clipPath>
                  <image
                    href={photo}
                    x={-g.r}
                    y={-g.r}
                    width={g.r * 2}
                    height={g.r * 2}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${uid}-clip-${id})`}
                  />
                  {/* dims the photo until the wave reaches it */}
                  <circle r={g.r} fill="var(--page-background)" className={`${fade} ${lit ? "opacity-0" : "opacity-50"}`} />
                  <circle r={g.r} fill="none" style={{ strokeWidth: lit ? 4 : 2 }} className={`${fade} ${ringClass}`} />
                </>
              ) : id === "ai" ? (
                <g className={`${fade} ${lit ? "opacity-100" : "opacity-50"}`}>
                  {/* ring of ticks turns while Leseding speaks; the core breathes */}
                  {howItWorksCopy.images.aiTicks && (
                    <image
                      href={howItWorksCopy.images.aiTicks}
                      x={-g.r}
                      y={-g.r}
                      width={g.r * 2}
                      height={g.r * 2}
                      transform={`rotate(${tickAngle})`}
                    />
                  )}
                  <image
                    href={howItWorksCopy.images.aiCore}
                    x={-g.r}
                    y={-g.r}
                    width={g.r * 2}
                    height={g.r * 2}
                    transform={`scale(${active && !reduced ? 1 + 0.035 * Math.sin(clock / 170) : 1})`}
                  />
                </g>
              ) : (
                Icon && (
                  <>
                    <Shape tile={tile} r={g.r} style={{ strokeWidth: lit ? 3 : 1.5 }} className={`${fade} fill-surface ${ringClass}`} />
                    <Icon
                      x={-g.r * (tile ? 0.475 : 0.4)}
                      y={-g.r * (tile ? 0.475 : 0.4)}
                      width={g.r * (tile ? 0.95 : 0.8)}
                      height={g.r * (tile ? 0.95 : 0.8)}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className={`${fade} ${active ? "text-secondary" : state === "visited" ? "text-fg" : "text-muted"}`}
                    />
                  </>
                )
              )}
            </g>

            <text x={lx} y={g.label.dy} textAnchor={g.label.anchor} className="font-display">
              {lines.map((ln, i) => (
                <tspan
                  key={i}
                  x={lx}
                  dy={i === 0 ? 0 : fs.label * 1.15}
                  fontSize={fs.label}
                  fontWeight={700}
                  className={`${fade} ${state === "idle" ? "fill-fg/70" : "fill-fg"}`}
                >
                  {ln}
                </tspan>
              ))}
              {copy.sub && (
                <tspan x={lx} dy={fs.label * 1.1} fontSize={fs.sub} fontWeight={500} className="fill-muted">
                  {copy.sub}
                </tspan>
              )}
            </text>
          </g>
        );
      })}

      {/* The travelling wave */}
      {packet && <WavePacket {...packet} glowId={`${uid}-glow`} />}
    </svg>
  );
}

const BARS = [10, 18, 27, 15, 24, 13, 8];
const LINES = [30, 22, 26];

function WavePacket({ x, y, kind, opacity, glowId }: { x: number; y: number; kind: Packet; opacity: number; glowId: string }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity} aria-hidden="true">
      <ellipse rx={64} ry={42} fill={`url(#${glowId})`} />
      <rect x={-36} y={-18} width={72} height={36} rx={18} fill="var(--brand-secondary)" />
      {kind === "voice"
        ? BARS.map((h, i) => (
            <rect
              key={i}
              x={-24 + i * 8 - 2}
              y={-h / 2}
              width={4}
              height={h}
              rx={2}
              fill="var(--page-background)"
              className="animate-wave"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${(i % 4) * 0.13}s`, animationDuration: "0.7s" }}
            />
          ))
        : LINES.map((w, i) => <rect key={i} x={-17} y={-9 + i * 7} width={w} height={3.5} rx={1.75} fill="var(--page-background)" opacity={1 - i * 0.18} />)}
    </g>
  );
}
