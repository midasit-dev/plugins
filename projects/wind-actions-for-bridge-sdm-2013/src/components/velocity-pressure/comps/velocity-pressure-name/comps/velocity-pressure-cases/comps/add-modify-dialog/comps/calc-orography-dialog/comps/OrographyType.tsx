import { DropList, GuideBox, Typography } from "@midasit-dev/moaui";
import { PANEL_2_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";

export default function OrographyType() {
  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <Typography>Orography Type</Typography>
      <DropList
        width={PANEL_2_R_WIDTH}
        itemList={[
          ["Cliffs and Escarpments", 1],
          ["Hills and ridges", 2],
        ]}
        placeholder="Select ..."
        value={1}
      />
    </GuideBox>
  );
}
