import React from "react";
import { Composition, AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { C } from "./theme";
import {
  SceneHook,
  SceneTurn,
  SceneLogo,
  SceneStages,
  SceneBoard,
  SceneTxline,
  SceneProof,
  SceneWhy,
  SceneCTA,
} from "./scenes";

loadInter();

const FPS = 30;
// Scene durations in frames — tuned so narration/reading lands comfortably.
const D = {
  hook: 150,
  turn: 140,
  logo: 110,
  stages: 210,
  board: 220,
  txline: 200,
  proof: 220,
  why: 200,
  cta: 190,
};
const OVERLAP = 15;

const scenes: [React.FC, number][] = [
  [SceneHook, D.hook],
  [SceneTurn, D.turn],
  [SceneLogo, D.logo],
  [SceneStages, D.stages],
  [SceneBoard, D.board],
  [SceneTxline, D.txline],
  [SceneProof, D.proof],
  [SceneWhy, D.why],
  [SceneCTA, D.cta],
];

const TOTAL =
  scenes.reduce((a, [, d]) => a + d, 0) - OVERLAP * (scenes.length - 1);

const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, TOTAL], [0, 100], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, height: 5, width: `${w}%`, background: `linear-gradient(90deg, ${C.green}, ${C.accent})`, zIndex: 100 }} />
  );
};

const Film: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <TransitionSeries>
      {scenes.map(([S, dur], i) => (
        <React.Fragment key={i}>
          <TransitionSeries.Sequence durationInFrames={dur}>
            <S />
          </TransitionSeries.Sequence>
          {i < scenes.length - 1 && (
            <TransitionSeries.Transition
              presentation={fade()}
              timing={linearTiming({ durationInFrames: OVERLAP })}
            />
          )}
        </React.Fragment>
      ))}
    </TransitionSeries>
    <Progress />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LineProofDemo"
      component={Film}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
