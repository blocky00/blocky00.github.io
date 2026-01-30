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
 * LINKEDIN CINEMATIC REEL - GOING ABSOLUTELY MENTAL
 *
 * Effects used:
 * - 3D perspective transforms with depth
 * - Chromatic aberration (RGB split)
 * - Glitch effects with random displacement
 * - Particle explosion system
 * - Scanlines and CRT noise
 * - Text reveal with typewriter + glitch
 * - Cards flying through 3D space
 * - Shockwave distortions
 * - Neon glow pulses
 * - Matrix-style data rain
 */

// Slide content data
const slides = [
  {
    id: 0,
    title: 'B2B Marketing\nTrends 2026',
    subtitle: 'The Big Six',
    body: '',
    number: null,
  },
  {
    id: 1,
    title: 'AI-Powered\nPersonalisation',
    subtitle: 'From automation to anticipation',
    body: 'Use intent signals to deliver 1:1 journeys, micro-moment engagement and next best actions.',
    number: 1,
  },
  {
    id: 2,
    title: 'GEO & AI Search\nPresence',
    subtitle: 'Compete in a zero-click world',
    body: 'Structure data, publish Q&A and evidence pages. Authority beats noise.',
    number: 2,
  },
  {
    id: 3,
    title: 'Full-Funnel ABX\n& Rev Alignment',
    subtitle: 'Collapse silos',
    body: 'Align sales & marketing on shared KPIs. Pipeline velocity > vanity metrics.',
    number: 3,
  },
];

// ============================================
// PARTICLE SYSTEM - Explosive particles
// ============================================
const Particle = ({
  index,
  startFrame,
  seed,
}: {
  index: number;
  startFrame: number;
  seed: string;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const angle = random(`${seed}-angle-${index}`) * Math.PI * 2;
  const speed = random(`${seed}-speed-${index}`) * 800 + 200;
  const size = random(`${seed}-size-${index}`) * 8 + 2;
  const lifetime = random(`${seed}-life-${index}`) * 40 + 20;

  const progress = Math.min(localFrame / lifetime, 1);
  const x = Math.cos(angle) * speed * progress;
  const y = Math.sin(angle) * speed * progress + progress * progress * 300;

  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = interpolate(progress, [0, 0.1, 1], [0, 1, 0.2]);

  const hue = random(`${seed}-hue-${index}`) * 60 + 200; // Blue-cyan range

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: `hsl(${hue}, 100%, 70%)`,
        boxShadow: `0 0 ${size * 2}px hsl(${hue}, 100%, 50%)`,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        opacity,
      }}
    />
  );
};

const ParticleExplosion = ({
  startFrame,
  count = 50,
  seed,
}: {
  startFrame: number;
  count?: number;
  seed: string;
}) => {
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {Array.from({length: count}).map((_, i) => (
        <Particle key={i} index={i} startFrame={startFrame} seed={seed} />
      ))}
    </div>
  );
};

