import {
  GuideBox,
  TextFieldV2,
  Typography,
  Icon,
  IconButton,
} from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import { mainCsCdValueSelector } from "../../../../defines/applyDefines";
import InfoWrapper from "../../../common/InfoWrapper";

export default function StructuralFactorCscd() {
  const [value, setValue] = useRecoilState(mainCsCdValueSelector);

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1">Structural Factor, CsCd</Typography>
      <InfoWrapper
        tooltipProps={{
          left: -130,
          bottom: 30,
        }}
        tooltip={
          <GuideBox width={300}>
            <Typography variant="h1" color="gray">
              Refer to Clause 3.4.5 (2)
            </Typography>
            <Typography>
              The size factor cs and the dynamic factor cd, shall both be taken
              as 1.0 for bridges that a “dynamic response procedure” is not
              needed.
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
        defaultValue="1.0"
        width={PANEL_1_R_WIDTH}
        placeholder="Enter the value"
      />
    </GuideBox>
  );
}
