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

export default function OrgraphyEffectFactorCoz() {
  const [isOpen, setIsOpen] = useRecoilState(isOpenCalcOrographyDialogSelector);
  const { tempValue, setTempValueCallback, asFull } = useTemporaryValue();

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <div className="flex gap-0 items-center">
        <Typography>Orography Effect Factor, Co(z)</Typography>
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
            step: 0.1,
            condition: {
              min: "greater",
            },
          }}
          value={asFull(tempValue)?.coz?.value?.toString() ?? "1.0"}
          defaultValue="1.0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCallback({
              procedureValue: {
                coz: { value: Number(e.target.value) },
              } as TypeFull,
            });
          }}
        />
        <IconButton onClick={() => setIsOpen(true)}>
          <Icon iconName="MoreHoriz" />
        </IconButton>

        {isOpen && <CalcOrographyDialog />}
      </div>
    </GuideBox>
  );
}
