import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
  random,
} from 'remotion';
import React from 'react';

/**
 * REMOTION CAPABILITIES SHOWREEL
 *
 * An instructional video demonstrating Remotion's animation capabilities
 * from basic to absolutely mind-blowing, with explanations of each technique.
 *
 * STRUCTURE:
 * 0-6s:   BASIC - interpolate(), useCurrentFrame()
 * 6-12s:  INTERMEDIATE - spring(), Easing functions
 * 12-18s: ADVANCED - 3D transforms, perspective
 * 18-24s: EXPERT - Particle systems, parallax
 * 24-30s: MIND-BLOWING - Everything combined
 */

// ============================================
// SECTION LABEL COMPONENT
// ============================================
const SectionLabel = ({
  title,
  code,
  level,
}: {
  title: string;
  code: string;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'MIND-BLOWING';
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({frame, fps, config: {damping: 15, stiffness: 200}});
  const y = interpolate(entrance, [0, 1], [50, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const levelColors: Record<string, string> = {
    'BASIC': '#4CAF50',
    'INTERMEDIATE': '#2196F3',
    'ADVANCED': '#9C27B0',
    'EXPERT': '#FF5722',
    'MIND-BLOWING': '#E91E63',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${y}px)`,
        opacity,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: levelColors[level],
          color: 'white',
          padding: '8px 20px',
          borderRadius: 20,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
          marginBottom: 10,
        }}
      >
        {level}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: 'white',
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 18,
          color: levelColors[level],
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '8px 16px',
          borderRadius: 8,
          display: 'inline-block',
        }}
      >
        {code}
      </div>
    </div>
  );
};

// ============================================
// DEMO 1: BASIC - interpolate()
// ============================================
const Demo1_Interpolate = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();

  // Simple linear interpolation - moves a box from left to right
  const x = interpolate(frame, [0, 90], [100, width - 200]);
  const rotation = interpolate(frame, [0, 90], [0, 360]);

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <SectionLabel
        title="Linear Motion"
        code="interpolate(frame, [0, 90], [0, 500])"
        level="BASIC"
      />
      <div
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#4CAF50',
          borderRadius: 16,
          transform: `translateX(${x - width / 2 + 50}px) rotate(${rotation}deg)`,
          boxShadow: '0 10px 40px rgba(76, 175, 80, 0.5)',
        }}
      />
      {/* Trail effect */}
      {[...Array(5)].map((_, i) => {
        const trailX = interpolate(frame - i * 3, [0, 90], [100, width - 200], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 100,
              height: 100,
              backgroundColor: '#4CAF50',
              borderRadius: 16,
              transform: `translateX(${trailX - width / 2 + 50}px)`,
              opacity: 0.2 - i * 0.04,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// DEMO 2: INTERMEDIATE - spring()
// ============================================
const Demo2_Spring = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Spring physics - natural bouncy animation
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 10,      // Lower = more bounce
      stiffness: 100,   // Higher = faster
      mass: 1,          // Weight
    },
  });

  const rotation = spring({
    frame: frame - 15,
    fps,
    config: {damping: 8, stiffness: 150},
  });

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <SectionLabel
        title="Spring Physics"
        code="spring({frame, fps, config: {damping: 10}})"
        level="INTERMEDIATE"
      />
      <div
        style={{
          width: 120,
          height: 120,
          backgroundColor: '#2196F3',
          borderRadius: 24,
          transform: `scale(${scale}) rotate(${rotation * 180}deg)`,
          boxShadow: '0 10px 40px rgba(33, 150, 243, 0.5)',
        }}
      />
      {/* Config visualization */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          fontFamily: 'monospace',
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
        }}
      >
        damping: 10 • stiffness: 100 • mass: 1
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// DEMO 3: INTERMEDIATE - Easing Functions
// ============================================
const Demo3_Easing = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();

  const easings = [
    {name: 'linear', fn: (t: number) => t, color: '#666'},
    {name: 'ease-in', fn: Easing.in(Easing.cubic), color: '#FF5722'},
    {name: 'ease-out', fn: Easing.out(Easing.cubic), color: '#4CAF50'},
    {name: 'ease-in-out', fn: Easing.inOut(Easing.cubic), color: '#2196F3'},
    {name: 'bounce', fn: Easing.out(Easing.bounce), color: '#E91E63'},
  ];

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <SectionLabel
        title="Easing Functions"
        code="Easing.inOut(Easing.cubic)"
        level="INTERMEDIATE"
      />
      <div style={{display: 'flex', gap: 30, marginTop: 100}}>
        {easings.map((easing, i) => {
          const y = interpolate(frame, [0, 90], [0, 300], {
            easing: easing.fn,
            extrapolateRight: 'clamp',
          });
          return (
            <div key={i} style={{textAlign: 'center'}}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: easing.color,
                  borderRadius: '50%',
                  transform: `translateY(${y}px)`,
                  boxShadow: `0 5px 20px ${easing.color}80`,
                }}
              />
              <div
                style={{
                  marginTop: 320,
                  fontSize: 11,
                  color: easing.color,
                  fontFamily: 'monospace',
                }}
              >
                {easing.name}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// DEMO 4: ADVANCED - 3D Transforms
// ============================================
const Demo4_3DTransforms = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rotateY = interpolate(frame, [0, 180], [0, 360]);
  const rotateX = interpolate(frame, [0, 180], [0, 180]);

  const cardEntrance = spring({frame, fps, config: {damping: 12, stiffness: 80}});
  const z = interpolate(cardEntrance, [0, 1], [-500, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1000,
      }}
    >
      <SectionLabel
        title="3D Transforms"
        code="transform: rotateY() rotateX() translateZ()"
        level="ADVANCED"
      />
      <div
        style={{
          width: 200,
          height: 280,
          background: 'linear-gradient(135deg, #9C27B0, #E91E63)',
          borderRadius: 20,
          transform: `
            rotateY(${rotateY}deg)
            rotateX(${Math.sin(frame / 30) * 15}deg)
            translateZ(${z}px)
          `,
          transformStyle: 'preserve-3d',
          boxShadow: '0 20px 60px rgba(156, 39, 176, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
        }}
      >
        🎴
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          fontFamily: 'monospace',
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        perspective: 1000px
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// DEMO 5: EXPERT - Particle System
// ============================================
const Particle = ({index, frame}: {index: number; frame: number}) => {
  const angle = (index / 30) * Math.PI * 2;
  const speed = 3 + random(`speed-${index}`) * 2;
  const size = 4 + random(`size-${index}`) * 8;

  const distance = frame * speed;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  const opacity = interpolate(frame, [0, 20, 60], [0, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const hue = (index * 12) % 360;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: `hsl(${hue}, 80%, 60%)`,
        transform: `translate(${x}px, ${y}px)`,
        opacity,
        boxShadow: `0 0 ${size}px hsl(${hue}, 80%, 60%)`,
      }}
    />
  );
};

const Demo5_Particles = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <SectionLabel
        title="Particle Systems"
        code="random(seed) + trigonometry"
        level="EXPERT"
      />
      {[...Array(30)].map((_, i) => (
        <Particle key={i} index={i} frame={frame} />
      ))}
      {/* Central orb */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, white, #FF5722)',
          boxShadow: '0 0 40px #FF5722, 0 0 80px #FF5722',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// DEMO 6: EXPERT - Parallax Layers
// ============================================
const Demo6_Parallax = () => {
  const frame = useCurrentFrame();

  const layers = [
    {depth: 0.2, color: '#1a1a2e', size: 300},
    {depth: 0.4, color: '#16213e', size: 200},
    {depth: 0.6, color: '#0f3460', size: 150},
    {depth: 0.8, color: '#e94560', size: 100},
    {depth: 1.0, color: '#ffffff', size: 60},
  ];

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a15'}}>
      <SectionLabel
        title="Parallax Layers"
        code="depth * scrollSpeed"
        level="EXPERT"
      />
      {layers.map((layer, i) => {
        const x = Math.sin(frame / 30) * 100 * layer.depth;
        const y = Math.cos(frame / 40) * 50 * layer.depth;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: layer.size,
              height: layer.size,
              backgroundColor: layer.color,
              borderRadius: layer.size / 4,
              transform: `translate(${x}px, ${y}px)`,
              opacity: 0.8,
              boxShadow: `0 0 ${20 * layer.depth}px ${layer.color}`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          fontFamily: 'monospace',
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        5 layers • different depths
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// DEMO 7: MIND-BLOWING - Everything Combined
// ============================================
const Demo7_MindBlowing = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // Spring entrance
  const entrance = spring({frame, fps, config: {damping: 8, stiffness: 60}});

  // Rotating 3D cube made of particles
  const cubeRotation = frame * 2;

  // Generate cube vertices
  const cubeSize = 150;
  const vertices = [];
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        vertices.push({x: x * cubeSize, y: y * cubeSize, z: z * cubeSize});
      }
    }
  }

  // Background pulse
  const bgPulse = Math.sin(frame / 10) * 20 + 30;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: `radial-gradient(circle, rgb(${bgPulse}, 0, ${bgPulse * 2}), #0a0015)`,
        perspective: 800,
      }}
    >
      <SectionLabel
        title="Everything Combined"
        code="spring + 3D + particles + parallax"
        level="MIND-BLOWING"
      />

      {/* 3D rotating structure */}
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `
            scale(${entrance})
            rotateX(${cubeRotation * 0.5}deg)
            rotateY(${cubeRotation}deg)
            rotateZ(${cubeRotation * 0.3}deg)
          `,
        }}
      >
        {vertices.map((vertex, i) => {
          const hue = (i * 45 + frame * 3) % 360;
          const pulse = Math.sin(frame / 5 + i) * 10 + 20;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: pulse,
                height: pulse,
                borderRadius: '50%',
                backgroundColor: `hsl(${hue}, 100%, 60%)`,
                transform: `translate3d(${vertex.x}px, ${vertex.y}px, ${vertex.z}px)`,
                boxShadow: `0 0 ${pulse}px hsl(${hue}, 100%, 60%)`,
              }}
            />
          );
        })}

        {/* Connecting lines (edges) */}
        {[...Array(12)].map((_, i) => {
          const rotation = i * 30;
          return (
            <div
              key={`edge-${i}`}
              style={{
                position: 'absolute',
                width: 2,
                height: cubeSize * 2,
                background: `linear-gradient(transparent, rgba(255,255,255,0.3), transparent)`,
                transform: `rotateZ(${rotation}deg)`,
                transformOrigin: 'center',
              }}
            />
          );
        })}
      </div>

      {/* Orbiting particles */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2 + frame * 0.05;
        const radius = 250 + Math.sin(frame / 20 + i) * 50;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.3; // Elliptical
        const z = Math.sin(angle) * radius;
        const size = 8 + Math.sin(frame / 10 + i) * 4;
        const hue = (i * 18 + frame * 2) % 360;

        return (
          <div
            key={`orbit-${i}`}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: `hsl(${hue}, 100%, 70%)`,
              transform: `translate3d(${x}px, ${y}px, ${z}px)`,
              boxShadow: `0 0 ${size * 2}px hsl(${hue}, 100%, 70%)`,
            }}
          />
        );
      })}

      {/* Glitch overlay */}
      {frame % 30 < 2 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,0,100,0.1)',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ============================================
