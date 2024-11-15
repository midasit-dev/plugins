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

export default function ClimateChargingFactorKpc() {
  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <div className="flex gap-0 items-center">
        <Typography>Climate Changing Factor, Kpc</Typography>
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
            step: 0.01,
            condition: {
              min: "greater",
            },
          }}
          value={"1.22"}
          defaultValue="1.22"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log(e.target.value);
          }}
        />
      </div>
    </GuideBox>
  );
}
