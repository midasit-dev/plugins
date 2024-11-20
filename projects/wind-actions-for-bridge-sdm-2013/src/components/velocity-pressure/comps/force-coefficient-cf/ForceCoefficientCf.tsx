import {
  GuideBox,
  TextFieldV2,
  Typography,
  IconButton,
  Icon,
} from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import { mainCfValueSelector } from "../../../../defines/applyDefines";
import InfoWrapper from "../../../common/InfoWrapper";

export default function ForceCoefficientCf() {
  const [value, setValue] = useRecoilState(mainCfValueSelector);

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1">Force Coefficient, Cf</Typography>
      <InfoWrapper
        tooltipProps={{
          left: -130,
          bottom: 30,
        }}
        tooltip={
          <GuideBox width={300}>
            <Typography variant="h1" color="gray">
              Refer to Clause 3.4.6
            </Typography>
            <Typography>
              Force coefficients give the overall effect of the wind on a
              structure, structural element or component as a whole, including
              friction, if not specifically excluded
            </Typography>
          </GuideBox>
        }
      >
        <IconButton transparent>
          <Icon iconName="Info" />
        </IconButton>
      </InfoWrapper>
      <TextFieldV2
        type="number"
        numberOptions={{
          min: 0.0,
          step: 0.1,
          condition: {
            min: "greater",
          },
        }}
        onChange={(e) => setValue(Number.parseFloat(e.target.value))}
        value={value?.toString() ?? "1.0"}
        defaultValue={"1.0"}
        width={PANEL_1_R_WIDTH}
        placeholder="Enter the value"
      />
    </GuideBox>
  );
}
