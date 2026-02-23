import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import React from 'react';

// =====================================================
// CONTENT IS LIQUID
// Animated visualization of content modality network
// =====================================================
// Timeline (30s = 900 frames @ 30fps):
//   0–60f   Title "Content is Liquid" appears
//  60–200f  5 modality cards pop in (staggered)
// 200–400f  Variation loops (red) draw per node + label
// 400–750f  Transformation arrows (blue) draw one by one
// 750–900f  Full liquid network with flowing particles

const W = 1920;
const H = 1080;
const CARD_W = 246;
const CARD_H = 174;

// =====================================================
// DATA
// =====================================================
const NODES = [
  {
    id: 'bilder',
    label: 'Bilder',
    emoji: '🖼️',
    variants: ['Infographic', 'PPT Deck', 'Carousel'],
    x: 960,
    y: 230,
    color: '#F59E0B',
    appearAt: 65,
  },
  {
    id: 'text',
    label: 'Text',
    emoji: '📝',
    variants: ['Blog', 'Buch', 'Newsletter', 'Artikel'],
    x: 215,
    y: 510,
    color: '#3B82F6',
    appearAt: 90,
  },
  {
    id: 'video',
    label: 'Video',
    emoji: '🎬',
    variants: ['Animation', 'Film', 'Reel'],
    x: 1690,
    y: 295,
    color: '#EF4444',
    appearAt: 115,
  },
  {
    id: 'audio',
    label: 'Audio',
    emoji: '🎵',
    variants: ['Song', 'Podcast', 'Radio', 'Lesen'],
    x: 1580,
    y: 750,
    color: '#8B5CF6',
    appearAt: 140,
  },
  {
    id: 'app',
    label: 'App',
    emoji: '💻',
    variants: ['Website', 'Game', 'Tool'],
    x: 645,
    y: 845,
    color: '#10B981',
    appearAt: 165,
  },
] as const;

type NodeId = (typeof NODES)[number]['id'];
const getNode = (id: NodeId) => NODES.find((n) => n.id === id)!;

// Variation self-loops (red) - appear after all nodes
const VARIATION_LOOPS: {nodeId: NodeId; drawAt: number}[] = [
  {nodeId: 'bilder', drawAt: 210},
  {nodeId: 'text', drawAt: 248},
  {nodeId: 'video', drawAt: 286},
  {nodeId: 'audio', drawAt: 324},
  {nodeId: 'app', drawAt: 362},
];

// Transformation arrows (blue) - bidirectional across nodes
const CONNECTIONS: {
  from: NodeId;
  to: NodeId;
  cpOff: [number, number];
  drawAt: number;
}[] = [
  {from: 'text', to: 'bilder', cpOff: [-100, -130], drawAt: 405},
  {from: 'bilder', to: 'text', cpOff: [100, 130], drawAt: 435},
  {from: 'bilder', to: 'video', cpOff: [0, -140], drawAt: 465},
  {from: 'video', to: 'bilder', cpOff: [0, 140], drawAt: 495},
  {from: 'video', to: 'audio', cpOff: [160, 0], drawAt: 525},
  {from: 'audio', to: 'video', cpOff: [-160, 0], drawAt: 555},
  {from: 'audio', to: 'text', cpOff: [0, 180], drawAt: 585},
  {from: 'text', to: 'audio', cpOff: [0, -180], drawAt: 615},
  {from: 'bilder', to: 'app', cpOff: [-140, 80], drawAt: 645},
  {from: 'app', to: 'bilder', cpOff: [140, -80], drawAt: 675},
  {from: 'app', to: 'video', cpOff: [100, 170], drawAt: 705},
  {from: 'audio', to: 'app', cpOff: [0, 140], drawAt: 735},
];

