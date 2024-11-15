import {
  GuideBox,
  Icon,
  IconButton,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import {
  VELOCITY_PRESSURE_FULL_PANEL_4_R_WIDTH,
  VELOCITY_PRESSURE_FULL_PANEL_5_R_WIDTH,
} from "../../../../../../../../../../../../defines/widthDefines";

interface HorizontalWindLoadLengthProps {
  disabled?: boolean;
}
export default function HorizontalWindLoadLength({
  disabled = false,
}: HorizontalWindLoadLengthProps) {
  return (
    <div
      className="w-full flex justify-between items-center"
      style={{
        pointerEvents: disabled ? "none" : "auto",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div className="flex gap-0 items-center">
        <Typography>Horizontal Wind Load Length</Typography>
        <IconButton transparent>
          <Icon iconName="Info" />
        </IconButton>
      </div>
      <div
        className="flex gap-2 items-center"
        style={{ width: VELOCITY_PRESSURE_FULL_PANEL_4_R_WIDTH }}
      >
        <TextFieldV2
          width={VELOCITY_PRESSURE_FULL_PANEL_5_R_WIDTH}
          placeholder="Enter the period ..."
          type="number"
          numberOptions={{
            min: 0,
            step: 1,
            condition: {
              min: "greater",
            },
          }}
          value={"600"}
          defaultValue="600"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log(e.target.value);
          }}
        />
        <Typography>m</Typography>
      </div>
    </div>
  );
}
