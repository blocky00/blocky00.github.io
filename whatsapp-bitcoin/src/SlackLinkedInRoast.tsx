import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from 'remotion';
import React from 'react';

/**
 * SLACK CONVERSATION - LinkedIn Saved Items Roast
 *
 * A hilarious conversation between Stefan and Adrian about
 * why LinkedIn's saved items feature is absolutely terrible.
 *
 * Features:
 * - Authentic Slack UI
 * - Animated message bubbles with typing indicators
 * - Emoji reactions that pop in
 * - Funny text overlays (meme-style)
 * - Screen shake on dramatic moments
 * - Zoom effects for emphasis
 */

// Message data
const messages: Array<{
  id: number;
  sender: 'stefan' | 'adrian';
  text: string;
  reactions?: Array<{emoji: string; count: number}>;
  isTyping?: boolean;
}> = [
  {
    id: 1,
    sender: 'stefan',
    text: "Bro... I just tried to find a post I saved on LinkedIn last week",
  },
  {
    id: 2,
    sender: 'stefan',
    text: "It took me 47 clicks and I still can't find it 💀",
    reactions: [{emoji: '😭', count: 3}],
  },
  {
    id: 3,
    sender: 'adrian',
    text: "lmaooo welcome to my world",
  },
  {
    id: 4,
    sender: 'adrian',
    text: "You know Twitter lets you organize bookmarks into folders right?",
  },
  {
    id: 5,
    sender: 'stefan',
    text: "WAIT WHAT",
    reactions: [{emoji: '🤯', count: 2}],
  },
  {
    id: 6,
    sender: 'adrian',
    text: "Yeah but plot twist... you need Premium for that 😂",
  },
  {
    id: 7,
    sender: 'adrian',
    text: "LinkedIn has collections but good luck finding them. It's like they hid it in the Mariana Trench",
    reactions: [{emoji: '💀', count: 5}, {emoji: '😂', count: 3}],
  },
  {
    id: 8,
    sender: 'stefan',
    text: "I'm literally an AI engineer and I can't figure out their UX",
  },
  {
    id: 9,
    sender: 'stefan',
    text: "Maybe we should train a model just to navigate LinkedIn's UI",
    reactions: [{emoji: '🔥', count: 4}],
  },
  {
    id: 10,
    sender: 'adrian',
    text: "Startup idea: AI that finds your saved LinkedIn posts",
  },
  {
    id: 11,
    sender: 'adrian',
    text: "We'd make billions because NOBODY can find that stuff 💰",
    reactions: [{emoji: '🚀', count: 6}, {emoji: '💯', count: 2}],
  },
  {
    id: 12,
    sender: 'stefan',
    text: "fr fr... gotta work on that shit",
  },
  {
    id: 13,
    sender: 'adrian',
    text: "Adding it to the backlog right after 'fix everything else about LinkedIn'",
    reactions: [{emoji: '😭', count: 8}],
  },
];

// Funny overlay texts that appear at key moments
const overlays: Array<{
  text: string;
  startFrame: number;
  style: 'meme' | 'impact' | 'glitch' | 'bounce';
  position: {x: number; y: number};
  rotation?: number;
}> = [
  {text: 'PAIN 💀', startFrame: 60, style: 'impact', position: {x: 800, y: 150}, rotation: -15},
  {text: 'NO CAP', startFrame: 180, style: 'meme', position: {x: 750, y: 200}, rotation: 10},
  {text: 'FACTS', startFrame: 300, style: 'bounce', position: {x: 820, y: 180}, rotation: -8},
  {text: 'REAL', startFrame: 420, style: 'glitch', position: {x: 780, y: 160}, rotation: 5},
  {text: 'BRUH', startFrame: 540, style: 'impact', position: {x: 800, y: 200}, rotation: -12},
  {text: '💀💀💀', startFrame: 660, style: 'bounce', position: {x: 750, y: 150}, rotation: 0},
  {text: 'GENIUS', startFrame: 480, style: 'meme', position: {x: 820, y: 220}, rotation: 8},
  {text: 'W TAKE', startFrame: 600, style: 'impact', position: {x: 760, y: 180}, rotation: -5},
];

// Slack sidebar channels
const channels = [
  {name: 'general', unread: 0},
  {name: 'random', unread: 3},
  {name: 'engineering', unread: 0, active: true},
  {name: 'product-roasts', unread: 12},
  {name: 'ai-experiments', unread: 0},
];

// User avatars
const avatars = {
  stefan: {color: '#E91E63', initials: 'S'},
  adrian: {color: '#2196F3', initials: 'A'},
};

