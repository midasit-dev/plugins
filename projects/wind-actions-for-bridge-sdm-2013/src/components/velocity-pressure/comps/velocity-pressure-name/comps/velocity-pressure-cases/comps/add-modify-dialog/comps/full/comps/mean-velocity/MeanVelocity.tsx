import { GuideBox } from "@midasit-dev/moaui";
import ReferenceHeightForTheWindAction from "../common/ReferenceHeightForTheWindAction";
import HorizontalWindLoadLength from "../common/HorizontalWindLoadLength";
import DegreeOfExposure from "../common/DegressOfExposure";
import OrgraphyEffectFactorCoz from "../common/OrographyEffectFactorCoz";
import ClimateChargingFactorKpc from "../common/ClimateChargingFactorKpc";
import CalculateButton from "./CalculateButton";

export default function MeanVelocity() {
  return (
    <GuideBox width="100%" spacing={1}>
      <ReferenceHeightForTheWindAction />
      <HorizontalWindLoadLength disabled={true} />
      <DegreeOfExposure />
      <OrgraphyEffectFactorCoz />
      <ClimateChargingFactorKpc />

      <CalculateButton />
    </GuideBox>
  );
}
