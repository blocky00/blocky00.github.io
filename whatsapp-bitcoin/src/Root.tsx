import {Composition} from 'remotion';
import {WhatsAppConversation} from './WhatsAppConversation';
import {EvolvingMotion} from './EvolvingMotion';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="WhatsAppConversation"
        component={WhatsAppConversation}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EvolvingMotion"
        component={EvolvingMotion}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
