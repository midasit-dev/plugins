import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import {
  VELOCITY_PRESSURE_FULL_PANEL_4_R_WIDTH,
  VELOCITY_PRESSURE_FULL_PANEL_5_R_WIDTH,
} from "../../../../../../../../../../../../defines/widthDefines";

export default function ReferenceHeightForTheWindAction() {
  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography center>Reference height for the wind action(z)</Typography>

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
          value={"50"}
          defaultValue="50"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log(e.target.value);
          }}
        />
        <Typography>m</Typography>
      </div>
    </GuideBox>
  );
}
