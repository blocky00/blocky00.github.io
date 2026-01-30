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
  sender: 'me' | 'other';
  time: string;
};

const messages: Message[] = [
  {id: 1, text: 'Hey! Hast du schon von Bitcoin gehört?', sender: 'other', time: '14:32'},
  {id: 2, text: 'Ja klar! Der Kurs ist gerade wieder stark gestiegen', sender: 'me', time: '14:33'},
  {id: 3, text: 'Genau! Ich überlege, ob ich investieren soll', sender: 'other', time: '14:33'},
  {id: 4, text: 'Das ist eine wichtige Entscheidung. Hast du dich gut informiert?', sender: 'me', time: '14:34'},
  {id: 5, text: 'Ich habe einiges gelesen. Es ist dezentralisiert und hat ein begrenztes Angebot von 21 Millionen Coins', sender: 'other', time: '14:35'},
  {id: 6, text: 'Richtig! Das macht es zu einem deflationären Asset', sender: 'me', time: '14:36'},
  {id: 7, text: 'Aber die Volatilität macht mir Sorgen', sender: 'other', time: '14:37'},
  {id: 8, text: 'Verstehe ich. Man sollte nur investieren, was man verlieren kann', sender: 'me', time: '14:38'},
  {id: 9, text: 'Guter Rat! Ich fange klein an', sender: 'other', time: '14:39'},
  {id: 10, text: 'Viel Erfolg!', sender: 'me', time: '14:39'},
];

const FRAMES_PER_MESSAGE = 50;

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

  const isMe = message.sender === 'me';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          maxWidth: '75%',
          padding: '16px 20px',
          borderRadius: 20,
          borderBottomRightRadius: isMe ? 4 : 20,
          borderBottomLeftRadius: isMe ? 20 : 4,
          backgroundColor: isMe ? '#DCF8C6' : '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.4,
            color: '#303030',
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {message.text}
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#8E8E93',
            textAlign: 'right',
            marginTop: 6,
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {message.time}
          {isMe && (
            <span style={{marginLeft: 8, color: '#34B7F1'}}>
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const WhatsAppHeader = () => {
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
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#128C7E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        BTC
      </div>
      <div style={{flex: 1}}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: 'white',
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Bitcoin Gruppe
        </div>
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Max, Anna
        </div>
      </div>
    </div>
  );
};

export const WhatsAppConversation = () => {
  const frame = useCurrentFrame();

  const scrollProgress = interpolate(
    frame,
    [0, 300, 600],
    [0, 0, -400],
    {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'}
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#ECE5DD',
        fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <WhatsAppHeader />

      <div
        style={{
          flex: 1,
          padding: 24,
          paddingTop: 40,
          overflow: 'hidden',
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
              <MessageBubble
                message={message}
                delay={0}
              />
            </Sequence>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#F0F0F0',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 30,
            padding: '16px 24px',
            fontSize: 28,
            color: '#8E8E93',
          }}
        >
          Nachricht eingeben...
        </div>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#075E54',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: 'white',
          }}
        >
          mic
        </div>
      </div>
    </AbsoluteFill>
  );
};
