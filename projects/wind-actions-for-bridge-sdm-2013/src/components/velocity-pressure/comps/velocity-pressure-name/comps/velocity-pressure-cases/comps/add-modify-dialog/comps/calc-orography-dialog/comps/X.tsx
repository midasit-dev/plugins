import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH_M } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";

export default function X() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();

  return (
    <GuideBox width="100%" horSpaceBetween verCenter row>
      <Typography>Horizontal distance from the crest top, x</Typography>

      <div className="flex w-auto justify-between items-center gap-2">
        <TextFieldV2
          type="number"
          placeholder="Enter value"
          width={CALC_OROGRAPHY_DIALOG_R_WIDTH_M}
          defaultValue="0.0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCozOptionsCallback({
              x: Number.parseFloat(e.target.value),
            });
          }}
          value={(tempValueCozOptions?.x ?? 0.0).toString()}
        />
        <Typography>m</Typography>
      </div>
    </GuideBox>
  );
}
