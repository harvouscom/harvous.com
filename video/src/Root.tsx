import "./index.css";
import { Composition } from "remotion";
import { HarvousTour } from "./Tour";
import { FPS, HEIGHT, WIDTH, buildTimeline } from "./clips";

const { totalFrames } = buildTimeline();

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HarvousTour"
      component={HarvousTour}
      durationInFrames={totalFrames}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
