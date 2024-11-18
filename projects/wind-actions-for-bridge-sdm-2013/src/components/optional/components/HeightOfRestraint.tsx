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
        name="Height of restraint (parapet of barrier)"
        checked={value?.isCheck ?? false}
        onChange={(e: React.SyntheticEvent, checked: boolean) =>
          setValue((prev) => ({ ...prev, isCheck: checked }))
        }
      />
      <IconButton transparent>
        <Icon iconName="Info" />
      </IconButton>
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
        />
      </GuideBox>

      <GuideBox width={"100%"} horSpaceBetween row verCenter>
        <Typography variant="h1">J-End</Typography>
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
        />
      </GuideBox>
    </GuideBox>
  );
}