// ============================================
// TYPING INDICATOR
// ============================================
const TypingIndicator = ({sender}: {sender: 'stefan' | 'adrian'}) => {
  const frame = useCurrentFrame();
  const dots = [0, 1, 2];

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0'}}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: avatars[sender].color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {avatars[sender].initials}
      </div>
      <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
        {dots.map((i) => {
          const delay = i * 5;
          const bounce = Math.sin((frame + delay) / 5) * 3;
          return (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#616061',
                transform: `translateY(${bounce}px)`,
              }}
            />
          );
        })}
      </div>
      <span style={{color: '#616061', fontSize: 13}}>
        {sender.charAt(0).toUpperCase() + sender.slice(1)} is typing...
      </span>
    </div>
  );
};

// ============================================
// MESSAGE BUBBLE
// ============================================
const MessageBubble = ({
  message,
  showReactions,
}: {
  message: typeof messages[0];
  showReactions: boolean;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {damping: 15, stiffness: 200},
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [20, 0]);

  const sender = message.sender;
  const name = sender.charAt(0).toUpperCase() + sender.slice(1);

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '4px 20px',
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: avatars[sender].color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {avatars[sender].initials}
      </div>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
          <span style={{fontWeight: 700, color: '#1d1c1d', fontSize: 15}}>{name}</span>
          <span style={{color: '#616061', fontSize: 12}}>
            {Math.floor(frame / 60) % 12 + 9}:{String(Math.floor(frame / 2) % 60).padStart(2, '0')} AM
          </span>
        </div>
        <div style={{color: '#1d1c1d', fontSize: 15, lineHeight: 1.46, marginTop: 4}}>
          {message.text}
        </div>
        {message.reactions && showReactions && (
          <div style={{display: 'flex', gap: 4, marginTop: 6}}>
            {message.reactions.map((reaction, i) => {
              const reactionEntrance = spring({
                frame: frame - 15 - i * 5,
                fps,
                config: {damping: 10, stiffness: 300},
              });
              const reactionScale = interpolate(reactionEntrance, [0, 1], [0, 1], {
                extrapolateRight: 'clamp',
              });

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    backgroundColor: '#f8f8f8',
                    border: '1px solid #e8e8e8',
                    borderRadius: 12,
                    fontSize: 12,
                    transform: `scale(${reactionScale})`,
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span style={{color: '#616061'}}>{reaction.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// FUNNY OVERLAY
// ============================================
const FunnyOverlay = ({
  overlay,
}: {
  overlay: typeof overlays[0];
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame - overlay.startFrame;

  if (localFrame < 0 || localFrame > 60) return null;

  const entrance = spring({
    frame: localFrame,
    fps,
    config: {damping: 8, stiffness: 200},
  });

  const exit = interpolate(localFrame, [40, 60], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(entrance, [0, 1], [0, 1]) * exit;

  // Style variations
  let extraStyle: React.CSSProperties = {};
  let extraTransform = '';

  switch (overlay.style) {
    case 'impact':
      extraStyle = {
        fontFamily: 'Impact, sans-serif',
        color: 'white',
        textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000',
        fontSize: 48,
      };
      break;
    case 'meme':
      extraStyle = {
        fontFamily: 'Comic Sans MS, cursive',
        color: '#FF6B6B',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        fontSize: 42,
      };
      break;
    case 'glitch':
      const glitchX = Math.sin(localFrame * 2) * 5;
      extraStyle = {
        fontFamily: 'monospace',
        color: '#00FF00',
        textShadow: `${glitchX}px 0 #FF0000, ${-glitchX}px 0 #0000FF`,
        fontSize: 44,
      };
      break;
    case 'bounce':
      const bounceY = Math.sin(localFrame / 3) * 10;
      extraTransform = `translateY(${bounceY}px)`;
      extraStyle = {
        fontFamily: 'Arial Black, sans-serif',
        color: '#FFD93D',
        textShadow: '2px 2px 0 #000',
        fontSize: 46,
      };
      break;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: overlay.position.x,
        top: overlay.position.y,
        transform: `scale(${scale}) rotate(${overlay.rotation || 0}deg) ${extraTransform}`,
        fontWeight: 900,
        letterSpacing: 2,
        zIndex: 100,
        ...extraStyle,
      }}
    >
      {overlay.text}
    </div>
  );
};

// ============================================
// SLACK SIDEBAR
// ============================================
const SlackSidebar = () => {
  return (
    <div
      style={{
        width: 260,
        backgroundColor: '#3F0E40',
        height: '100%',
        padding: '12px 0',
        color: 'white',
      }}
    >
      {/* Workspace header */}
      <div style={{padding: '0 16px 16px', borderBottom: '1px solid #522653'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#611f69',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            T
          </div>
          <div>
            <div style={{fontWeight: 700, fontSize: 16}}>TechStartup</div>
            <div style={{fontSize: 12, color: '#cfc3cf', display: 'flex', alignItems: 'center', gap: 4}}>
              <span style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2bac76'}} />
              Stefan
            </div>
          </div>
        </div>
      </div>

      {/* Channels */}
      <div style={{padding: '16px 0'}}>
        <div style={{padding: '0 16px', fontSize: 13, color: '#cfc3cf', marginBottom: 8}}>
          Channels
        </div>
        {channels.map((channel) => (
          <div
            key={channel.name}
            style={{
              padding: '4px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: channel.active ? '#1264A3' : 'transparent',
              borderRadius: channel.active ? 6 : 0,
              margin: channel.active ? '0 8px' : 0,
              cursor: 'pointer',
            }}
          >
            <span style={{color: channel.active ? 'white' : '#cfc3cf'}}>
              # {channel.name}
            </span>
            {channel.unread > 0 && (
              <span
                style={{
                  backgroundColor: '#E01E5A',
                  color: 'white',
                  fontSize: 11,
                  padding: '0 6px',
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                {channel.unread}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Direct Messages */}
      <div style={{padding: '16px 0'}}>
        <div style={{padding: '0 16px', fontSize: 13, color: '#cfc3cf', marginBottom: 8}}>
          Direct Messages
        </div>
        <div style={{padding: '4px 16px', display: 'flex', alignItems: 'center', gap: 8}}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: avatars.adrian.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <span style={{color: 'white'}}>Adrian</span>
          <span style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2bac76', marginLeft: 'auto'}} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================
export const SlackLinkedInRoast = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const framesPerMessage = 50;
  const typingFrames = 25;

  // Calculate visible messages
  const visibleMessages: Array<{message: typeof messages[0]; showReactions: boolean}> = [];
  let currentFrame = 0;

  for (const message of messages) {
    const messageStart = currentFrame + typingFrames;
    const reactionsStart = messageStart + 20;

    if (frame >= messageStart) {
      visibleMessages.push({
        message,
        showReactions: frame >= reactionsStart,
      });
    }
    currentFrame += framesPerMessage;
  }

  // Determine if someone is typing
  let isTyping = false;
  let typingSender: 'stefan' | 'adrian' | null = null;
  currentFrame = 0;

  for (let i = 0; i < messages.length; i++) {
    const typingStart = currentFrame;
    const typingEnd = currentFrame + typingFrames;

    if (frame >= typingStart && frame < typingEnd) {
      isTyping = true;
      typingSender = messages[i].sender;
      break;
    }
    currentFrame += framesPerMessage;
  }

  // Screen shake on certain frames
  const shakeFrames = [60, 180, 420, 540];
  let shakeX = 0;
  let shakeY = 0;
  for (const sf of shakeFrames) {
    if (frame >= sf && frame < sf + 10) {
      const intensity = 1 - (frame - sf) / 10;
      shakeX = Math.sin(frame * 20) * 5 * intensity;
      shakeY = Math.cos(frame * 20) * 3 * intensity;
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1d21',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <div style={{display: 'flex', height: '100%'}}>
        {/* Sidebar */}
        <SlackSidebar />

        {/* Main chat area */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white'}}>
          {/* Channel header */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid #e8e8e8',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{fontSize: 18, fontWeight: 700, color: '#1d1c1d'}}>
              # engineering
            </span>
            <span style={{color: '#616061', fontSize: 13}}>
              Where we roast bad UX decisions
            </span>
          </div>

          {/* Messages area */}
          <div style={{flex: 1, overflow: 'hidden', padding: '20px 0'}}>
            {visibleMessages.map(({message, showReactions}, index) => (
              <Sequence key={message.id} from={0} layout="none">
                <MessageBubble message={message} showReactions={showReactions} />
              </Sequence>
            ))}

            {/* Typing indicator */}
            {isTyping && typingSender && (
              <div style={{padding: '4px 20px'}}>
                <TypingIndicator sender={typingSender} />
              </div>
            )}
          </div>

          {/* Message input */}
          <div style={{padding: '12px 20px', borderTop: '1px solid #e8e8e8'}}>
            <div
              style={{
                padding: '10px 12px',
                border: '1px solid #e8e8e8',
                borderRadius: 8,
                color: '#616061',
                fontSize: 14,
              }}
            >
              Message #engineering
            </div>
          </div>
        </div>
      </div>

      {/* Funny overlays */}
      {overlays.map((overlay, i) => (
        <FunnyOverlay key={i} overlay={overlay} />
      ))}

      {/* "LIVE" indicator */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '6px 12px',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#E01E5A',
            animation: 'pulse 1s infinite',
            boxShadow: `0 0 ${10 + Math.sin(frame / 5) * 5}px #E01E5A`,
          }}
        />
        <span style={{color: 'white', fontWeight: 700, fontSize: 12}}>LIVE</span>
      </div>

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          color: 'rgba(0,0,0,0.3)',
          fontSize: 12,
          fontFamily: 'monospace',
        }}
      >
        Made with Remotion 🎬
      </div>
    </AbsoluteFill>
  );
};
