import {
  GuideBox,
  Typography,
  TextFieldV2,
  IconButton,
  Icon,
} from "@midasit-dev/moaui";
import {
  VELOCITY_PRESSURE_FULL_PANEL_4_R_WIDTH,
  VELOCITY_PRESSURE_FULL_PANEL_5_R_WIDTH,
} from "../../../../../../../../../../../../defines/widthDefines";
import CalcOrographyDialog from "../../../calc-orography-dialog/CalcOrographyDialog";
import { useRecoilState } from "recoil";
import { isOpenCalcOrographyDialogSelector } from "../../../../../../../../../../../../defines/openDefines";
import useTemporaryValue, {
  type TypeFull,
} from "../../../../../../../../../../../../hooks/useTemporaryValue";
import InfoWrapper from "../../../../../../../../../../../common/InfoWrapper";

export default function OrgraphyEffectFactorCoz() {
  const [isOpen, setIsOpen] = useRecoilState(isOpenCalcOrographyDialogSelector);
  const { tempValue, setTempValueCallback, asFull } = useTemporaryValue();
  const currentVelocity = asFull(tempValue)?.velocity;

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <div className="flex gap-0 items-center">
        <Typography>Orography Effect Factor, Co(z)</Typography>

        <InfoWrapper
          tooltipProps={{
            left: -150,
            bottom: 30,
          }}
          tooltip={
            <GuideBox width={300} spacing={1}>
              {currentVelocity === "Peak Velocity" && (
                <div>
                  <Typography variant="h1" color="gray">
                    Co(z) for qpb(z)
                  </Typography>
                  <img
                    src="./assets/coz_peak_wind.png"
                    alt="Co(z) for qpb(z)"
                  />
                </div>
              )}
              {currentVelocity === "Mean Velocity" && (
                <div>
                  <Typography variant="h1" color="gray">
                    Co(z) for qb'(z)
                  </Typography>
                  <img
                    src="./assets/coz_mean_wind.png"
                    alt="Co(z) for qb'(z)"
                  />
                </div>
              )}
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
            min: 0.0,
            step: 0.1,
            condition: {
              min: "greater",
            },
          }}
          value={asFull(tempValue)?.cozValue?.toString() ?? "1.0"}
          defaultValue="1.0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCallback({
              procedureFull: {
                cozValue: Number(e.target.value),
              } as TypeFull,
            });
          }}
        />
        <IconButton
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <Icon iconName="MoreHoriz" />
        </IconButton>

        {isOpen && <CalcOrographyDialog />}
      </div>
    </GuideBox>
  );
}