// ============================================
// GLITCH TEXT - Text with random displacement
// ============================================
const GlitchText = ({
  children,
  intensity = 1,
  style,
}: {
  children: string;
  intensity?: number;
  style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();

  // Random glitch every few frames
  const glitchActive = frame % 4 === 0 || frame % 7 === 0;
  const glitchX = glitchActive ? (random(`glitch-x-${frame}`) - 0.5) * 20 * intensity : 0;
  const glitchY = glitchActive ? (random(`glitch-y-${frame}`) - 0.5) * 10 * intensity : 0;

  return (
    <div style={{position: 'relative', ...style}}>
      {/* Red channel */}
      <div
        style={{
          position: 'absolute',
          color: 'cyan',
          mixBlendMode: 'screen',
          transform: `translate(${-3 * intensity + glitchX}px, ${glitchY}px)`,
          opacity: 0.8,
        }}
      >
        {children}
      </div>
      {/* Blue channel */}
      <div
        style={{
          position: 'absolute',
          color: 'red',
          mixBlendMode: 'screen',
          transform: `translate(${3 * intensity - glitchX}px, ${-glitchY}px)`,
          opacity: 0.8,
        }}
      >
        {children}
      </div>
      {/* Main text */}
      <div style={{position: 'relative', color: 'white'}}>{children}</div>
    </div>
  );
};

// ============================================
// SCANLINES - CRT monitor effect
// ============================================
const Scanlines = ({opacity = 0.15}: {opacity?: number}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, ${opacity}) 0px,
          rgba(0, 0, 0, ${opacity}) 1px,
          transparent 1px,
          transparent 3px
        )`,
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================
// DATA RAIN - Matrix-style falling characters
// ============================================
const DataRain = ({seed}: {seed: string}) => {
  const frame = useCurrentFrame();
  const columns = 30;
  const chars = '01アイウエオカキクケコ'.split('');

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.15}}>
      {Array.from({length: columns}).map((_, col) => {
        const x = (col / columns) * 100;
        const speed = random(`${seed}-speed-${col}`) * 2 + 1;
        const offset = random(`${seed}-offset-${col}`) * 1000;
        const y = ((frame * speed + offset) % 150) - 20;

        return (
          <div
            key={col}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              fontFamily: 'monospace',
              fontSize: 14,
              color: '#0066cc',
              textShadow: '0 0 10px #0066cc',
              writingMode: 'vertical-rl',
            }}
          >
            {Array.from({length: 15}).map((_, i) => (
              <span key={i} style={{opacity: 1 - i * 0.06}}>
                {chars[Math.floor(random(`${seed}-char-${col}-${i}-${Math.floor(frame / 3)}`) * chars.length)]}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// SLIDE CARD - 3D transformed slide
// ============================================
const SlideCard = ({
  slide,
  isActive,
  progress,
  exitProgress,
}: {
  slide: typeof slides[0];
  isActive: boolean;
  progress: number;
  exitProgress: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 3D entrance - fly in from the void
  const enterZ = interpolate(progress, [0, 1], [-2000, 0], {
    easing: Easing.out(Easing.exp),
    extrapolateRight: 'clamp',
  });
  const enterRotateX = interpolate(progress, [0, 1], [90, 0], {
    easing: Easing.out(Easing.back(1.5)),
    extrapolateRight: 'clamp',
  });
  const enterRotateY = interpolate(progress, [0, 1], [-45, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });
  const enterScale = interpolate(progress, [0, 1], [0.3, 1], {
    extrapolateRight: 'clamp',
  });

  // 3D exit - explode outward
  const exitZ = interpolate(exitProgress, [0, 1], [0, 500]);
  const exitRotateX = interpolate(exitProgress, [0, 1], [0, -30]);
  const exitRotateY = interpolate(exitProgress, [0, 1], [0, 60]);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.5]);
  const exitOpacity = interpolate(exitProgress, [0, 0.5, 1], [1, 1, 0]);

  // Floating animation when active
  const floatY = isActive ? Math.sin(frame / 15) * 10 : 0;
  const floatRotate = isActive ? Math.sin(frame / 20) * 2 : 0;

  // Glitch intensity based on transitions
  const glitchIntensity = interpolate(
    Math.max(1 - progress, exitProgress),
    [0, 0.5, 1],
    [0, 2, 5]
  );

  const z = enterZ + exitZ;
  const rotateX = enterRotateX + exitRotateX;
  const rotateY = enterRotateY + exitRotateY + floatRotate;
  const scale = enterScale * exitScale;

  return (
    <div
      style={{
        position: 'absolute',
        width: 900,
        height: 1125,
        left: '50%',
        top: '50%',
        marginLeft: -450,
        marginTop: -562,
        perspective: 1500,
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0a66c2',
          borderRadius: 20,
          padding: 60,
          boxSizing: 'border-box',
          transform: `
            translateZ(${z}px)
            translateY(${floatY}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale(${scale})
          `,
          transformStyle: 'preserve-3d',
          boxShadow: `
            0 0 60px rgba(10, 102, 194, 0.5),
            0 0 120px rgba(10, 102, 194, 0.3),
            inset 0 0 60px rgba(255, 255, 255, 0.1)
          `,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* LinkedIn logo */}
        <div
          style={{
            alignSelf: 'flex-end',
            fontSize: 32,
            fontWeight: 700,
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Linked<span style={{
            backgroundColor: 'white',
            color: '#0a66c2',
            padding: '2px 6px',
            borderRadius: 4,
          }}>in</span>
        </div>

        {/* Main content */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <GlitchText
            intensity={glitchIntensity}
            style={{
              fontSize: slide.id === 0 ? 72 : 64,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 30,
              fontFamily: 'system-ui, sans-serif',
              whiteSpace: 'pre-line',
            }}
          >
            {slide.title}
          </GlitchText>

          {slide.subtitle && (
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'white',
                marginBottom: 30,
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {slide.subtitle}
            </div>
          )}

          {slide.body && (
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.5,
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {slide.body}
            </div>
          )}
        </div>

        {/* Bottom section with number */}
        <div style={{borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: 30}}>
          {slide.number && (
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                fontWeight: 700,
                color: '#0a66c2',
                margin: '0 auto',
                boxShadow: '0 0 30px rgba(255,255,255,0.5)',
              }}
            >
              {slide.number}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SHOCKWAVE - Expanding ring effect
// ============================================
const Shockwave = ({startFrame}: {startFrame: number}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0 || localFrame > 30) return null;

  const progress = localFrame / 30;
  const scale = interpolate(progress, [0, 1], [0, 3]);
  const opacity = interpolate(progress, [0, 0.2, 1], [0, 0.8, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        borderRadius: '50%',
        border: '4px solid cyan',
        boxShadow: '0 0 40px cyan, inset 0 0 40px cyan',
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
};

// ============================================
// NOISE OVERLAY - Static/grain effect
// ============================================
const NoiseOverlay = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${frame}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================
// FLASH - Screen flash effect
// ============================================
const Flash = ({startFrame, color = 'white'}: {startFrame: number; color?: string}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0 || localFrame > 10) return null;

  const opacity = interpolate(localFrame, [0, 2, 10], [1, 0.8, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: color,
        opacity,
      }}
    />
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================
export const LinkedInCinematic = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // Timing: Each slide gets ~4 seconds (120 frames at 30fps)
  const framesPerSlide = 120;
  const transitionFrames = 30;

  // Calculate which slide is active
  const currentSlideIndex = Math.min(
    Math.floor(frame / framesPerSlide),
    slides.length - 1
  );

  // Background pulse
  const bgPulse = Math.sin(frame / 10) * 0.1 + 0.9;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgb(${Math.floor(5 * bgPulse)}, ${Math.floor(20 * bgPulse)}, ${Math.floor(40 * bgPulse)})`,
        overflow: 'hidden',
      }}
    >
      {/* Background data rain */}
      <DataRain seed="main" />

      {/* Render slides */}
      {slides.map((slide, index) => {
        const slideStart = index * framesPerSlide;
        const slideEnd = slideStart + framesPerSlide;

        // Progress for this slide (0-1 during its active time)
        const enterProgress = interpolate(
          frame,
          [slideStart, slideStart + transitionFrames],
          [0, 1],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        );

        const exitProgress = interpolate(
          frame,
          [slideEnd - transitionFrames, slideEnd],
          [0, 1],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        );

        const isActive = frame >= slideStart && frame < slideEnd;
        const isVisible = frame >= slideStart - 10 && frame < slideEnd + 10;

        if (!isVisible) return null;

        return (
          <React.Fragment key={slide.id}>
            <SlideCard
              slide={slide}
              isActive={isActive && enterProgress === 1 && exitProgress === 0}
              progress={enterProgress}
              exitProgress={exitProgress}
            />

            {/* Particle explosion on entrance */}
            <ParticleExplosion
              startFrame={slideStart}
              count={40}
              seed={`slide-${index}`}
            />

            {/* Shockwave on entrance */}
            <Shockwave startFrame={slideStart + 5} />

            {/* Flash on transition */}
            <Flash startFrame={slideStart} color="cyan" />
          </React.Fragment>
        );
      })}

      {/* Global effects */}
      <Scanlines opacity={0.1} />
      <NoiseOverlay />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Corner accent lines */}
      {[0, 1, 2, 3].map((corner) => {
        const isTop = corner < 2;
        const isLeft = corner % 2 === 0;
        const pulse = Math.sin(frame / 8 + corner) * 0.5 + 0.5;

        return (
          <div
            key={corner}
            style={{
              position: 'absolute',
              [isTop ? 'top' : 'bottom']: 40,
              [isLeft ? 'left' : 'right']: 40,
              width: 100,
              height: 100,
              borderTop: isTop ? '3px solid cyan' : 'none',
              borderBottom: !isTop ? '3px solid cyan' : 'none',
              borderLeft: isLeft ? '3px solid cyan' : 'none',
              borderRight: !isLeft ? '3px solid cyan' : 'none',
              opacity: 0.5 + pulse * 0.5,
              boxShadow: `0 0 20px rgba(0, 255, 255, ${pulse * 0.5})`,
            }}
          />
        );
      })}

      {/* Progress bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 400,
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(frame / durationInFrames) * 100}%`,
            backgroundColor: 'cyan',
            boxShadow: '0 0 10px cyan',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
