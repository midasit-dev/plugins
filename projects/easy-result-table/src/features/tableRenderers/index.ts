import { TableRenderer } from "./types";
import { reactionTableRenderer } from "./ReactionTableRenderer";
import { vibrationTableRenderer } from "./VibrationTableRenderer";
import { storyDriftTableRenderer } from "./StoryDriftTableRenderer";
import { storyDisplacementTableRenderer } from "./StoryDisplacementTableRenderer";
import { storyShearTableRenderer } from "./StoryShearTableRenderer";
import { storyEccentricityTableRenderer } from "./StoryEccentricityTableRenderer";
import { storyShearForceRatioTableRenderer } from "./StoryShearForceRatioTableRenderer";
import { stabilityCoefficientTableRenderer } from "./StabilityCoefficientTableRenderer";
import { weightIrregularityCheckTableRenderer } from "./WeightIrregularityCheckTableRenderer";
import { storyAxialForceSumTableRenderer } from "./StoryAxialForceSumTableRenderer";
import { torsionalIrregularityCheckTableRenderer } from "./TorsionalIrregularityCheckTableRenderer";
import { capacityIrregularityCheckTableRenderer } from "./CapacityIrregularityCheckTableRenderer";
import { overturningMomentTableRenderer } from "./OverturningMomentTableRenderer";
import { torsionalAmplificationFactorTableRenderer } from "./TorsionalAmplificationFactorTableRenderer";
import { stiffnessIrregularityCheckTableRenderer } from "./StiffnessIrregularityCheckTableRenderer";

const tableRenderers: { [key: string]: TableRenderer } = {
  Reaction: reactionTableRenderer,
  Vibration: vibrationTableRenderer,
  "Story Drift": storyDriftTableRenderer,
  "Story Displacement": storyDisplacementTableRenderer,
  "Story Shear(R": storyShearTableRenderer,
  "Story Eccentricity": storyEccentricityTableRenderer,
  "Story Shear Force Ratio": storyShearForceRatioTableRenderer,
  "Stability Coefficient": stabilityCoefficientTableRenderer,
  "Weight Irregularity Check": weightIrregularityCheckTableRenderer,
  "Story Axial Force Sum": storyAxialForceSumTableRenderer,
  "Torsional Irregularity Check": torsionalIrregularityCheckTableRenderer,
  "Capacity Irregularity Check": capacityIrregularityCheckTableRenderer,
  "Overturning Moment": overturningMomentTableRenderer,
  "Torsional Amplification Factor": torsionalAmplificationFactorTableRenderer,
  "Stiffness Irregularity Check": stiffnessIrregularityCheckTableRenderer,
};

export const getTableRenderer = (tableName: string): TableRenderer | null => {
  // 테이블 이름에 포함된 문자열로 렌더러 찾기
  const rendererKey = Object.keys(tableRenderers).find((key) =>
    tableName.includes(key)
  );
  return rendererKey ? tableRenderers[rendererKey] : null;
};
