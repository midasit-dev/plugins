import { DropList, GuideBox, TextField, Typography } from "@midasit-dev/moaui";
import type { SelectChangeEvent } from "@mui/material";
import { PANEL_1_R_WIDTH } from "../../../defines/widthDefines";

export default function Direction() {
  return (
    <GuideBox width={"100%"} horSpaceBetween verCenter row>
      <Typography variant="h1">Direction</Typography>
      <DropList
        width={PANEL_1_R_WIDTH}
        itemList={[["", 1]]}
        onChange={(e: SelectChangeEvent) => {
          const selIndex = Number(e.target.value);
        }}
        value={1}
        defaultValue={1}
        placeholder="Select ..."
      />
    </GuideBox>
  );
}
