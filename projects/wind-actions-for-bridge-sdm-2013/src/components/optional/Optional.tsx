import { GuideBox, Panel } from "@midasit-dev/moaui";
import TargetElements from "./components/TargetElements";
import Direction from "./components/Direction";
import HeightOfRestraint from "./components/HeightOfRestraint";

export default function Optional() {
  return (
    <Panel width="100%" variant="shadow2">
      <GuideBox width="100%" spacing={2} padding={1}>
        <TargetElements />
        <Direction />
        <HeightOfRestraint />
      </GuideBox>
    </Panel>
  );
}
