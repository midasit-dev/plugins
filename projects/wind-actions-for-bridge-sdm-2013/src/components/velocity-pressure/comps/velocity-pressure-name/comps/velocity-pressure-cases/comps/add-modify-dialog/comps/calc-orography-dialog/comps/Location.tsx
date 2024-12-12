import { DropList, GuideBox, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import { FullLocationEnum } from "../../../../../../../../../../../defines/applyDefines";
import type { SelectChangeEvent } from "@mui/material";

export default function Location() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();

  return (
    <GuideBox width={"100%"} horSpaceBetween verCenter row>
      <Typography>Location</Typography>
      <DropList
        width={CALC_OROGRAPHY_DIALOG_R_WIDTH}
        itemList={[
          [FullLocationEnum.UPWIND, FullLocationEnum.UPWIND],
          [FullLocationEnum.DOWNWIND, FullLocationEnum.DOWNWIND],
        ]}
        placeholder="Select ..."
        onChange={(e: SelectChangeEvent) => {
          setTempValueCozOptionsCallback({
            location: e.target.value as FullLocationEnum,
          });
        }}
        value={tempValueCozOptions?.location ?? ""}
      />
    </GuideBox>
  );
}