// INTRO SEQUENCE
// ============================================
const IntroSequence = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleScale = spring({frame, fps, config: {damping: 10, stiffness: 80}});
  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {extrapolateLeft: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div style={{textAlign: 'center'}}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            transform: `scale(${titleScale})`,
            textShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
        >
          REMOTION
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.9)',
            marginTop: 20,
            opacity: subtitleOpacity,
            fontWeight: 300,
          }}
        >
          Capabilities Showreel
        </div>
        <div
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 30,
            opacity: subtitleOpacity,
            fontFamily: 'monospace',
          }}
        >
          Basic → Mind-Blowing
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================
export const RemotionShowreel = () => {
  const frame = useCurrentFrame();

  // Timing: 30 seconds = 900 frames at 30fps
  // Intro: 0-90 (3s)
  // Demo 1: 90-180 (3s)
  // Demo 2: 180-270 (3s)
  // Demo 3: 270-360 (3s)
  // Demo 4: 360-450 (3s)
  // Demo 5: 450-540 (3s)
  // Demo 6: 540-630 (3s)
  // Demo 7: 630-900 (9s)

  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a15'}}>
      <Sequence from={0} durationInFrames={90}>
        <IntroSequence />
      </Sequence>

      <Sequence from={90} durationInFrames={90}>
        <Demo1_Interpolate />
      </Sequence>

      <Sequence from={180} durationInFrames={90}>
        <Demo2_Spring />
      </Sequence>

      <Sequence from={270} durationInFrames={90}>
        <Demo3_Easing />
      </Sequence>

      <Sequence from={360} durationInFrames={90}>
        <Demo4_3DTransforms />
      </Sequence>

      <Sequence from={450} durationInFrames={90}>
        <Demo5_Particles />
      </Sequence>

      <Sequence from={540} durationInFrames={90}>
        <Demo6_Parallax />
      </Sequence>

      <Sequence from={630} durationInFrames={270}>
        <Demo7_MindBlowing />
      </Sequence>

      {/* Progress indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          right: 40,
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${(frame / 900) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4CAF50, #2196F3, #9C27B0, #FF5722, #E91E63)',
            borderRadius: 2,
          }}
        />
      </div>

      {/* Frame counter */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 40,
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {frame} / 900
      </div>
    </AbsoluteFill>
  );
};
