import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../../defines/widthDefines";
import { useRecoilValue } from "recoil";
import { mainSelVelocityPressureValueSelector } from "../../../../defines/applyDefines";

export default function WindPressureValue() {
  const selItemValue = useRecoilValue(mainSelVelocityPressureValueSelector);

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1">Wind Pressure Value</Typography>
      <TextFieldV2
        width={PANEL_1_R_WIDTH}
        placeholder="Enter the value"
        value={(selItemValue ?? "N.A.").toString()}
        disabled
      />
    </GuideBox>
  );
}
