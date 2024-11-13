import type { SelectChangeEvent } from "@mui/material";
import {
  DropList,
  GuideBox,
  Icon,
  IconButton,
  Typography,
} from "@midasit-dev/moaui";

export default function VelocityPressureName() {
  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <Typography variant="h1">Velocity Pressure</Typography>

      <div className="flex gap-4 items-center">
        <DropList
          width={161}
          itemList={[["", 1]]}
          onChange={(e: SelectChangeEvent) => {
            const selIndex = Number(e.target.value);
          }}
          value={1}
          defaultValue={1}
          placeholder="Select ..."
        />
        <IconButton>
          <Icon iconName="MoreHoriz" />
        </IconButton>
      </div>
    </GuideBox>
  );
}
