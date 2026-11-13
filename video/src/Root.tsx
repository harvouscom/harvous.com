import "./index.css";
import { Composition } from "remotion";
import { HarvousTour } from "./Tour";
import { HarvousIntro, introSchema, type IntroProps } from "./intro/Intro";
import { loadIntroData } from "./intro/data";
import { BEATS } from "./intro/timeline";
import { FPS as INTRO_FPS, HEIGHT as INTRO_HEIGHT, WIDTH as INTRO_WIDTH, placeBeats } from "./intro/plan";
import { FPS, HEIGHT, WIDTH, buildTimeline } from "./clips";
import {
  NarrationPreview,
  loadNarration,
  placeNarration,
  type NarrationPreviewProps,
} from "./narration";

const { totalFrames } = buildTimeline();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* The homepage intro: Derek's voice over his own account. See src/intro/. */}
      <Composition
        id="HarvousIntro"
        component={HarvousIntro}
        schema={introSchema}
        defaultProps={{ desktopFrame: "mac-chrome", phoneFrame: "iphone", theme: "light" } as IntroProps}
        calculateMetadata={async ({ props }) => {
          const data = await loadIntroData();
          // 30 fps for drafts; the final render passes fps: 60.
          const fps = props.fps ?? INTRO_FPS;
          return {
            props: { ...props, data },
            fps,
            durationInFrames: Math.max(1, Math.ceil(placeBeats(BEATS, data).totalSec * fps)),
          };
        }}
        durationInFrames={1}
        fps={INTRO_FPS}
        width={INTRO_WIDTH}
        height={INTRO_HEIGHT}
      />
      <Composition
        id="HarvousTour"
        component={HarvousTour}
        durationInFrames={totalFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="NarrationPreview"
        component={NarrationPreview}
        defaultProps={{ script: "example" } as NarrationPreviewProps}
        calculateMetadata={async ({ props }) => {
          const manifest = await loadNarration(props.script);
          return {
            props: { ...props, manifest },
            durationInFrames: Math.max(1, placeNarration(manifest).totalFrames),
          };
        }}
        durationInFrames={1}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
