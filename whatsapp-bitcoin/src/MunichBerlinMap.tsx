import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import React from 'react';

/**
 * MUNICH TO BERLIN MAP ANIMATION
 *
 * Demonstrates:
 * 1. Camera zoom out from Munich
 * 2. Animated line drawing from Munich to Berlin
 * 3. Camera following the line
 *
 * Using stylized SVG map (no Mapbox token required)
 * For production with real maps, use Mapbox with @turf/turf
 */

// Germany outline SVG path (simplified)
const GERMANY_PATH = `
  M 480,50
  L 520,45 L 580,60 L 620,55 L 680,70 L 720,90
  L 750,130 L 780,180 L 770,230 L 800,280
  L 790,330 L 760,380 L 780,430 L 750,480
  L 700,520 L 650,540 L 600,530 L 550,550
  L 500,540 L 450,560 L 400,540 L 350,520
  L 320,480 L 300,430 L 280,380 L 260,330
  L 280,280 L 260,230 L 280,180 L 320,130
  L 360,100 L 400,70 L 440,55 Z
`;

// City coordinates (relative to our SVG viewBox)
const MUNICH = {x: 550, y: 480, name: 'München'};
const BERLIN = {x: 620, y: 200, name: 'Berlin'};

// ============================================
// ANIMATED LINE COMPONENT
// ============================================
const AnimatedLine = ({progress}: {progress: number}) => {
  // Calculate current point along the line
  const currentX = MUNICH.x + (BERLIN.x - MUNICH.x) * progress;
  const currentY = MUNICH.y + (BERLIN.y - MUNICH.y) * progress;

  // Create a curved path (slight arc for visual interest)
  const midX = (MUNICH.x + BERLIN.x) / 2 - 30;
  const midY = (MUNICH.y + BERLIN.y) / 2;

  // Quadratic bezier for the full path
  const fullPath = `M ${MUNICH.x} ${MUNICH.y} Q ${midX} ${midY} ${BERLIN.x} ${BERLIN.y}`;

  // Calculate path length for dash animation
  const pathLength = 400; // Approximate

  return (
    <g>
      {/* Glow effect */}
      <path
        d={fullPath}
        fill="none"
        stroke="rgba(255, 100, 100, 0.3)"
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
        filter="url(#glow)"
      />
      {/* Main line */}
      <path
        d={fullPath}
        fill="none"
        stroke="#FF4444"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
      />
      {/* Animated dot at current position */}
      {progress > 0 && progress < 1 && (
        <circle
          cx={currentX}
          cy={currentY}
          r={10}
          fill="#FF4444"
          filter="url(#glow)"
        />
      )}
    </g>
  );
};

// ============================================
// CITY MARKER COMPONENT
// ============================================
const CityMarker = ({
  x,
  y,
  name,
  isActive,
  showLabel,
}: {
  x: number;
  y: number;
  name: string;
  isActive: boolean;
  showLabel: boolean;
}) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 8) * 3 + 15;

  return (
    <g>
      {/* Pulse effect when active */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r={pulse + 10}
          fill="none"
          stroke="rgba(255, 68, 68, 0.5)"
          strokeWidth={3}
        />
      )}
      {/* Main marker */}
      <circle
        cx={x}
        cy={y}
        r={isActive ? 18 : 14}
        fill={isActive ? '#FF4444' : '#FFFFFF'}
        stroke={isActive ? '#FFFFFF' : '#FF4444'}
        strokeWidth={4}
        filter="url(#shadow)"
      />
      {/* Inner dot */}
      <circle
        cx={x}
        cy={y}
        r={6}
        fill={isActive ? '#FFFFFF' : '#FF4444'}
      />
      {/* Label */}
      {showLabel && (
        <text
          x={x}
          y={y - 30}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize={28}
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          filter="url(#textShadow)"
        >
          {name}
        </text>
      )}
    </g>
  );
};

