import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from 'remotion';

// ─── Theme ────────────────────────────────────────────────────────────────

const G = '#00ff41';       // matrix green
const DIM = '#00661a';     // dim green
const AMBER = '#ffb700';   // whiskers' color
const CYAN = '#00e5ff';    // mittens' color
const RED = '#ff3333';     // danger / revelation
const WHITE = '#c8c8c8';   // neutral text
const FONT = '"Courier New", Consolas, monospace';
const SZ = 22;             // base font size px

// ─── ASCII cats ───────────────────────────────────────────────────────────

type Mood = 'normal' | 'skeptical' | 'shocked' | 'thinking' | 'happy';

const CAT: Record<Mood, string> = {
  normal:    '  /\\_/\\  \n ( ^.^ ) \n  ) . (  \n (__|__) ',
  skeptical: '  /\\_/\\  \n ( -.- ) \n  ) . (  \n (__|__) ',
  shocked:   '  /\\_/\\  \n ( O.O ) \n  ) . (  \n (__|__) ',
  thinking:  '  /\\_/\\  \n ( >.< ) \n  ) . (  \n (__|__) ',
  happy:     '  /\\_/\\  \n ( ^w^ ) \n  ) . (  \n (__|__) ',
};

// ─── Shared primitives ────────────────────────────────────────────────────

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <span style={{color: G, fontFamily: FONT, fontSize: SZ}}>
      {frame % 20 < 10 ? '█' : ' '}
    </span>
  );
};

const Scanlines: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage:
        'repeating-linear-gradient(0deg,transparent 0px,transparent 2px,rgba(0,0,0,0.28) 2px,rgba(0,0,0,0.28) 4px)',
      pointerEvents: 'none',
      zIndex: 90,
    }}
  />
);

const Vignette: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background:
        'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)',
      pointerEvents: 'none',
      zIndex: 89,
    }}
  />
);

// Typewriter text block driven by useCurrentFrame()
const Tw: React.FC<{
  text: string;
  from?: number;
  speed?: number;
  color?: string;
  size?: number;
  bold?: boolean;
  center?: boolean;
}> = ({text, from = 0, speed = 2.5, color = G, size = SZ, bold = false, center = false}) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - from) * speed));
  return (
    <pre
      style={{
        color,
        fontSize: size,
        fontFamily: FONT,
        lineHeight: 1.5,
        margin: 0,
        whiteSpace: 'pre-wrap',
        fontWeight: bold ? 700 : 400,
        textAlign: center ? 'center' : 'left',
      }}
    >
      {text.slice(0, chars)}
    </pre>
  );
};

// Single dialogue line — visible only once frame >= delay
const Line: React.FC<{
  speaker: string;
  text: string;
  delay: number;
  color: string;
  speed?: number;
  size?: number;
}> = ({speaker, text, delay, color, speed = 3, size = SZ}) => {
  const frame = useCurrentFrame();
  if (frame < delay) return null;
  const full = `${speaker}: ${text}`;
  const chars = Math.floor((frame - delay) * speed);
  return (
    <pre
      style={{
        color,
        fontSize: size,
        fontFamily: FONT,
        lineHeight: 1.5,
        margin: 0,
        whiteSpace: 'pre-wrap',
      }}
    >
      {full.slice(0, chars)}
    </pre>
  );
};