// =====================================================
// MATH HELPERS
// =====================================================
function edgePoint(
  from: {x: number; y: number},
  to: {x: number; y: number},
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return {x: from.x, y: from.y};
  const nx = dx / dist;
  const ny = dy / dist;
  const hw = CARD_W / 2 + 18;
  const hh = CARD_H / 2 + 18;
  const tx = Math.abs(nx) > 0.001 ? hw / Math.abs(nx) : Infinity;
  const ty = Math.abs(ny) > 0.001 ? hh / Math.abs(ny) : Infinity;
  const t = Math.min(tx, ty);
  return {x: from.x + nx * t, y: from.y + ny * t};
}

function qBez(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ];
}

function cBez(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * mt * p0[0] +
      3 * mt * mt * t * p1[0] +
      3 * mt * t * t * p2[0] +
      t * t * t * p3[0],
    mt * mt * mt * p0[1] +
      3 * mt * mt * t * p1[1] +
      3 * mt * t * t * p2[1] +
      t * t * t * p3[1],
  ];
}

// =====================================================
// SVG DEFS (filters, gradients)
// =====================================================
const SvgDefs = () => (
  <defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="rgba(0,0,0,0.6)" />
    </filter>
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stopColor="#1a2055" />
      <stop offset="100%" stopColor="#080c1e" />
    </radialGradient>
  </defs>
);

// =====================================================
// LIQUID WAVE BACKGROUND
// =====================================================
const LiquidBackground = ({frame}: {frame: number}) => {
  const wave = (
    x: number,
    amplitude: number,
    wavelength: number,
    speed: number,
    phase: number,
    baseY: number,
  ) =>
    baseY +
    amplitude * Math.sin(((x / wavelength + frame * speed + phase) * Math.PI * 2));

  const buildWavePath = (
    amplitude: number,
    wavelength: number,
    speed: number,
    phase: number,
    baseY: number,
  ) => {
    let d = `M 0 ${H}`;
    for (let x = 0; x <= W; x += 12) {
      d += ` L ${x} ${wave(x, amplitude, wavelength, speed, phase, baseY)}`;
    }
    d += ` L ${W} ${H} Z`;
    return d;
  };

  return (
    <svg
      width={W}
      height={H}
      style={{position: 'absolute', inset: 0}}
    >
      <rect width={W} height={H} fill="url(#bgGrad)" />
      {/* Subtle grid */}
      {Array.from({length: 20}).map((_, i) => (
        <React.Fragment key={i}>
          <line
            x1={i * 100}
            y1={0}
            x2={i * 100}
            y2={H}
            stroke="rgba(255,255,255,0.025)"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={i * 60}
            x2={W}
            y2={i * 60}
            stroke="rgba(255,255,255,0.025)"
            strokeWidth={1}
          />
        </React.Fragment>
      ))}
      {/* Liquid waves at bottom */}
      <path
        d={buildWavePath(22, 400, 0.004, 0, H * 0.82)}
        fill="rgba(59,130,246,0.07)"
      />
      <path
        d={buildWavePath(18, 320, 0.005, 0.33, H * 0.86)}
        fill="rgba(139,92,246,0.06)"
      />
      <path
        d={buildWavePath(14, 260, 0.006, 0.66, H * 0.9)}
        fill="rgba(16,185,129,0.05)"
      />
    </svg>
  );
};

