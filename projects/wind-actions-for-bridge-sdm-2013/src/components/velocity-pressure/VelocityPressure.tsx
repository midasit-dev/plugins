import { GuideBox, Panel } from "@midasit-dev/moaui";
import VelocityPressureName from "./comps/velocity-pressure-name/VelocityPressureName";
import WindPressureValue from "./comps/wind-pressure-value";
import ForceCoefficientCf from "./comps/force-coefficient-cf";
import StructuralFactorCscd from "./comps/structural-factor-cscd";

export default function VelocityPressure() {
  return (
    <Panel width="100%" variant="shadow2">
      <GuideBox width="100%" spacing={2} padding={1}>
        <VelocityPressureName />
        <WindPressureValue />
        <ForceCoefficientCf />
        <StructuralFactorCscd />
      </GuideBox>
    </Panel>
  );
}
