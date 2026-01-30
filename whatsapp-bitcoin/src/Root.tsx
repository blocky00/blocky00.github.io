import {Composition} from 'remotion';
import {WhatsAppConversation} from './WhatsAppConversation';

export const RemotionRoot = () => {
  return (
    <Composition
      id="WhatsAppConversation"
      component={WhatsAppConversation}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
