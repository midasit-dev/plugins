import { GuideBox, Panel } from "@midasit-dev/moaui";
import VelocityPressureName from "./components/velocity-pressure-name";
import WindPressureValue from "./components/wind-pressure-value";
import ForceCoefficientCf from "./components/force-coefficient-cf";
import StructuralFactorCscd from "./components/structural-factor-cscd";

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
