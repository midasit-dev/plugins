import {
  Check,
  GuideBox,
  Icon,
  IconButton,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import { PANEL_2_R_WIDTH } from "../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import { mainHeightOfRestraintSelector } from "../../../defines/applyDefines";
import InfoWrapper from "../../common/InfoWrapper";

export default function HeightOfRestraint() {
  return (
    <GuideBox width={"100%"} spacing={2}>
      <Title />
      <Options />
    </GuideBox>
  );
}

function Title() {
  const [value, setValue] = useRecoilState(mainHeightOfRestraintSelector);

  return (
    <GuideBox width="100%" row>
      <Check
        name="Height of restraint"
        checked={value?.isCheck ?? false}
        onChange={(e: React.SyntheticEvent, checked: boolean) =>
          setValue((prev) => ({ ...prev, isCheck: checked }))
        }
      />

      <InfoWrapper
        tooltipProps={{
          left: -130,
          bottom: 30,
        }}
        tooltip={
          <GuideBox width={400} spacing={1}>
            <Typography variant="h1" color="gray">
              Height of restraint
            </Typography>
            <img
              src="./assets/Height_of_restraint.png"
              alt="Height of restraint"
            />
            <Typography>
              This option applies the pressure loadby considering the height of
              the restraint,such as a parapet or barrier, that is not part of
              the model.
            </Typography>
            <Typography>
              The additional height is measured from the top in the local y or z
              (+) direction, depending on the load direction.
            </Typography>
          </GuideBox>
        }
      >
        <IconButton transparent>
          <Icon iconName="Help" />
        </IconButton>
      </InfoWrapper>
    </GuideBox>
  );
}

function Options() {
  const [value, setValue] = useRecoilState(mainHeightOfRestraintSelector);

  return (
    <GuideBox
      show
      width={"100%"}
      padding={2}
      spacing={2}
      fill="#f4f5f6"
      borderRadius={2}
      opacity={value?.isCheck ? 1 : 0.5}
    >
      <Typography>Height (m)</Typography>

      <GuideBox width={"100%"} horSpaceBetween row verCenter>
        <Typography variant="h1">I-End</Typography>
        <TextFieldV2
          type="number"
          numberOptions={{
            min: 0.0,
            step: 0.1,
          }}
          value={(value?.iEnd ?? "0.0").toString()}
          defaultValue="0.0"
          width={PANEL_2_R_WIDTH}
          placeholder="Enter the value"
          disabled={!value?.isCheck}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = Number.parseFloat(e.target.value);
            setValue((prev) => ({ ...prev, iEnd: newValue }));
          }}
        />
      </GuideBox>

      <div className="w-full flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div
            style={{
              pointerEvents: value?.isCheckJEnd ? "auto" : "none",
              opacity: value?.isCheckJEnd ? 1 : 0.5,
            }}
          >
            <Typography variant="h1">J-End</Typography>
          </div>
          <Check
            checked={value?.isCheckJEnd ?? false}
            onChange={(e: React.SyntheticEvent, checked: boolean) => {
              setValue((prev) => ({ ...prev, isCheckJEnd: checked }));
            }}
          />
        </div>

        <div
          style={{
            pointerEvents: value?.isCheckJEnd ? "auto" : "none",
            opacity: value?.isCheckJEnd ? 1 : 0.5,
          }}
        >
          <TextFieldV2
            type="number"
            numberOptions={{
              min: 0.0,
              step: 0.1,
            }}
            value={(value?.jEnd ?? "0.0").toString()}
            defaultValue="0.0"
            width={PANEL_2_R_WIDTH}
            placeholder="Enter the value"
            disabled={!value?.isCheck}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newValue = Number.parseFloat(e.target.value);
              setValue((prev) => ({ ...prev, jEnd: newValue }));
            }}
          />
        </div>
      </div>
    </GuideBox>
  );
}
