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
import InfoWrapper from "../../../../../../../../../../../common/InfoWrapper";

export default function DegreeOfExposure() {
  const { tempValue, setTempValueCallback, asFull } = useTemporaryValue();

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <div className="flex gap-0 items-center">
        <Typography>Degree of Exposure</Typography>

        <InfoWrapper
          tooltipProps={{
            left: -150,
            bottom: 30,
          }}
          tooltip={
            <GuideBox width={400} spacing={1}>
              <Typography variant="h1" color="gray">
                Degree of Exposure
              </Typography>
              <Typography>
                Refer to Table 3.9(1) for the degree of exposure.
              </Typography>
              <img
                src="./assets/Degree of Exposure.png"
                alt="Degree of exposure"
              />
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
