import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from 'remotion';

type Message = {
  id: number;
  text: string;
  sender: 'faust' | 'mephisto';
  time: string;
  isQuote?: boolean;
  quoteText?: string;
};

const messages: Message[] = [
  {
    id: 1,
    text: 'Faust, mein Freund! Wozu noch Code verstehen? Lass die KI für dich denken. 🔥',
    sender: 'mephisto',
    time: '23:01',
  },
  {
    id: 2,
    text: 'Ich hab zwei Seelen in meiner Brust... eine will verstehen, die andere will shippen.',
    sender: 'faust',
    time: '23:02',
  },
  {
    id: 3,
    text: 'Vibe Coding, Faust! Du tippst den Prompt, die Maschine liefert. Du bist der Architekt!',
    sender: 'mephisto',
    time: '23:02',
  },
  {
    id: 4,
    text: 'Aber bin ich wirklich der Architekt, wenn ich den Bauplan nicht verstehe?',
    sender: 'faust',
    time: '23:03',
  },
  {
    id: 5,
    text: 'Verstehen ist überbewertet. Dein LinkedIn sagt "Senior Engineer" — das reicht doch! 😈',
    sender: 'mephisto',
    time: '23:03',
  },
  {
    id: 6,
    text: 'Da steh ich nun, ich armer Tor! Und bin so klug als wie zuvor... nur mit mehr GitHub Stars. ⭐',
    sender: 'faust',
    time: '23:04',
  },
  {
    id: 7,
    text: 'Siehst du? Dein Ego wächst, dein Stack auch. Was willst du mehr?',
    sender: 'mephisto',
    time: '23:04',
  },
  {
    id: 8,
    text: 'Wissen, Mephisto. Echtes Wissen. Nicht nur die Illusion davon.',
    sender: 'faust',
    time: '23:05',
  },
  {
    id: 9,
    text: 'Wissen?? In der Zeit hättest du drei Microservices deployen können! 🚀',
    sender: 'mephisto',
    time: '23:06',
  },
  {
    id: 10,
    text: 'Und wenn sie brennen? Wer debuggt den Code, den niemand versteht?',
    sender: 'faust',
    time: '23:07',
  },
  {
    id: 11,
    text: 'Dann promptest du einfach: "Fix the bug." Problem gelöst. ✨',
    sender: 'mephisto',
    time: '23:07',
  },
  {
    id: 12,
    text: 'Das ist der Teufelspakt, Mephisto. Bequemlichkeit gegen Kompetenz.',
    sender: 'faust',
    time: '23:08',
  },
  {
    id: 13,
    text: 'Ich bin der Geist, der stets verneint — außer bei Pull Requests. Da approve ich alles. 👍',
    sender: 'mephisto',
    time: '23:09',
  },
  {
    id: 14,
    text: '"Verweile doch, du bist so schön" — sagte niemand jemals über Spaghetti Code.',
    sender: 'faust',
    time: '23:10',
    isQuote: true,
    quoteText: 'Goethe, Faust I',
  },
];

const FRAMES_PER_MESSAGE = 60;

