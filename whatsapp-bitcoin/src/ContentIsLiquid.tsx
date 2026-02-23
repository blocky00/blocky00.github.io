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
// SNIPKI BRAND COLORS (mint/teal theme)
// =====================================================
const BRAND = {
  primary: '#5DC9A8',      // Main mint green
  light: '#6DD4B3',        // Lighter mint
  lighter: '#7EDFC0',      // Even lighter
  lightest: '#8FEACD',     // Lightest for chevrons
  dark: '#4AB896',         // Darker accent
  white: '#FFFFFF',
  shadow: 'rgba(0,80,60,0.15)',
};

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
      <feDropShadow dx="0" dy="6" stdDeviation="16" floodColor={BRAND.shadow} />
    </filter>
  </defs>
);

// =====================================================
// GEOMETRIC BACKGROUND (mint green with chevron pattern)
// =====================================================
const GeometricBackground = ({frame}: {frame: number}) => {
  // Subtle animation for chevrons
  const drift = Math.sin(frame / 120) * 8;

  return (
    <div style={{position: 'absolute', inset: 0, background: BRAND.primary, overflow: 'hidden'}}>
      {/* Chevron pattern on right side */}
      <svg
        width={W}
        height={H}
        style={{position: 'absolute', inset: 0}}
        viewBox={`0 0 ${W} ${H}`}
      >
        {/* Large chevron shapes - right side */}
        {/* Top right chevron pointing right */}
        <polygon
          points={`${W - 450 + drift},0 ${W},0 ${W},280 ${W - 280 + drift},280`}
          fill={BRAND.light}
          opacity={0.6}
        />
        {/* Second chevron band */}
        <rect
          x={W - 450 + drift}
          y={320}
          width={450}
          height={80}
          fill={BRAND.lighter}
          opacity={0.5}
        />
        {/* Third chevron band */}
        <rect
          x={W - 450 + drift}
          y={420}
          width={450}
          height={80}
          fill={BRAND.light}
          opacity={0.4}
        />
        {/* Fourth chevron band */}
        <rect
          x={W - 450 + drift}
          y={520}
          width={450}
          height={80}
          fill={BRAND.lighter}
          opacity={0.35}
        />
        {/* Bottom right chevron pointing right */}
        <polygon
          points={`${W - 380 + drift},${H - 220} ${W},${H - 220} ${W},${H} ${W - 220 + drift},${H}`}
          fill={BRAND.lightest}
          opacity={0.4}
        />
        {/* Arrow/chevron shape */}
        <polygon
          points={`${W - 320 + drift},160 ${W - 180 + drift},280 ${W - 320 + drift},400`}
          fill={BRAND.lightest}
          opacity={0.5}
        />
      </svg>
    </div>
  );
};

// =====================================================
// NODE CARD (white cards on mint background)
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
      {/* Card background - WHITE */}
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={16}
        fill={BRAND.white}
        filter="url(#cardShadow)"
      />
      {/* Left color accent bar */}
      <rect
        x={x}
        y={y}
        width={6}
        height={CARD_H}
        rx={16}
        fill={node.color}
      />
      <rect
        x={x}
        y={y + 16}
        width={6}
        height={CARD_H - 32}
        fill={node.color}
      />
      {/* Emoji */}
      <text
        x={node.x - 70}
        y={node.y - 32}
        fontSize={36}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {node.emoji}
      </text>
      {/* Label - dark text */}
      <text
        x={node.x + 20}
        y={node.y - 32}
        fill="#2D3748"
        fontSize={28}
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        dominantBaseline="middle"
      >
        {node.label}
      </text>
      {/* Divider */}
      <line
        x1={x + 20}
        y1={node.y - 8}
        x2={x + CARD_W - 20}
        y2={node.y - 8}
        stroke="#E2E8F0"
        strokeWidth={1}
      />
      {/* Variants - muted text */}
      {node.variants.map((v, i) => (
        <text
          key={v}
          x={x + 26}
          y={node.y + 16 + i * 28}
          fill="#718096"
          fontSize={17}
          fontFamily="system-ui, -apple-system, sans-serif"
          dominantBaseline="middle"
        >
          · {v}
        </text>
      ))}
    </g>
  );
};

