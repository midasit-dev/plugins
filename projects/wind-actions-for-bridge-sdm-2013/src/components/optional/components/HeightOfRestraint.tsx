import {
  Check,
  GuideBox,
  Icon,
  IconButton,
  TextField,
  Typography,
} from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../defines/widthDefines";
import { useState } from "react";

export default function HeightOfRestraint() {
  const [isCheck, setIsCheck] = useState(false);

  return (
    <GuideBox width={"100%"} spacing={2}>
      <Title isCheck={isCheck} setIsCheck={setIsCheck} />
      <Options isCheck={isCheck} />
    </GuideBox>
  );
}

interface TitleProps {
  isCheck: boolean;
  setIsCheck: (value: boolean) => void;
}

function Title(props: TitleProps) {
  const { isCheck, setIsCheck } = props;

  return (
    <GuideBox width="100%" row>
      <Check
        name="Height of restraint (parapet of barrier)"
        checked={isCheck}
        onChange={(e: React.SyntheticEvent, checked: boolean) =>
          setIsCheck(checked)
        }
      />
      <IconButton transparent>
        <Icon iconName="Info" />
      </IconButton>
    </GuideBox>
  );
}

interface OptionsProps {
  isCheck: boolean;
}

function Options(props: OptionsProps) {
  const { isCheck } = props;

  return (
    <GuideBox
      show
      width={"100%"}
      padding={2}
      spacing={2}
      fill="#f4f5f6"
      borderRadius={2}
      opacity={isCheck ? 1 : 0.5}
    >
      <Typography>Height (m)</Typography>

      <GuideBox width={"100%"} horSpaceBetween row verCenter>
        <Typography variant="h1">I-End</Typography>
        <TextField
          width={PANEL_1_R_WIDTH}
          placeholder="Enter the value"
          disabled={!isCheck}
        />
      </GuideBox>

      <GuideBox width={"100%"} horSpaceBetween row verCenter>
        <Typography variant="h1">J-End</Typography>
        <TextField
          width={PANEL_1_R_WIDTH}
          placeholder="Enter the value"
          disabled={!isCheck}
        />
      </GuideBox>
    </GuideBox>
  );
}
