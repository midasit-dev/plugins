import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../../defines/widthDefines";
import { useRecoilValue } from "recoil";
import { mainSelVelocityPressureValueSelector } from "../../../../defines/applyDefines";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function WindPressureValue() {
  const selItemValue = useRecoilValue(mainSelVelocityPressureValueSelector);

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <div className="w-full flex items-center">
        <Typography variant="h1">Wind Pressure Value</Typography>
        <GuideBox width={50} center>
          <p style={{ fontSize: 10 }} className="items-center mt-0.5">
            (<InlineMath math={"kN/m^2"} />)
          </p>
        </GuideBox>
      </div>

      <div className="flex gap-4 items-center">
        <TextFieldV2
          width={PANEL_1_R_WIDTH}
          placeholder="Enter the value"
          value={(selItemValue ?? "N.A.").toString()}
          disabled
        />
      </div>
    </GuideBox>
  );
}
