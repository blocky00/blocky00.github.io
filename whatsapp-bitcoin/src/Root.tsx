import {Composition} from 'remotion';
import {WhatsAppConversation} from './WhatsAppConversation';
import {EvolvingMotion} from './EvolvingMotion';
import {LinkedInCinematic} from './LinkedInCinematic';
import {SlackLinkedInRoast} from './SlackLinkedInRoast';
import {CyberpunkCatChat} from './CyberpunkCatChat';
import {RemotionShowreel} from './RemotionShowreel';
import {MunichBerlinMap} from './MunichBerlinMap';
import {ContentIsLiquid} from './ContentIsLiquid';
import {FaustMephistoVibeCoding} from './FaustMephistoVibeCoding';
import {AsciiCatsDiscoverAI} from './AsciiCatsDiscoverAI';

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
      <Composition
        id="CyberpunkCatChat"
        component={CyberpunkCatChat}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RemotionShowreel"
        component={RemotionShowreel}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="MunichBerlinMap"
        component={MunichBerlinMap}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ContentIsLiquid"
        component={ContentIsLiquid}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FaustMephistoVibeCoding"
        component={FaustMephistoVibeCoding}
        durationInFrames={960}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AsciiCatsDiscoverAI"
        component={AsciiCatsDiscoverAI}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