// =====================================================
// VARIATION LOOP (white self-referencing arc above node)
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

  // Use white for the loop (stands out on mint)
  const loopColor = BRAND.white;

  return (
    <g opacity={opacity}>
      {/* Subtle shadow */}
      <path
        d={loopPath}
        fill="none"
        stroke="rgba(0,80,60,0.2)"
        strokeWidth={8}
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Main arc - white */}
      <path
        d={loopPath}
        fill="none"
        stroke={loopColor}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Animated arrowhead tip */}
      {progress > 0.05 && progress < 0.98 && (
        <polygon
          points="-6,0 6,0 0,10"
          fill={loopColor}
          transform={`translate(${tipX},${tipY}) rotate(${angle + 90})`}
        />
      )}
      {/* Final arrowhead (when done) */}
      {progress >= 0.98 && (
        <polygon
          points="-6,0 6,0 0,10"
          fill={loopColor}
          transform={`translate(${P3[0]},${P3[1]}) rotate(${120})`}
        />
      )}
    </g>
  );
};

// =====================================================
// TRANSFORMATION ARROW (white, between nodes)
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

  // White arrows on mint background
  const arrowColor = BRAND.white;

  return (
    <g opacity={opacity}>
      {/* Subtle shadow */}
      <path
        d={pathStr}
        fill="none"
        stroke="rgba(0,80,60,0.15)"
        strokeWidth={10}
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Main arrow line - white */}
      <path
        d={pathStr}
        fill="none"
        stroke={arrowColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
      />
      {/* Animated tip */}
      {progress > 0.04 && progress < 0.97 && (
        <polygon
          points="-5,0 5,0 0,10"
          fill={arrowColor}
          transform={`translate(${tipX},${tipY}) rotate(${angle + 90})`}
        />
      )}
      {/* Final arrowhead */}
      {progress >= 0.97 && (
        <polygon
          points="-5,0 5,0 0,10"
          fill={arrowColor}
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

  return (
    <circle
      cx={px}
      cy={py}
      r={5}
      fill={BRAND.white}
      opacity={0.85}
      filter="url(#softGlow)"
    />
  );
};

// =====================================================
// TITLE OVERLAY (white on mint)
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
              fontStyle: 'italic',
              color: BRAND.white,
              letterSpacing: '-1px',
              textShadow: '0 4px 30px rgba(0,80,60,0.3)',
            }}
          >
            Content is Liquid
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 20,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '4px',
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
            bottom: 50,
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
              fontSize: 38,
              fontWeight: 700,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontStyle: 'italic',
              color: BRAND.white,
              letterSpacing: '0.5px',
              textShadow: '0 2px 20px rgba(0,80,60,0.3)',
            }}
          >
            Content is Liquid — Every format. Infinite variants.
          </div>
        </div>
      )}
    </>
  );
};

// =====================================================
// PHASE LABEL (Variation / Transformation callouts - white on mint)
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

  const labelStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(8px)',
    borderRadius: 12,
    padding: '12px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 4px 20px rgba(0,80,60,0.15)',
  };

  const arrowLineStyle: React.CSSProperties = {
    width: 32,
    height: 3,
    borderRadius: 2,
    background: BRAND.white,
    position: 'relative' as const,
  };

  const arrowHeadStyle: React.CSSProperties = {
    position: 'absolute' as const,
    right: -6,
    top: -4,
    width: 0,
    height: 0,
    borderLeft: `8px solid ${BRAND.white}`,
    borderTop: '5px solid transparent',
    borderBottom: '5px solid transparent',
  };

  const textStyle: React.CSSProperties = {
    color: BRAND.white,
    fontSize: 26,
    fontWeight: 800,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '1px',
  };

  const subtextStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginTop: 8,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  return (
    <>
      {/* Variation label - top right */}
      {varOpacity * (1 - varFadeOut) > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 60,
            opacity: varOpacity * (1 - varFadeOut),
            pointerEvents: 'none',
          }}
        >
          <div style={labelStyle}>
            <div style={arrowLineStyle}>
              <div style={arrowHeadStyle} />
            </div>
            <span style={textStyle}>Variation</span>
          </div>
          <div style={{...subtextStyle, textAlign: 'right'}}>
            infinite variants per modality
          </div>
        </div>
      )}

      {/* Transformation label - top left */}
      {trOpacity * (1 - trFadeOut) > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            opacity: trOpacity * (1 - trFadeOut),
            pointerEvents: 'none',
          }}
        >
          <div style={labelStyle}>
            <div style={arrowLineStyle}>
              <div style={arrowHeadStyle} />
            </div>
            <span style={textStyle}>Transformation</span>
          </div>
          <div style={subtextStyle}>
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
    <AbsoluteFill style={{background: BRAND.primary, overflow: 'hidden'}}>
      {/* Geometric mint background with chevrons */}
      <GeometricBackground frame={frame} />

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
