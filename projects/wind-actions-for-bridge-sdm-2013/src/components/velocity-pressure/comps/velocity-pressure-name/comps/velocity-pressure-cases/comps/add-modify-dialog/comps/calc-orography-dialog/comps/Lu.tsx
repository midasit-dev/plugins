import { TextFieldV2, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH_M } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";

export default function Lu() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();

  return (
    <div className="w-full flex items-center justify-between">
      <Typography>Length of Upwind Slope, Lu</Typography>

      <div className="flex w-auto justify-between items-center gap-2">
        <TextFieldV2
          type="number"
          placeholder="Enter value"
          width={CALC_OROGRAPHY_DIALOG_R_WIDTH_M}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCozOptionsCallback({
              lu: Number.parseFloat(e.target.value),
            });
          }}
          value={String(tempValueCozOptions?.lu) ?? "0.0"}
          defaultValue="0.0"
          numberOptions={{
            min: 0.0,
            step: 0.1,
            condition: {
              min: "greater",
            },
          }}
        />
        <Typography>m</Typography>
      </div>
    </div>
  );
}