// =====================================================
// NODE CARD
// =====================================================
const NodeCard = ({
  node,
  frame,
  fps,
}: {
  node: (typeof NODES)[number];
  frame: number;
  fps: number;
}) => {
  const elapsed = frame - node.appearAt;
  const scaleSpring = spring({
    frame: elapsed,
    fps,
    config: {damping: 14, stiffness: 160},
  });
  const scale = Math.max(0, Math.min(1.05, scaleSpring));
  const opacity = interpolate(elapsed, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (elapsed < 0) return null;

  const x = node.x - CARD_W / 2;
  const y = node.y - CARD_H / 2;

  return (
    <g
      transform={`translate(${node.x},${node.y}) scale(${scale}) translate(${-node.x},${-node.y})`}
      opacity={opacity}
    >
      {/* Outer glow ring */}
      <rect
        x={x - 3}
        y={y - 3}
        width={CARD_W + 6}
        height={CARD_H + 6}
        rx={21}
        fill="none"
        stroke={node.color}
        strokeWidth={1.5}
        opacity={0.4}
        filter="url(#glow)"
      />
      {/* Card background */}
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={18}
        fill="rgba(8,12,40,0.88)"
        stroke={node.color}
        strokeWidth={2}
        filter="url(#cardShadow)"
      />
      {/* Color bar accent */}
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={7}
        rx={18}
        fill={node.color}
        opacity={0.9}
      />
      {/* Emoji */}
      <text
        x={node.x - 75}
        y={node.y - 32}
        fontSize={38}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {node.emoji}
      </text>
      {/* Label */}
      <text
        x={node.x + 18}
        y={node.y - 32}
        fill="white"
        fontSize={30}
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        dominantBaseline="middle"
      >
        {node.label}
      </text>
      {/* Divider */}
      <line
        x1={x + 16}
        y1={node.y - 10}
        x2={x + CARD_W - 16}
        y2={node.y - 10}
        stroke={node.color}
        strokeWidth={1}
        opacity={0.4}
      />
      {/* Variants */}
      {node.variants.map((v, i) => (
        <text
          key={v}
          x={x + 22}
          y={node.y + 10 + i * 30}
          fill={node.color}
          fontSize={19}
          fontFamily="system-ui, -apple-system, sans-serif"
          dominantBaseline="middle"
          opacity={0.9}
        >
          · {v}
        </text>
      ))}
    </g>
  );
};

// =====================================================
// VARIATION LOOP (red self-referencing arc above node)
// =====================================================
const VariationLoop = ({
  nodeId,
  drawAt,
  frame,
}: {
  nodeId: NodeId;
  drawAt: number;
  frame: number;
}) => {
  const node = getNode(nodeId);
  const elapsed = frame - drawAt;
  if (elapsed < 0) return null;

  const progress = interpolate(elapsed, [0, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const opacity = interpolate(elapsed, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cx = node.x;
  const topY = node.y - CARD_H / 2 - 8;

  // Cubic bezier: left edge → above card → right edge
  const P0: [number, number] = [cx - 42, topY];
  const P1: [number, number] = [cx - 110, topY - 110];
  const P2: [number, number] = [cx + 110, topY - 110];
  const P3: [number, number] = [cx + 42, topY];

  const DASH = 500;
  const dashOffset = DASH * (1 - progress);

  const [tipX, tipY] = cBez(progress, P0, P1, P2, P3);
  const dt = 0.015;
  const [prevX, prevY] = cBez(Math.max(0, progress - dt), P0, P1, P2, P3);
  const angle = (Math.atan2(tipY - prevY, tipX - prevX) * 180) / Math.PI;

  const loopPath = `M ${P0[0]} ${P0[1]} C ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]} ${P3[0]} ${P3[1]}`;

  return (
    <g opacity={opacity}>
      {/* Glow */}
      <path
        d={loopPath}
        fill="none"
        stroke="rgba(239,68,68,0.35)"
        strokeWidth={10}
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Main arc */}
      <path
        d={loopPath}
        fill="none"
        stroke="#EF4444"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Animated arrowhead tip */}
      {progress > 0.05 && progress < 0.98 && (
        <polygon
          points="-6,0 6,0 0,10"
          fill="#EF4444"
          transform={`translate(${tipX},${tipY}) rotate(${angle + 90})`}
        />
      )}
      {/* Final arrowhead (when done) */}
      {progress >= 0.98 && (
        <polygon
          points="-6,0 6,0 0,10"
          fill="#EF4444"
          transform={`translate(${P3[0]},${P3[1]}) rotate(${120})`}
        />
      )}
    </g>
  );
};

// =====================================================
// TRANSFORMATION ARROW (blue, between nodes)
// =====================================================
const TransformArrow = ({
  conn,
  frame,
}: {
  conn: (typeof CONNECTIONS)[number];
  frame: number;
}) => {
  const elapsed = frame - conn.drawAt;
  if (elapsed < 0) return null;

  const from = getNode(conn.from);
  const to = getNode(conn.to);

  const start = edgePoint(from, to);
  const end = edgePoint(to, from);

  const cpx = (start.x + end.x) / 2 + conn.cpOff[0];
  const cpy = (start.y + end.y) / 2 + conn.cpOff[1];

  const progress = interpolate(elapsed, [0, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const opacity = interpolate(elapsed, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const DASH = 2500;
  const dashOffset = DASH * (1 - progress);

  const pathStr = `M ${start.x} ${start.y} Q ${cpx} ${cpy} ${end.x} ${end.y}`;

  // Animated arrowhead at current tip
  const P0: [number, number] = [start.x, start.y];
  const P1: [number, number] = [cpx, cpy];
  const P2: [number, number] = [end.x, end.y];

  const [tipX, tipY] = qBez(progress, P0, P1, P2);
  const dt = 0.02;
  const [prevX, prevY] = qBez(Math.max(0, progress - dt), P0, P1, P2);
  const angle = (Math.atan2(tipY - prevY, tipX - prevX) * 180) / Math.PI;

  return (
    <g opacity={opacity}>
      {/* Glow layer */}
      <path
        d={pathStr}
        fill="none"
        stroke="rgba(59,130,246,0.3)"
        strokeWidth={12}
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Main arrow line */}
      <path
        d={pathStr}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Animated tip */}
      {progress > 0.04 && progress < 0.97 && (
        <polygon
          points="-5,0 5,0 0,10"
          fill="#3B82F6"
          filter="url(#softGlow)"
          transform={`translate(${tipX},${tipY}) rotate(${angle + 90})`}
        />
      )}
      {/* Final arrowhead */}
      {progress >= 0.97 && (
        <polygon
          points="-5,0 5,0 0,10"
          fill="#3B82F6"
          transform={`translate(${end.x},${end.y}) rotate(${angle + 90})`}
        />
      )}
    </g>
  );
};

// =====================================================
// FLOWING PARTICLE (rides along a connection in the final phase)
// =====================================================
const FlowParticle = ({
  conn,
  frame,
  offset,
}: {
  conn: (typeof CONNECTIONS)[number];
  frame: number;
  offset: number;
}) => {
  const from = getNode(conn.from);
  const to = getNode(conn.to);
  const start = edgePoint(from, to);
  const end = edgePoint(to, from);
  const cpx = (start.x + end.x) / 2 + conn.cpOff[0];
  const cpy = (start.y + end.y) / 2 + conn.cpOff[1];

  // Particle travels 0→1 repeatedly, offset per particle
  const speed = 0.008;
  const t = ((frame * speed + offset) % 1 + 1) % 1;

  const [px, py] = qBez(
    t,
    [start.x, start.y],
    [cpx, cpy],
    [end.x, end.y],
  );

  const node = getNode(conn.from);
  return (
    <circle
      cx={px}
      cy={py}
      r={5}
      fill={node.color}
      opacity={0.75}
      filter="url(#softGlow)"
    />
  );
};

// =====================================================
// TITLE OVERLAY
// =====================================================
const TitleOverlay = ({frame, fps}: {frame: number; fps: number}) => {
  // Show title at start and fade out
  const titleIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const titleOut = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Show title again at the end
  const outroIn = interpolate(frame, [800, 840], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const titleOpacity = titleIn * (1 - titleOut);
  const outroOpacity = outroIn;

  return (
    <>
      {/* Opening title */}
      {titleOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            opacity: titleOpacity,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: 'white',
              letterSpacing: '-2px',
              textShadow: '0 0 80px rgba(59,130,246,0.8), 0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            Content is Liquid
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              marginTop: 16,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '2px',
            }}
          >
            TRANSFORM · MULTIPLY · FLOW
          </div>
        </div>
      )}

      {/* Outro title */}
      {outroOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: outroOpacity,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '1px',
              textShadow: '0 0 40px rgba(59,130,246,0.6)',
            }}
          >
            Content is Liquid ✦ Every format. Infinite variants.
          </div>
        </div>
      )}
    </>
  );
};

