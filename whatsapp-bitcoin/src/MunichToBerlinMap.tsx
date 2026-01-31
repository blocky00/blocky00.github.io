import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const viewBox = {
  width: 800,
  height: 900,
};

const munich = {x: 520, y: 700};
const berlin = {x: 540, y: 260};

const germanyPath =
  'M380 60 L470 80 L560 160 L610 260 L600 340 L650 430 L610 520 L630 610 L580 700 L500 820 L410 840 L300 780 L260 690 L200 620 L220 520 L170 460 L210 360 L190 280 L230 190 L300 120 Z';

export const MunichToBerlinMap = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();

  const zoomProgress = interpolate(frame, [0, 150], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(zoomProgress, [0, 1], [2.5, 1]);

  const lineProgress = interpolate(frame, [150, 330], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const target = {
    x: munich.x + lineProgress * (berlin.x - munich.x),
    y: munich.y + lineProgress * (berlin.y - munich.y),
  };

  const center = {
    x: viewBox.width / 2,
    y: viewBox.height / 2,
  };

  const lineLength = Math.hypot(berlin.x - munich.x, berlin.y - munich.y);
  const lineOffset = interpolate(frame, [150, 330], [lineLength, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0b0f17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <defs>
          <linearGradient id="mapGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d2c4a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0b1224" />
          </filter>
        </defs>

        <rect
          x="0"
          y="0"
          width={viewBox.width}
          height={viewBox.height}
          fill="url(#mapGlow)"
          rx="40"
        />

        <g
          transform={`translate(${center.x} ${center.y}) scale(${scale}) translate(${-target.x} ${-target.y})`}
        >
          <path
            d={germanyPath}
            fill="#1c2f4a"
            stroke="#4a6fa1"
            strokeWidth={4}
            filter="url(#softShadow)"
          />

          <line
            x1={munich.x}
            y1={munich.y}
            x2={berlin.x}
            y2={berlin.y}
            stroke="#facc15"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={lineLength}
            strokeDashoffset={lineOffset}
          />

          <circle cx={munich.x} cy={munich.y} r={14} fill="#f97316" />
          <circle cx={munich.x} cy={munich.y} r={6} fill="#fff7ed" />
          <text
            x={munich.x - 10}
            y={munich.y + 40}
            fill="#fff7ed"
            fontSize="26"
            textAnchor="end"
          >
            Munich
          </text>

          <circle cx={berlin.x} cy={berlin.y} r={14} fill="#38bdf8" />
          <circle cx={berlin.x} cy={berlin.y} r={6} fill="#e0f2fe" />
          <text
            x={berlin.x + 18}
            y={berlin.y - 20}
            fill="#e0f2fe"
            fontSize="26"
          >
            Berlin
          </text>
        </g>

        <text
          x={viewBox.width / 2}
          y={viewBox.height - 40}
          fill="#94a3b8"
          fontSize="22"
          textAnchor="middle"
        >
          Munich → Berlin route · 15s · {fps}fps
        </text>
      </svg>
    </AbsoluteFill>
  );
};
