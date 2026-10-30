import "./index.css";
import { Composition } from "remotion";
import { HarvousTour } from "./Tour";
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