// =====================================================
// PHASE LABEL (Variation / Transformation callouts)
// =====================================================
const PhaseLabel = ({frame}: {frame: number}) => {
  const varOpacity = interpolate(frame, [200, 220], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const varFadeOut = interpolate(frame, [395, 420], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const trOpacity = interpolate(frame, [400, 420], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const trFadeOut = interpolate(frame, [740, 770], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* Variation label - top right */}
      {varOpacity * (1 - varFadeOut) > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            right: 60,
            opacity: varOpacity * (1 - varFadeOut),
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '2px solid rgba(239,68,68,0.6)',
              borderRadius: 12,
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 3,
                borderRadius: 2,
                background: '#EF4444',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -6,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid #EF4444',
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                }}
              />
            </div>
            <span
              style={{
                color: '#EF4444',
                fontSize: 28,
                fontWeight: 800,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '1px',
              }}
            >
              Variation
            </span>
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 16,
              marginTop: 6,
              textAlign: 'right',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            infinite variants per modality
          </div>
        </div>
      )}

      {/* Transformation label - top left */}
      {trOpacity * (1 - trFadeOut) > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 60,
            opacity: trOpacity * (1 - trFadeOut),
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(59,130,246,0.15)',
              border: '2px solid rgba(59,130,246,0.6)',
              borderRadius: 12,
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 3,
                borderRadius: 2,
                background: '#3B82F6',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -6,
                  top: -4,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid #3B82F6',
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                }}
              />
            </div>
            <span
              style={{
                color: '#3B82F6',
                fontSize: 28,
                fontWeight: 800,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '1px',
              }}
            >
              Transformation
            </span>
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 16,
              marginTop: 6,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            content flows between modalities
          </div>
        </div>
      )}
    </>
  );
};

