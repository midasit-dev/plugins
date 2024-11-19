import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import { mainCfValueSelector } from "../../../../defines/applyDefines";

export default function ForceCoefficientCf() {
  const [value, setValue] = useRecoilState(mainCfValueSelector);

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1">Force Coefficient, Cf</Typography>
      <TextFieldV2
        type="number"
        numberOptions={{
          min: 0.0,
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