// ============================================
// INFO OVERLAY
// ============================================
const InfoOverlay = ({
  phase,
  progress,
}: {
  phase: 'zoom' | 'line' | 'arrive';
  progress: number;
}) => {
  const labels = {
    zoom: 'Zooming out from München...',
    line: `Drawing route: ${Math.round(progress * 100)}%`,
    arrive: 'Arrived in Berlin!',
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '16px 32px',
          borderRadius: 12,
          fontSize: 28,
          fontWeight: 600,
          fontFamily: 'system-ui, sans-serif',
          backdropFilter: 'blur(10px)',
        }}
      >
        {labels[phase]}
      </div>
    </div>
  );
};

// ============================================
// DISTANCE INDICATOR
// ============================================
const DistanceIndicator = ({progress}: {progress: number}) => {
  const totalDistance = 585; // km Munich to Berlin
  const currentDistance = Math.round(totalDistance * progress);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 24,
      }}
    >
      {currentDistance} / {totalDistance} km
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================
export const MunichBerlinMap = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // Timeline (15 seconds = 450 frames at 30fps)
  // Phase 1: 0-150 frames (5s) - Zoom out from Munich
  // Phase 2: 150-400 frames (8.3s) - Draw line, camera follows
  // Phase 3: 400-450 frames (1.7s) - Arrive at Berlin

  const zoomOutEnd = 150;
  const lineEnd = 400;

  // Zoom animation (start zoomed in on Munich, zoom out)
  const zoomProgress = interpolate(frame, [0, zoomOutEnd], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Start very zoomed in (scale 4), end at normal view (scale 1)
  const scale = interpolate(zoomProgress, [0, 1], [4, 1.2]);

  // Camera position - starts centered on Munich, then follows the line
  const lineProgress = interpolate(frame, [zoomOutEnd, lineEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Camera follows the line
  const cameraX = interpolate(
    lineProgress,
    [0, 1],
    [MUNICH.x, BERLIN.x]
  );
  const cameraY = interpolate(
    lineProgress,
    [0, 1],
    [MUNICH.y, BERLIN.y]
  );

  // Determine phase
  let phase: 'zoom' | 'line' | 'arrive' = 'zoom';
  if (frame >= lineEnd) phase = 'arrive';
  else if (frame >= zoomOutEnd) phase = 'line';

  // SVG viewBox calculations for camera movement
  const viewBoxSize = 600 / scale;
  const viewBoxX = cameraX - viewBoxSize / 2;
  const viewBoxY = cameraY - viewBoxSize / 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a2e',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, #2d3561 0%, #1a1a2e 70%)',
        }}
      />

      {/* SVG Map */}
      <svg
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxSize} ${viewBoxSize * (1920 / 1080)}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow filter */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
          </filter>

          {/* Text shadow */}
          <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.8" />
          </filter>

          {/* Germany gradient */}
          <linearGradient id="germanyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#2d3748" />
          </linearGradient>
        </defs>

        {/* Germany outline */}
        <path
          d={GERMANY_PATH}
          fill="url(#germanyGradient)"
          stroke="#718096"
          strokeWidth={3}
          filter="url(#shadow)"
        />

        {/* Grid lines for visual interest */}
        {[...Array(10)].map((_, i) => (
          <React.Fragment key={i}>
            <line
              x1={250 + i * 60}
              y1={0}
              x2={250 + i * 60}
              y2={600}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
            <line
              x1={200}
              y1={i * 60}
              x2={850}
              y2={i * 60}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          </React.Fragment>
        ))}

        {/* Animated line from Munich to Berlin */}
        <AnimatedLine progress={lineProgress} />

        {/* City markers */}
        <CityMarker
          {...MUNICH}
          isActive={phase === 'zoom'}
          showLabel={zoomProgress > 0.3}
        />
        <CityMarker
          {...BERLIN}
          isActive={phase === 'arrive'}
          showLabel={lineProgress > 0.5}
        />
      </svg>

      {/* Info overlay */}
      <InfoOverlay phase={phase} progress={lineProgress} />

      {/* Distance indicator */}
      {phase !== 'zoom' && <DistanceIndicator progress={lineProgress} />}

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 40,
          color: 'white',
          fontSize: 32,
          fontWeight: 800,
          fontFamily: 'system-ui, sans-serif',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        🇩🇪 Germany
      </div>

      {/* Made with Remotion */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 14,
          fontFamily: 'monospace',
        }}
      >
        Made with Remotion
      </div>
    </AbsoluteFill>
  );
};