// =====================================================
// MAIN COMPOSITION
// =====================================================
export const ContentIsLiquid = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Flowing particles start at frame 760 (after all arrows drawn)
  const particleOpacity = interpolate(frame, [755, 785], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: '#080c1e', overflow: 'hidden'}}>
      {/* Animated liquid background */}
      <LiquidBackground frame={frame} />

      {/* Main SVG layer */}
      <svg
        width={W}
        height={H}
        style={{position: 'absolute', inset: 0}}
      >
        <SvgDefs />

        {/* Transformation arrows (drawn BEFORE nodes so nodes sit on top) */}
        {CONNECTIONS.map((conn, i) => (
          <TransformArrow key={i} conn={conn} frame={frame} />
        ))}

        {/* Variation self-loops */}
        {VARIATION_LOOPS.map((loop) => (
          <VariationLoop
            key={loop.nodeId}
            nodeId={loop.nodeId}
            drawAt={loop.drawAt}
            frame={frame}
          />
        ))}

        {/* Flowing particles along arrows (final phase) */}
        {particleOpacity > 0 &&
          CONNECTIONS.map((conn, i) =>
            [0, 0.33, 0.66].map((offset) => (
              <FlowParticle
                key={`${i}-${offset}`}
                conn={conn}
                frame={frame}
                offset={offset + i * 0.07}
              />
            )),
          )}

        {/* Node cards on top */}
        {NODES.map((node) => (
          <NodeCard key={node.id} node={node} frame={frame} fps={fps} />
        ))}
      </svg>

      {/* HTML overlays */}
      <TitleOverlay frame={frame} fps={fps} />
      <PhaseLabel frame={frame} />
    </AbsoluteFill>
  );
};
