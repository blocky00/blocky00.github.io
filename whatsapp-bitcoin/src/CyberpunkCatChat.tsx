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
 * CYBERPUNK CAT CHAT - Git Rebase Tutorial
 *
 * A WhatsApp conversation between Stefan and his cat explaining git rebase
 * with INSANE cyberpunk effects inspired by the neon cat artwork.
 *
 * EFFECTS:
 * - Cyberpunk neon aesthetic (dark blue, pink, cyan)
 * - Parallax background layers
 * - CRT monitor / computer screen effect
 * - 3D perspective transforms on messages
 * - Glitch displacement
 * - Floating bokeh particles
 * - Scanlines and noise
 * - Chromatic aberration
 * - Screen flicker
 * - Zoom pulses on dramatic moments
 */

// Chat messages - Cat explaining git rebase to Stefan
const messages: Array<{
  id: number;
  sender: 'stefan' | 'cat';
  text: string;
  emoji?: string;
}> = [
  {id: 1, sender: 'stefan', text: "Hey Teo, I keep getting merge conflicts 😩"},
  {id: 2, sender: 'cat', text: "meow... have you tried rebasing?", emoji: "🐱"},
  {id: 3, sender: 'stefan', text: "Rebasing? What's that?"},
  {id: 4, sender: 'cat', text: "git fetch origin main", emoji: "⌨️"},
  {id: 5, sender: 'cat', text: "git rebase origin/main"},
  {id: 6, sender: 'cat', text: "It replays your commits on top of main 🧠"},
  {id: 7, sender: 'stefan', text: "Wait... my CAT knows git better than me?! 🤯"},
  {id: 8, sender: 'cat', text: "I've been watching you code for years human", emoji: "👀"},
  {id: 9, sender: 'cat', text: "Also... where's my dinner? 🍗"},
  {id: 10, sender: 'stefan', text: "Fair enough 😂"},
];

// ============================================
// FLOATING BOKEH PARTICLES
// ============================================
const BokehParticle = ({index, seed}: {index: number; seed: string}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const x = random(`${seed}-x-${index}`) * width;
  const baseY = random(`${seed}-y-${index}`) * height;
  const size = random(`${seed}-size-${index}`) * 60 + 20;
  const speed = random(`${seed}-speed-${index}`) * 0.5 + 0.2;
  const hue = random(`${seed}-hue-${index}`) > 0.5 ? 320 : 200; // Pink or cyan

  const y = (baseY + frame * speed) % (height + 100) - 50;
  const opacity = interpolate(
    Math.sin(frame / 20 + index),
    [-1, 1],
    [0.1, 0.4]
  );
  const blur = random(`${seed}-blur-${index}`) * 10 + 5;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, hsla(${hue}, 100%, 60%, ${opacity}) 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

const BokehField = ({count = 30}: {count?: number}) => {
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {Array.from({length: count}).map((_, i) => (
        <BokehParticle key={i} index={i} seed="bokeh" />
      ))}
    </div>
  );
};

