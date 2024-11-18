import {
  DropList,
  GuideBox,
  Icon,
  IconButton,
  Typography,
} from "@midasit-dev/moaui";
import {
  VELOCITY_PRESSURE_FULL_PANEL_4_R_WIDTH,
  VELOCITY_PRESSURE_FULL_PANEL_5_R_WIDTH,
} from "../../../../../../../../../../../../defines/widthDefines";
import type { SelectChangeEvent } from "@mui/material";
import useTemporaryValue, {
  type TypeFull,
} from "../../../../../../../../../../../../hooks/useTemporaryValue";

export default function DegreeOfExposure() {
  const { tempValue, setTempValueCallback, asFull } = useTemporaryValue();

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <div className="flex gap-0 items-center">
        <Typography>Degree of Exposure</Typography>
        <IconButton transparent>
          <Icon iconName="Info" />
        </IconButton>
      </div>
      <div
        className="flex gap-2 items-center"
        style={{ width: VELOCITY_PRESSURE_FULL_PANEL_4_R_WIDTH }}
      >
        <DropList
          width={VELOCITY_PRESSURE_FULL_PANEL_5_R_WIDTH}
          itemList={[
            ["1", "1"],
            ["2", "2"],
            ["3", "3"],
            ["4", "4"],
          ]}
          onChange={(e: SelectChangeEvent) => {
            const selIndex = Number(e.target.value);
            setTempValueCallback({
              procedureFull: {
                degree: selIndex.toString() as TypeFull["degree"],
              } as TypeFull,
            });
          }}
          value={asFull(tempValue)?.degree ?? "1"}
          defaultValue={"1"}
          placeholder="Select ..."
        />
      </div>
    </GuideBox>
  );
}
