import { DropList, GuideBox, Typography } from "@midasit-dev/moaui";
import { PANEL_2_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import { FullOrographyTypeEnum } from "../../../../../../../../../../../defines/applyDefines";
import type { SelectChangeEvent } from "@mui/material";

export default function OrographyType() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <Typography>Orography Type</Typography>
      <DropList
        width={PANEL_2_R_WIDTH}
        itemList={[
          [
            FullOrographyTypeEnum.CLIFFS_AND_ESCARPMENTS,
            FullOrographyTypeEnum.CLIFFS_AND_ESCARPMENTS,
          ],
          [
            FullOrographyTypeEnum.HILLS_AND_RIDGES,
            FullOrographyTypeEnum.HILLS_AND_RIDGES,
          ],
        ]}
        placeholder="Select ..."
        onChange={(e: SelectChangeEvent) => {
          setTempValueCozOptionsCallback({
            orographyType: e.target.value as FullOrographyTypeEnum,
          });
        }}
        value={tempValueCozOptions?.orographyType ?? ""}
      />
    </GuideBox>
  );
}
