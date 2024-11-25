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
import useTemporaryValue, {
  type TypeFull,
} from "../../../../../../../../../../../../hooks/useTemporaryValue";
import InfoWrapper from "../../../../../../../../../../../common/InfoWrapper";

interface HorizontalWindLoadLengthProps {
  disabled?: boolean;
}
export default function HorizontalWindLoadLength({
  disabled = false,
}: HorizontalWindLoadLengthProps) {
  const { tempValue, setTempValueCallback, asFull } = useTemporaryValue();

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

        <InfoWrapper
          tooltipProps={{
            left: -100,
            bottom: 30,
          }}
          tooltip={
            <GuideBox width={130} center>
              <Typography variant="h1" color="gray">
                Refer to Table 3.9(2)
              </Typography>
            </GuideBox>
          }
        >
          <IconButton transparent>
            <Icon iconName="Help" />
          </IconButton>
        </InfoWrapper>
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
          value={asFull(tempValue)?.horLoadLength?.toString() ?? "600"}
          defaultValue="600"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCallback({
              procedureFull: {
                horLoadLength: Number(e.target.value),
              } as TypeFull,
            });
          }}
        />
        <Typography>m</Typography>
      </div>
    </div>
  );
}
