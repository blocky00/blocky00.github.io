import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

/**
 * EVOLVING MOTION RULES
 *
 * This video demonstrates how motion character transforms over time:
 *
 * PHASE 1 (0-4s): RIGID / MECHANICAL
 * - Linear interpolation (no easing)
 * - Instant direction changes
 * - Constant velocity
 * - Like a machine or robot
 *
 * PHASE 2 (4-8s): TRANSITIONAL
 * - Easing functions introduced
 * - Slight overshoot appears
 * - Velocity varies (ease-in-out)
 * - Starting to feel organic
 *
 * PHASE 3 (8-12s): FLUID / EXPRESSIVE
 * - Spring physics simulation
 * - Natural overshoot and settle
 * - Momentum and weight
 * - Like a living thing
 */

// Helper to get the current motion phase (0-2)
const getPhase = (frame: number, fps: number): number => {
  const second = frame / fps;
  if (second < 4) return 0;      // Rigid
  if (second < 8) return 1;      // Transitional
  return 2;                       // Fluid
};

// Helper to blend between phases smoothly
const getPhaseProgress = (frame: number, fps: number): number => {
  const second = frame / fps;
  if (second < 4) return 0;
  if (second < 8) return (second - 4) / 4;  // 0 to 1 during transition
  return 1;
};

export const EvolvingMotion = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const phase = getPhase(frame, fps);
  const phaseProgress = getPhaseProgress(frame, fps);

  // ============================================
  // MOTION CALCULATION - The Heart of Evolution
  // ============================================

  /**
   * PHASE 0: RIGID MOTION
   *
   * Uses linear interpolation with no easing.
   * The object moves at constant speed and changes
   * direction instantly - like a pen plotter or CNC machine.
   */
  const rigidX = interpolate(
    frame % (fps * 2),           // Cycle every 2 seconds
    [0, fps, fps * 2],           // Keyframes
    [0, 300, 0],                 // Positions
    {extrapolateRight: 'clamp'} // No easing = LINEAR motion
  );

  const rigidY = interpolate(
    frame % (fps * 2),
    [0, fps / 2, fps, fps * 1.5, fps * 2],
    [0, -100, 0, -100, 0],
    {extrapolateRight: 'clamp'}
  );

  /**
   * PHASE 1: TRANSITIONAL MOTION
   *
   * Introduces easing functions (ease-in-out).
   * The object now accelerates and decelerates,
   * creating a smoother, more natural feel.
   */
  const easedX = interpolate(
    frame % (fps * 2),
    [0, fps, fps * 2],
    [0, 300, 0],
    {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),  // Smooth acceleration/deceleration
    }
  );

  const easedY = interpolate(
    frame % (fps * 2),
    [0, fps / 2, fps, fps * 1.5, fps * 2],
    [0, -120, 0, -120, 0],
    {
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    }
  );

  /**
   * PHASE 2: FLUID / SPRING MOTION
   *
   * Uses spring physics simulation.
   * The object has mass, momentum, and elasticity.
   * It overshoots targets and settles naturally,
   * like a ball on a spring or a living creature.
   */
  const cycleFrame = frame % (fps * 2);
  const isSecondHalf = cycleFrame >= fps;

  const springX = spring({
    frame: isSecondHalf ? cycleFrame - fps : cycleFrame,
    fps,
    config: {
      damping: 12,      // Low damping = more bounce
      stiffness: 100,   // How snappy the spring is
      mass: 0.8,        // Weight of the object
    },
  }) * (isSecondHalf ? -300 : 300) + (isSecondHalf ? 300 : 0);

  const springY = spring({
    frame: cycleFrame % (fps / 2),
    fps,
    config: {
      damping: 8,       // Even bouncier vertically
      stiffness: 150,
      mass: 0.5,
    },
  }) * -140;

  // ============================================
  // BLEND POSITIONS BASED ON PHASE
  // ============================================

  /**
   * Smoothly interpolate between motion styles
   * as we transition from one phase to the next.
   */
  let x: number;
  let y: number;

  if (phase === 0) {
    // Pure rigid motion
    x = rigidX;
    y = rigidY;
  } else if (phase === 1) {
    // Blend from rigid to eased
    x = interpolate(phaseProgress, [0, 1], [rigidX, easedX]);
    y = interpolate(phaseProgress, [0, 1], [rigidY, easedY]);
  } else {
    // Blend from eased to spring (fluid)
    const fluidProgress = interpolate(
      frame / fps,
      [8, 10],
      [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    );
    x = interpolate(fluidProgress, [0, 1], [easedX, springX]);
    y = interpolate(fluidProgress, [0, 1], [easedY, springY]);
  }

  // ============================================
  // VISUAL STYLING - Reflects Motion Character
  // ============================================

  /**
   * The shape itself evolves to reflect the motion:
   * - Rigid: Sharp square corners
   * - Transitional: Rounded corners
   * - Fluid: Perfect circle
   */
  const borderRadius = interpolate(
    phaseProgress + (phase === 2 ? 1 : 0),
    [0, 1, 2],
    [8, 25, 50],        // Square → Rounded → Circle
    {extrapolateRight: 'clamp'}
  );

  /**
   * Color shifts from cold mechanical blue
   * to warm organic orange.
   */
  const hue = interpolate(
    phaseProgress + (phase === 2 ? 1 : 0),
    [0, 2],
    [210, 30],          // Blue → Orange
    {extrapolateRight: 'clamp'}
  );

  // Phase labels
  const phaseLabels = ['RIGID', 'TRANSITIONAL', 'FLUID'];
  const phaseDescriptions = [
    'Linear • Constant velocity • Instant changes',
    'Eased • Acceleration curves • Smoother flow',
    'Spring physics • Overshoot • Natural settle',
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Motion path visualization */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 200,
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: 8,
        }}
      />

      {/* The evolving shape */}
      <div
        style={{
          width: 80,
          height: 80,
          backgroundColor: `hsl(${hue}, 70%, 55%)`,
          borderRadius: `${borderRadius}%`,
          transform: `translate(${x - 150}px, ${y}px)`,
          boxShadow: `0 0 ${20 + phaseProgress * 20}px hsla(${hue}, 70%, 55%, 0.5)`,
        }}
      />

      {/* Phase indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          textAlign: 'center',
          fontFamily: 'SF Mono, monospace',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: `hsl(${hue}, 70%, 65%)`,
            letterSpacing: 8,
          }}
        >
          {phaseLabels[phase]}
        </div>
        <div
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 12,
          }}
        >
          {phaseDescriptions[phase]}
        </div>
      </div>

      {/* Timeline */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          width: 600,
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${(frame / (fps * 12)) * 100}%`,
            height: '100%',
            backgroundColor: `hsl(${hue}, 70%, 55%)`,
            borderRadius: 2,
          }}
        />
        {/* Phase markers */}
        {[0, 4, 8].map((second) => (
          <div
            key={second}
            style={{
              position: 'absolute',
              left: `${(second / 12) * 100}%`,
              top: -8,
              width: 2,
              height: 20,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
