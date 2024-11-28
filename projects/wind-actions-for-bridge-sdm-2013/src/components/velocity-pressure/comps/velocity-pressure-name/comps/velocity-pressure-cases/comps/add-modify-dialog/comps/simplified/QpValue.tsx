import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import {
  useChangeBanner,
  DoneBanner,
} from "../../../../../../../../../../utils/loadingUtils";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { useState } from "react";

//TEST Python 계산 결과 보여주는 곳
export default function QpValue() {
  const [isBlock, setIsBlock] = useState<boolean>(false);

  const { tempValue, setTempValueCallback } = useTemporaryValue();
  const { isVisible } = useChangeBanner(tempValue?.value, 500, isBlock);

  return (
    <GuideBox width="100%" center spacing={1}>
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <Typography>Peak Velocity Pressure</Typography>

          <p className="text-xs">
            <InlineMath math={"q_p"} />
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-2"
        onFocus={() => setIsBlock(true)}
        onBlur={() => setIsBlock(false)}
      >
        <TextFieldV2
          type="number"
          numberOptions={{
            min: 0,
            onlyInteger: false,
            condition: {
              min: "greater",
            },
          }}
          value={tempValue?.value.toString()}
          width={100}
          placeholder="Value ..."
          defaultValue="3.865"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCallback({
              value: Number.parseFloat(e.target.value),
            });
          }}
        />
        <p className="text-xs">
          <InlineMath math={"kN/m^2"} />
        </p>
        <DoneBanner isVisible={isVisible} />
      </div>
    </GuideBox>
  );
}