// ============================================
// PARALLAX BACKGROUND LAYERS
// ============================================
const ParallaxLayer = ({
  depth,
  children,
}: {
  depth: number;
  children: React.ReactNode;
}) => {
  const frame = useCurrentFrame();

  const x = Math.sin(frame / 60) * 20 * depth;
  const y = Math.cos(frame / 80) * 15 * depth;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// CRT SCREEN EFFECTS
// ============================================
const CRTEffect = () => {
  const frame = useCurrentFrame();

  // Scanline position (scrolling down)
  const scanlineY = (frame * 3) % 100;

  // Random flicker
  const flicker = random(`flicker-${Math.floor(frame / 2)}`) > 0.97 ? 0.9 : 1;

  return (
    <>
      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(0, 0, 0, 0.15) 2px,
            rgba(0, 0, 0, 0.15) 4px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Moving scan bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${scanlineY}%`,
          height: 4,
          background: 'linear-gradient(transparent, rgba(255,255,255,0.03), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Screen flicker overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(0,0,0,${1 - flicker})`,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,20,0.8) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* CRT curve effect (subtle) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 40,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

// ============================================
// GLITCH TEXT EFFECT
// ============================================
const GlitchText = ({
  children,
  intensity = 1,
}: {
  children: React.ReactNode;
  intensity?: number;
}) => {
  const frame = useCurrentFrame();

  const glitchActive = frame % 8 === 0 || frame % 13 === 0;
  const offsetX = glitchActive ? (random(`gx-${frame}`) - 0.5) * 10 * intensity : 0;
  const offsetY = glitchActive ? (random(`gy-${frame}`) - 0.5) * 5 * intensity : 0;

  return (
    <div style={{position: 'relative'}}>
      {/* Cyan ghost */}
      <div
        style={{
          position: 'absolute',
          color: 'cyan',
          transform: `translate(${-2 * intensity + offsetX}px, ${offsetY}px)`,
          opacity: 0.7,
          mixBlendMode: 'screen',
        }}
      >
        {children}
      </div>
      {/* Magenta ghost */}
      <div
        style={{
          position: 'absolute',
          color: 'magenta',
          transform: `translate(${2 * intensity - offsetX}px, ${-offsetY}px)`,
          opacity: 0.7,
          mixBlendMode: 'screen',
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
// 3D MESSAGE BUBBLE
// ============================================
const MessageBubble3D = ({
  message,
  index,
}: {
  message: typeof messages[0];
  index: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Epic 3D entrance
  const entrance = spring({
    frame,
    fps,
    config: {damping: 12, stiffness: 100, mass: 0.8},
  });

  // Fly in from the side with rotation
  const isLeft = message.sender === 'cat';
  const startX = isLeft ? -800 : 800;
  const startRotateY = isLeft ? -60 : 60;
  const startRotateX = 30;
  const startZ = -500;

  const x = interpolate(entrance, [0, 1], [startX, 0]);
  const rotateY = interpolate(entrance, [0, 1], [startRotateY, 0]);
  const rotateX = interpolate(entrance, [0, 1], [startRotateX, 0]);
  const z = interpolate(entrance, [0, 1], [startZ, 0]);
  const opacity = interpolate(entrance, [0, 0.3, 1], [0, 1, 1]);

  // Subtle floating animation
  const floatY = Math.sin(frame / 20 + index) * 5;
  const floatRotate = Math.sin(frame / 30 + index) * 2;

  // Colors
  const isCat = message.sender === 'cat';
  const bgColor = isCat
    ? 'linear-gradient(135deg, rgba(200, 50, 180, 0.9), rgba(100, 20, 150, 0.9))'
    : 'linear-gradient(135deg, rgba(20, 150, 200, 0.9), rgba(10, 80, 150, 0.9))';
  const glowColor = isCat ? 'rgba(255, 50, 200, 0.5)' : 'rgba(50, 200, 255, 0.5)';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isCat ? 'flex-start' : 'flex-end',
        marginBottom: 20,
        perspective: 1000,
        // FIX: give each message a consistent height so scrolling steps are predictable
        minHeight: 140,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '16px 24px',
          borderRadius: 20,
          background: bgColor,
          boxShadow: `0 0 30px ${glowColor}, 0 10px 40px rgba(0,0,0,0.5)`,
          transform: `
            translateX(${x}px)
            translateY(${floatY}px)
            translateZ(${z}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY + floatRotate}deg)
          `,
          transformStyle: 'preserve-3d',
          opacity,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: isCat
                ? 'linear-gradient(135deg, #ff6b9d, #c44569)'
                : 'linear-gradient(135deg, #4facfe, #00f2fe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: `0 0 15px ${glowColor}`,
            }}
          >
            {isCat ? '🐱' : '👨'}
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {isCat ? 'Teo' : 'Stefan'}
          </span>
        </div>

        {/* Message text with glitch */}
        <GlitchText intensity={0.5}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: 'white',
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {message.text}
          </div>
        </GlitchText>

        {/* Emoji reaction */}
        {message.emoji && (
          <div
            style={{
              position: 'absolute',
              right: -10,
              bottom: -10,
              fontSize: 28,
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
              animation: 'bounce 0.5s ease-out',
            }}
          >
            {message.emoji}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// NEON GRID FLOOR
// ============================================
const NeonGrid = () => {
  const frame = useCurrentFrame();
  const scrollZ = frame * 2;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '-50%',
        right: '-50%',
        height: '40%',
        transform: 'perspective(500px) rotateX(60deg)',
        transformOrigin: 'bottom',
        background: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 49px,
            rgba(255, 50, 200, 0.3) 49px,
            rgba(255, 50, 200, 0.3) 51px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent ${49 - (scrollZ % 50)}px,
            rgba(50, 200, 255, 0.3) ${49 - (scrollZ % 50)}px,
            rgba(50, 200, 255, 0.3) ${51 - (scrollZ % 50)}px
          )
        `,
        opacity: 0.6,
      }}
    />
  );
};

// ============================================
// TITLE SEQUENCE
// ============================================
const TitleSequence = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleEntrance = spring({
    frame,
    fps,
    config: {damping: 10, stiffness: 80},
  });

  const scale = interpolate(titleEntrance, [0, 1], [3, 1]);
  const opacity = interpolate(titleEntrance, [0, 0.5, 1], [0, 1, 1]);
  const blur = interpolate(titleEntrance, [0, 1], [20, 0]);

  const subtitleEntrance = spring({
    frame: frame - 20,
    fps,
    config: {damping: 15, stiffness: 100},
  });

  const subtitleOpacity = interpolate(subtitleEntrance, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <div style={{textAlign: 'center'}}>
        <GlitchText intensity={2}>
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: 10,
              transform: `scale(${scale})`,
              opacity,
              filter: `blur(${blur}px)`,
              textShadow: `
                0 0 20px rgba(255, 50, 200, 0.8),
                0 0 40px rgba(255, 50, 200, 0.6),
                0 0 80px rgba(255, 50, 200, 0.4)
              `,
            }}
          >
            Git Rebase
          </div>
        </GlitchText>
        <div
          style={{
            fontSize: 36,
            color: 'cyan',
            marginTop: 20,
            opacity: subtitleOpacity,
            textShadow: '0 0 20px cyan',
            fontFamily: 'monospace',
          }}
        >
          explained by a cat 🐱
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// ZOOM PULSE EFFECT
// ============================================
const useZoomPulse = (triggerFrames: number[]) => {
  const frame = useCurrentFrame();

  let scale = 1;
  for (const trigger of triggerFrames) {
    if (frame >= trigger && frame < trigger + 15) {
      const progress = (frame - trigger) / 15;
      const pulse = Math.sin(progress * Math.PI) * 0.05;
      scale += pulse;
    }
  }

  return scale;
};

// ============================================
// MAIN COMPOSITION
// ============================================
export const CyberpunkCatChat = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const titleDuration = 90; // 3 seconds
  const framesPerMessage = 70;

  // Zoom pulse on certain messages
  const zoomScale = useZoomPulse([titleDuration + 6 * framesPerMessage]); // "my CAT knows git?!"

  // Global camera movement
  const cameraX = Math.sin(frame / 100) * 10;
  const cameraY = Math.cos(frame / 120) * 8;

  // Show title sequence
  const showTitle = frame < titleDuration;
  const titleOpacity = interpolate(
    frame,
    [titleDuration - 30, titleDuration],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  // Messages visibility
  const chatStartFrame = titleDuration;

  // SCROLLING LOGIC
  // Each message is given a fixed minHeight in MessageBubble3D (140px)
  const messageHeight = 140;
  const visibleCount = 5; // how many messages should remain visible before scrolling
  const elapsedSinceChatStart = Math.max(0, frame - chatStartFrame);
  const currentIndex = Math.min(messages.length - 1, Math.floor(elapsedSinceChatStart / framesPerMessage));
  // when currentIndex exceeds visibleCount - 1, start scrolling
  const scrollIndex = Math.max(0, currentIndex - (visibleCount - 1));

  // trigger frame when the scroll step should start animating
  const scrollTriggerFrame = chatStartFrame + (scrollIndex + (visibleCount - 1)) * framesPerMessage;
  const scrollProgress = interpolate(
    frame,
    [scrollTriggerFrame, scrollTriggerFrame + 8],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const translateY = -(scrollIndex * messageHeight + scrollProgress * messageHeight);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0015',
        transform: `translate(${cameraX}px, ${cameraY}px) scale(${zoomScale})`,
        overflow: 'hidden',
      }}
    >
      {/* Deep background - slowest parallax */}
      <ParallaxLayer depth={0.3}>
        <div
          style={{
            position: 'absolute',
            inset: -100,
            background: 'radial-gradient(ellipse at 30% 20%, #1a0030 0%, #0a0015 50%, #050008 100%)',
          }}
        />
      </ParallaxLayer>

      {/* Neon grid floor */}
      <ParallaxLayer depth={0.5}>
        <NeonGrid />
      </ParallaxLayer>

      {/* Bokeh particles - medium parallax */}
      <ParallaxLayer depth={0.7}>
        <BokehField count={25} />
      </ParallaxLayer>

      {/* Title sequence */}
      {showTitle && (
        <div style={{opacity: titleOpacity}}>
          <TitleSequence />
        </div>
      )}

      {/* Chat messages - foreground */}
      <ParallaxLayer depth={1}>
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            perspective: 1500,
          }}
        >
          {/* Phone frame effect */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 30,
              border: '2px solid rgba(255, 50, 200, 0.3)',
              boxShadow: '0 0 50px rgba(255, 50, 200, 0.2), inset 0 0 30px rgba(0,0,0,0.5)',
              padding: 30,
              maxHeight: '100%',
              overflow: 'hidden', // keep overflow hidden for video; we animate translateY instead
            }}
          >
            {/* Chat header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                marginBottom: 30,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b9d, #c44569)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: '0 0 20px rgba(255, 50, 200, 0.5)',
                }}
              >
                🐱
              </div>
              <div>
                <GlitchText intensity={0.3}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    Teo
                  </div>
                </GlitchText>
                <div style={{fontSize: 14, color: 'rgba(255,255,255,0.5)'}}>
                  online • senior git consultant
                </div>
              </div>
            </div>

            {/* Messages - wrap in a container we translate for auto-scrolling */}
            <div
              style={{
                position: 'relative',
                // translate the whole list up as new messages appear
                transform: `translateY(${translateY}px)`,
                transition: 'transform 0s', // remotion animation uses frame-based interpolation; keep no CSS transition
              }}
            >
              {messages.map((message, index) => {
                const messageStart = chatStartFrame + index * framesPerMessage;
                if (frame < messageStart) return null;

                return (
                  <Sequence key={message.id} from={messageStart} layout="none">
                    <MessageBubble3D message={message} index={index} />
                  </Sequence>
                );
              })}
            </div>
          </div>
        </div>
      </ParallaxLayer>

      {/* CRT effects on top */}
      <CRTEffect />

      {/* Timestamp */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 40,
          fontFamily: 'monospace',
          fontSize: 14,
          color: 'rgba(255, 50, 200, 0.6)',
          textShadow: '0 0 10px rgba(255, 50, 200, 0.5)',
        }}
      >
        {Math.floor(frame / fps)}:{String(Math.floor((frame % fps) / fps * 60)).padStart(2, '0')}s
      </div>

      {/* Made with Remotion */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 40,
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'rgba(50, 200, 255, 0.5)',
        }}
      >
        Made with Remotion 🎬
      </div>
    </AbsoluteFill>
  );
};
