import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { FPS, sourceEndSec, type TourClip as TourClipDef } from "../clips";
import { FeatureLabel } from "./Brand";

type Props = {
  clip: TourClipDef;
  index: number;
  durationInFrames: number;
};

export const TourClip: React.FC<Props> = ({ clip, index, durationInFrames }) => {
  const trimBefore = Math.round(clip.startSec * FPS);
  const trimAfter = Math.round(sourceEndSec(clip, index) * FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0e12" }}>
      <Video
        src={staticFile("touring-new-harvous-share.mp4")}
        trimBefore={trimBefore}
        trimAfter={trimAfter}
        durationInFrames={durationInFrames}
        premountFor={Math.round(1.5 * FPS)}
        volume={1}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
        name={clip.label ?? clip.id}
      />
      {clip.label && clip.icon ? (
        <FeatureLabel
          label={clip.label}
          icon={clip.icon}
          durationInFrames={durationInFrames}
        />
      ) : null}
    </AbsoluteFill>
  );
};
