import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
} from "remotion";
import { buildTimeline } from "./clips";
import { TourClip } from "./components/TourClip";
import { ensureGoogleSans } from "./load-fonts";

export const HarvousTour: React.FC = () => {
  const { placed } = buildTimeline();
  const [handle] = useState(() => delayRender("Loading Google Sans"));

  useEffect(() => {
    ensureGoogleSans()
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0e12" }}>
      {placed.map(({ clip, index, from, durationInFrames }) => (
        <Sequence
          key={clip.id}
          from={from}
          durationInFrames={durationInFrames}
          name={clip.label ?? clip.id}
          premountFor={45}
        >
          <TourClip
            clip={clip}
            index={index}
            durationInFrames={durationInFrames}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
