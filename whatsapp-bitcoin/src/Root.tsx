import {Composition} from 'remotion';
import {WhatsAppConversation} from './WhatsAppConversation';
import {EvolvingMotion} from './EvolvingMotion';
import {LinkedInCinematic} from './LinkedInCinematic';
import {SlackLinkedInRoast} from './SlackLinkedInRoast';

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
      <Composition
        id="LinkedInCinematic"
        component={LinkedInCinematic}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1350}
      />
      <Composition
        id="SlackLinkedInRoast"
        component={SlackLinkedInRoast}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
