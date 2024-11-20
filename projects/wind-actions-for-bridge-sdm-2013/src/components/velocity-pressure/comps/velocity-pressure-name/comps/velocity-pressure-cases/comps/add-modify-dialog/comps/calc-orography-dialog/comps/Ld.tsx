import { TextFieldV2, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH_M } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import { useEffect, useState } from "react";
import {
  FullLocationEnum,
  FullOrographyTypeEnum,
} from "../../../../../../../../../../../defines/applyDefines";

export default function Ld() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();

  // Orography Type "Hills and redges" && Location "Downwind"일 경우에만 활성화
  const [isDisabled, setIsDisabled] = useState(true);
  useEffect(() => {
    const orographyType = tempValueCozOptions?.orographyType;
    const location = tempValueCozOptions?.location;

    if (
      orographyType === FullOrographyTypeEnum.HILLS_AND_RIDGES &&
      location === FullLocationEnum.DOWNWIND
    ) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [tempValueCozOptions?.location, tempValueCozOptions?.orographyType]);

  return (
    <div
      className="w-full flex items-center justify-between"
      style={{
        pointerEvents: isDisabled ? "none" : "auto",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
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
            condition: {
              min: "greater",
            },
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCozOptionsCallback({
              ld: Number.parseFloat(e.target.value),
            });
          }}
          value={String(tempValueCozOptions?.ld) ?? "0.0"}
        />
        <Typography>m</Typography>
      </div>
    </div>
  );
}
