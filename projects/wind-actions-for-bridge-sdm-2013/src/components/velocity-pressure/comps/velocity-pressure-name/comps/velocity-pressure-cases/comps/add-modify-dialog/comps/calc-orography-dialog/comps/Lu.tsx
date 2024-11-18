import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH_M } from "../../../../../../../../../../../defines/widthDefines";

export default function Ld() {
  return (
    <GuideBox width="100%" horSpaceBetween verCenter row>
      <Typography>Length of Downwind Slope, Ld</Typography>

      <div className="flex w-auto justify-between items-center gap-2">
        <TextFieldV2
          type="number"
          placeholder="Enter value"
          width={CALC_OROGRAPHY_DIALOG_R_WIDTH_M}
          defaultValue="0.0"
          numberOptions={{
            min: 0.0,
            step: 0.1,
          }}
        />
        <Typography>m</Typography>
      </div>
    </GuideBox>
  );
}