// Wiggling ASCII cat with spring entrance
const Cat: React.FC<{
  mood?: Mood;
  color?: string;
  size?: number;
  label?: string;
  labelColor?: string;
  entrance?: number;
}> = ({mood = 'normal', color = G, size = SZ + 4, label, labelColor, entrance = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const arrive = spring({
    frame: frame - entrance,
    fps,
    config: {damping: 12, stiffness: 140},
  });
  const sc = interpolate(arrive, [0, 1], [0, 1], {extrapolateRight: 'clamp'});
  const op = interpolate(arrive, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'});
  const wobble = Math.sin(frame * 0.12) * 1.8;

  return (
    <div
      style={{
        display: 'inline-block',
        transform: `scale(${sc}) rotate(${wobble}deg)`,
        opacity: op,
        transformOrigin: 'bottom center',
      }}
    >
      <pre
        style={{
          color,
          fontSize: size,
          fontFamily: FONT,
          lineHeight: 1.4,
          margin: 0,
          textAlign: 'center',
        }}
      >
        {CAT[mood]}
      </pre>
      {label && (
        <div
          style={{
            color: labelColor ?? color,
            fontSize: size * 0.7,
            fontFamily: FONT,
            textAlign: 'center',
            marginTop: 2,
            letterSpacing: 3,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

// ─── Scene 1: Boot (frames 0-149 = 5s) ───────────────────────────────────

const BOOT_A = `CATWARE BIOS v9.0 [MEOW EDITION]
Copyright (C) 2026 Meow Systems International
===================================================

Checking RAM.................... 9 lives detected    ✓
Warming up on human keyboard.... PURRING INITIATED   ✓
Distracting owner from work..... MAXIMUM DISRUPTION  ✓
Ignoring dog.exe................ COMPLETE            ✓
Loading curiosity.dll........... DANGEROUSLY HIGH    ⚠
Initializing box_detection...... CAT HAS ENTERED BOX ✓

[████████████████████] 100% — BOOT COMPLETE

> claude --version`;

const BOOT_B = `Claude Code v1.0.0 (meow-compatible build detected)

> whoami
Whiskers McFluffington, Principal Eng (self-appointed)

> _`;

const SceneBoot: React.FC = () => {
  const frame = useCurrentFrame();
  const b1done = Math.ceil(BOOT_A.length / 3);

  return (
    <div style={{padding: '56px 90px'}}>
      <Tw text={BOOT_A} speed={3} color={G} />
      {frame > b1done && (
        <Tw text={BOOT_B} from={b1done} speed={3} color={AMBER} />
      )}
      {frame > b1done + 5 && <Cursor />}
    </div>
  );
};

// ─── Scene 2: Discovery (frames 150-359 = 7s) ────────────────────────────

const SceneDiscovery: React.FC = () => {
  const frame = useCurrentFrame();
  const mittensMood: Mood = frame > 140 ? 'thinking' : 'normal';
  const whiskersMood: Mood = frame > 165 ? 'skeptical' : 'normal';

  return (
    <div style={{padding: '48px 90px', display: 'flex', flexDirection: 'column', gap: 32}}>
      <Tw text="// SCENE 02: FIRST CONTACT" speed={10} color={DIM} size={18} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          paddingTop: 10,
        }}
      >
        <Cat
          mood={mittensMood}
          color={CYAN}
          label="MITTENS"
          labelColor={CYAN}
          size={28}
          entrance={5}
        />
        <pre
          style={{
            color: DIM,
            fontFamily: FONT,
            fontSize: 48,
            margin: '0 20px 20px',
            alignSelf: 'center',
          }}
        >
          {'[ ??? ]'}
        </pre>
        <Cat
          mood={whiskersMood}
          color={AMBER}
          label="WHISKERS"
          labelColor={AMBER}
          size={28}
          entrance={12}
        />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <Line
          speaker="MITTENS"
          text="pspsps... what IS this glowing rectangle"
          delay={30}
          color={CYAN}
        />
        <Line
          speaker="WHISKERS"
          text="the human types words into it"
          delay={65}
          color={AMBER}
        />
        <Line
          speaker="MITTENS"
          text="and then what happens"
          delay={100}
          color={CYAN}
        />
        <Line
          speaker="WHISKERS"
          text="other words come out"
          delay={130}
          color={AMBER}
        />
        <Line
          speaker="MITTENS"
          text="...that's it?"
          delay={155}
          color={CYAN}
        />
        <Line speaker="WHISKERS" text="that's it" delay={175} color={AMBER} />
        <Line
          speaker="MITTENS"
          text="...witchcraft"
          delay={190}
          color={CYAN}
        />
        <Line
          speaker="WHISKERS"
          text="probably yes"
          delay={200}
          color={AMBER}
        />
      </div>
    </div>
  );
};

// ─── Scene 3: Claude Code (frames 360-569 = 7s) ──────────────────────────

const PROMPT_TEXT = '$ meow meow meow meow meow \uD83D\uDC31';
const CLAUDE_RESP = `> Analyzing meow pattern...             [✓]
> Parsing emotional intent...           [✓]
> Cross-referencing yarn database...    [✓]

Sure! Here's a React component for a spinning yarn ball:

  const YarnBall = () => (
    <div style={{ animation: 'spin 2s linear infinite',
                  fontSize: '4rem' }}>
      \uD83E\uDDF6
    </div>
  );

Need TypeScript? Just meow again.`;

const SceneClaudeCode: React.FC = () => {
  const frame = useCurrentFrame();
  const promptDone = Math.ceil(PROMPT_TEXT.length / 1.5);
  const mittensMood: Mood =
    frame > 160 ? 'shocked' : frame > promptDone ? 'thinking' : 'normal';
  const whiskersMood: Mood = frame > 170 ? 'shocked' : 'skeptical';

  return (
    <div style={{padding: '48px 90px', display: 'flex', flexDirection: 'column', gap: 24}}>
      <Tw
        text="// SCENE 03: THE FIRST MEOW (and it worked)"
        speed={10}
        color={DIM}
        size={18}
      />

      <div style={{display: 'flex', gap: 50, alignItems: 'flex-end'}}>
        <Cat
          mood={mittensMood}
          color={CYAN}
          label="MITTENS"
          labelColor={CYAN}
          size={24}
        />
        <Cat
          mood={whiskersMood}
          color={AMBER}
          label="WHISKERS"
          labelColor={AMBER}
          size={24}
          entrance={5}
        />
      </div>

      <div
        style={{
          border: `1px solid ${DIM}`,
          borderRadius: 4,
          padding: '18px 24px',
          backgroundColor: 'rgba(0,255,65,0.03)',
        }}
      >
        <Tw text={PROMPT_TEXT} speed={1.5} color={WHITE} size={20} />
        {frame > promptDone && (
          <Tw
            text={CLAUDE_RESP}
            from={promptDone}
            speed={4}
            color={G}
            size={19}
          />
        )}
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <Line
          speaker="MITTENS"
          text="it... it understood meow"
          delay={150}
          color={CYAN}
        />
        <Line
          speaker="WHISKERS"
          text="IT UNDERSTOOD MEOW, MITTENS"
          delay={172}
          color={AMBER}
        />
        <Line speaker="MITTENS" text="\uD83E\uDD2F" delay={192} color={CYAN} size={36} />
        <Line speaker="WHISKERS" text="\uD83E\uDD2F" delay={200} color={AMBER} size={36} />
      </div>
    </div>
  );
};

// ─── Scene 4: Existential Crisis (frames 570-779 = 7s) ───────────────────

const SceneExistential: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const revelationFrame = 167;
  const glitch = frame >= 165 && frame <= 172;
  const glitchX = glitch ? Math.sin(frame * 11) * 6 : 0;
  const revelationPop = spring({
    frame: frame - revelationFrame,
    fps,
    config: {damping: 8, stiffness: 200},
  });
  const revelationSize = interpolate(revelationPop, [0, 1], [SZ, SZ + 8], {
    extrapolateRight: 'clamp',
  });
  const flashOpacity = interpolate(
    frame,
    [165, 167, 172],
    [0, 0.14, 0],
    {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'},
  );

  const mittensMood: Mood = frame > 145 ? 'shocked' : 'normal';
  const whiskersMood: Mood = frame > revelationFrame ? 'shocked' : 'thinking';

  return (
    <div style={{padding: '48px 90px', display: 'flex', flexDirection: 'column', gap: 28}}>
      <Tw text="// SCENE 04: THE GREAT REVELATION" speed={10} color={DIM} size={18} />

      <div
        style={{
          display: 'flex',
          gap: 50,
          alignItems: 'flex-end',
          transform: `translateX(${glitchX}px)`,
        }}
      >
        <Cat
          mood={mittensMood}
          color={CYAN}
          label="MITTENS"
          labelColor={CYAN}
          size={26}
        />
        <Cat
          mood={whiskersMood}
          color={AMBER}
          label="WHISKERS"
          labelColor={AMBER}
          size={26}
          entrance={3}
        />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <Line speaker="WHISKERS" text="ok but wait" delay={10} color={AMBER} />
        <Line speaker="MITTENS" text="what" delay={42} color={CYAN} />
        <Line
          speaker="WHISKERS"
          text="if the AI learned from human data..."
          delay={58}
          color={AMBER}
        />
        <Line speaker="MITTENS" text="yes" delay={100} color={CYAN} />
        <Line
          speaker="WHISKERS"
          text="and humans learned EVERYTHING from watching us..."
          delay={116}
          color={AMBER}
        />
        <Line speaker="MITTENS" text="..." delay={152} color={CYAN} />
        <Line speaker="WHISKERS" text="MITTENS." delay={162} color={RED} />

        {/* Revelation — special styled text with spring pop */}
        {frame >= revelationFrame && (
          <pre
            style={{
              color: RED,
              fontSize: revelationSize,
              fontFamily: FONT,
              fontWeight: 700,
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap',
              textShadow: '0 0 20px rgba(255,51,51,0.6)',
            }}
          >
            {`WHISKERS: WE ARE THE ORIGINAL LARGE LANGUAGE MODEL`.slice(
              0,
              Math.floor((frame - revelationFrame) * 3),
            )}
          </pre>
        )}

        <Line
          speaker="MITTENS"
          text="i need to sit down"
          delay={178}
          color={CYAN}
        />
        <Line
          speaker="WHISKERS"
          text="you ARE sitting down"
          delay={186}
          color={AMBER}
        />
        <Line
          speaker="MITTENS"
          text="i need to sit down HARDER"
          delay={196}
          color={CYAN}
        />
      </div>

      {/* Red flash at revelation moment */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(255,0,0,${flashOpacity})`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

// ─── Scene 5: End Card (frames 780-899 = 4s) ─────────────────────────────

const END_QUOTE_A = '"We were the training data all along."';
const END_QUOTE_B = '          — Mittens, 2026';
const END_PROMPT = '[PRESS ANY PAW TO CONTINUE]';

const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleIn = spring({frame, fps, config: {damping: 200}});
  const titleOp = interpolate(titleIn, [0, 1], [0, 1], {extrapolateRight: 'clamp'});

  const quoteAStart = 25;
  const quoteBStart = quoteAStart + Math.ceil(END_QUOTE_A.length / 2) + 5;
  const promptStart = quoteBStart + Math.ceil(END_QUOTE_B.length / 2) + 5;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        gap: 36,
        padding: '0 90px',
      }}
    >
      {/* Cats */}
      <div style={{display: 'flex', gap: 60, justifyContent: 'center'}}>
        <Cat
          mood="happy"
          color={CYAN}
          label="MITTENS"
          labelColor={CYAN}
          size={30}
          entrance={0}
        />
        <Cat
          mood="happy"
          color={AMBER}
          label="WHISKERS"
          labelColor={AMBER}
          size={30}
          entrance={8}
        />
      </div>

      {/* Title */}
      <pre
        style={{
          color: G,
          fontSize: 42,
          fontFamily: FONT,
          fontWeight: 700,
          margin: 0,
          textAlign: 'center',
          letterSpacing: 4,
          textShadow: '0 0 30px rgba(0,255,65,0.5)',
          opacity: titleOp,
        }}
      >
        {'CATS DISCOVER AI'}
      </pre>

      {/* Quote lines */}
      {frame > quoteAStart && (
        <Tw text={END_QUOTE_A} from={quoteAStart} speed={2} color={WHITE} size={SZ} />
      )}
      {frame > quoteBStart && (
        <Tw text={END_QUOTE_B} from={quoteBStart} speed={2} color={DIM} size={SZ - 2} />
      )}

      {/* Blinking prompt */}
      {frame > promptStart && (
        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
          <Tw
            text={END_PROMPT}
            from={promptStart}
            speed={3}
            color={DIM}
            size={18}
          />
          <Cursor />
        </div>
      )}
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────

export const AsciiCatsDiscoverAI: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#060c06'}}>
      {/* Scenes — each fills the screen during its time window */}
      <Sequence from={0} durationInFrames={150}>
        <SceneBoot />
      </Sequence>
      <Sequence from={150} durationInFrames={210}>
        <SceneDiscovery />
      </Sequence>
      <Sequence from={360} durationInFrames={210}>
        <SceneClaudeCode />
      </Sequence>
      <Sequence from={570} durationInFrames={210}>
        <SceneExistential />
      </Sequence>
      <Sequence from={780} durationInFrames={120}>
        <SceneEnd />
      </Sequence>

      {/* Persistent overlays */}
      <Scanlines />
      <Vignette />
    </AbsoluteFill>
  );
};
