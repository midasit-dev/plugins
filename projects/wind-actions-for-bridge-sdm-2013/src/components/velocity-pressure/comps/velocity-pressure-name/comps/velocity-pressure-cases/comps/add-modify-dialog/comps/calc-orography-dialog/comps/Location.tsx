import { DropList, GuideBox, Typography } from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";

export default function Location() {
  return (
    <GuideBox width={"100%"} horSpaceBetween verCenter row>
      <Typography>Location</Typography>

      <DropList
        width={CALC_OROGRAPHY_DIALOG_R_WIDTH}
        itemList={[
          ["Upwind", 1],
          ["Downwind", 2],
        ]}
        placeholder="Select ..."
        value={1}
      />
    </GuideBox>
  );
}