const TypingIndicator = ({visible}: {visible: boolean}) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  const dot1 = interpolate(frame % 30, [0, 15, 30], [0.3, 1, 0.3], {
    extrapolateRight: 'clamp',
  });
  const dot2 = interpolate((frame + 10) % 30, [0, 15, 30], [0.3, 1, 0.3], {
    extrapolateRight: 'clamp',
  });
  const dot3 = interpolate((frame + 20) % 30, [0, 15, 30], [0.3, 1, 0.3], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          padding: '18px 24px',
          borderRadius: 20,
          borderBottomLeftRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.9)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {[dot1, dot2, dot3].map((opacity, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: '#8E8E93',
              opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  delay,
}: {
  message: Message;
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {damping: 15, stiffness: 150},
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(entrance, [0, 1], [30, 0], {
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const isFaust = message.sender === 'faust';

  const bubbleColor = isFaust ? '#DCF8C6' : '#FFFFFF';
  const senderLabel = isFaust ? null : 'Mephistopheles';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isFaust ? 'flex-end' : 'flex-start',
        marginBottom: 14,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          padding: '14px 20px',
          paddingBottom: 10,
          borderRadius: 20,
          borderBottomRightRadius: isFaust ? 4 : 20,
          borderBottomLeftRadius: isFaust ? 20 : 4,
          backgroundColor: bubbleColor,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {senderLabel && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#E53935',
              marginBottom: 4,
              fontFamily:
                'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {senderLabel}
          </div>
        )}
        {message.isQuote && message.quoteText && (
          <div
            style={{
              borderLeft: '4px solid #128C7E',
              paddingLeft: 12,
              marginBottom: 8,
              fontSize: 22,
              color: '#8E8E93',
              fontStyle: 'italic',
              fontFamily:
                'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {message.quoteText}
          </div>
        )}
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.45,
            color: '#303030',
            fontFamily:
              'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {message.text}
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#8E8E93',
            textAlign: 'right',
            marginTop: 4,
            fontFamily:
              'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {message.time}
          {isFaust && (
            <span style={{marginLeft: 8, color: '#34B7F1'}}>✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

const WhatsAppHeader = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const onlineFlicker = interpolate(
    frame % (4 * fps),
    [0, 2 * fps, 2.1 * fps, 4 * fps],
    [1, 1, 0.5, 1],
    {extrapolateRight: 'clamp'},
  );

  return (
    <div
      style={{
        backgroundColor: '#075E54',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* Back arrow */}
      <div
        style={{
          fontSize: 36,
          color: 'white',
          marginRight: 4,
        }}
      >
        ←
      </div>

      {/* Mephisto avatar */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #B71C1C 0%, #E53935 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(183,28,28,0.4)',
        }}
      >
        M
      </div>

      <div style={{flex: 1}}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: 'white',
            fontFamily:
              'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Mephistopheles
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.7)',
            fontFamily:
              'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
            opacity: onlineFlicker,
          }}
        >
          online
        </div>
      </div>

      {/* Header icons */}
      <div style={{display: 'flex', gap: 28}}>
        <div style={{fontSize: 30, color: 'rgba(255,255,255,0.8)'}}>📹</div>
        <div style={{fontSize: 30, color: 'rgba(255,255,255,0.8)'}}>📞</div>
        <div style={{fontSize: 30, color: 'rgba(255,255,255,0.8)'}}>⋮</div>
      </div>
    </div>
  );
};

const BackgroundPattern = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const subtleShift = interpolate(frame, [0, 30 * fps], [0, 10], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(
          ${45 + subtleShift}deg,
          transparent,
          transparent 40px,
          #000 40px,
          #000 41px
        )`,
      }}
    />
  );
};

export const FaustMephistoVibeCoding = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const totalMessages = messages.length;
  const totalMessageFrames = totalMessages * FRAMES_PER_MESSAGE;

  // Scroll progress - start scrolling after a few messages fill the screen
  const scrollStart = 5 * FRAMES_PER_MESSAGE;
  const scrollEnd = totalMessageFrames;
  const maxScroll = totalMessages * 95 - 900;

  const scrollProgress = interpolate(
    frame,
    [scrollStart, scrollEnd],
    [0, -maxScroll],
    {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'},
  );

  // Typing indicator: show briefly before each Mephisto message
  const currentMessageIndex = Math.floor(frame / FRAMES_PER_MESSAGE);
  const frameInCurrentSlot = frame % FRAMES_PER_MESSAGE;
  const nextMessage = messages[currentMessageIndex + 1];
  const showTyping =
    nextMessage?.sender === 'mephisto' &&
    frameInCurrentSlot > FRAMES_PER_MESSAGE - 25 &&
    currentMessageIndex < totalMessages - 1;

  // Subtle ambient glow for atmosphere
  const glowPulse = interpolate(
    frame % (3 * fps),
    [0, 1.5 * fps, 3 * fps],
    [0, 0.15, 0],
    {extrapolateRight: 'clamp'},
  );

  // End card fade
  const endCardStart = totalMessageFrames + 30;
  const endCardOpacity = interpolate(
    frame,
    [endCardStart, endCardStart + fps],
    [0, 1],
    {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'},
  );

  const endCardScale = spring({
    frame: frame - endCardStart,
    fps,
    config: {damping: 200},
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#ECE5DD',
        fontFamily:
          'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <BackgroundPattern />

      {/* Ambient red glow from bottom — Mephisto's presence */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `radial-gradient(ellipse at bottom, rgba(183,28,28,${glowPulse}) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <WhatsAppHeader />

      {/* Date pill */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 12,
            padding: '6px 18px',
            fontSize: 22,
            color: '#8E8E93',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          HEUTE
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          padding: '0 24px',
          paddingTop: 12,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${scrollProgress}px)`,
          }}
        >
          {messages.map((message, index) => (
            <Sequence
              key={message.id}
              from={index * FRAMES_PER_MESSAGE}
              layout="none"
            >
              <MessageBubble message={message} delay={0} />
            </Sequence>
          ))}

          {/* Typing indicator */}
          <Sequence from={0} layout="none">
            <div
              style={{
                transform: `translateY(${scrollProgress > -maxScroll + 100 ? 0 : 20}px)`,
              }}
            >
              <TypingIndicator visible={showTyping} />
            </div>
          </Sequence>
        </div>
      </div>

      {/* End card overlay */}
      {frame >= endCardStart && (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(0,0,0,${endCardOpacity * 0.7})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              transform: `scale(${endCardScale})`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: 'white',
                marginBottom: 16,
                letterSpacing: -0.5,
                textShadow: '0 2px 20px rgba(183,28,28,0.5)',
              }}
            >
              Der Teufelspakt
            </div>
            <div
              style={{
                fontSize: 30,
                color: 'rgba(255,255,255,0.7)',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              Vibe Coding × Ego
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.4)',
                marginTop: 24,
              }}
            >
              frei nach Goethe
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Input bar */}
      <div
        style={{
          backgroundColor: '#F0F0F0',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 30,
            color: '#8E8E93',
          }}
        >
          😊
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 30,
            padding: '14px 22px',
            fontSize: 28,
            color: '#8E8E93',
          }}
        >
          Nachricht...
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#075E54',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            color: 'white',
          }}
        >
          🎤
        </div>
      </div>
    </AbsoluteFill>
  );
};
