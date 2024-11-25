import { GuideBox, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH_M } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import TextFieldForRealNumber from "../../../../../../../../../../common/TextFieldForRealNumber";
import { useEffect, useState } from "react";

export default function X() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();

  const [value, setValue] = useState<string>(String(tempValueCozOptions?.x));
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    const isNotNumber = Number.isNaN(Number(value));
    setIsError(isNotNumber);

    if (!isNotNumber) {
      setTempValueCozOptionsCallback({
        x: Number(value),
      });
    }
  }, [setTempValueCozOptionsCallback, value]);

  return (
    <GuideBox width="100%" horSpaceBetween verCenter row>
      <Typography color={isError ? "#FF5733" : "primary"}>
        Horizontal distance from the crest top, x
      </Typography>

      <div className="flex w-auto justify-between items-center gap-2">
        <TextFieldForRealNumber
          placeholder="Enter value"
          width={CALC_OROGRAPHY_DIALOG_R_WIDTH_M}
          defaultValue="0.0"
          onChange={(value: string) => {
            setValue(value);
          }}
          value={value}
          error={isError}
        />
        <Typography>m</Typography>
      </div>
    </GuideBox>
  );
}
