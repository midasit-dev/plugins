import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH_M } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";

export default function H() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();

  return (
    <GuideBox width="100%" horSpaceBetween verCenter row>
      <Typography>Height of Topographic Feature, H</Typography>

      <div className="flex w-auto justify-between items-center gap-2">
        <TextFieldV2
          type="number"
          placeholder="Enter value"
          width={CALC_OROGRAPHY_DIALOG_R_WIDTH_M}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCozOptionsCallback({
              h: Number.parseFloat(e.target.value),
            });
          }}
          value={String(tempValueCozOptions?.h) ?? "0.0"}
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
