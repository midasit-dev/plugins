import { GuideBox, TextField, Typography } from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import { mainTargetElementsSelector } from "../../../defines/applyDefines";

export default function TargetElements() {
  const [value, setValue] = useRecoilState(mainTargetElementsSelector);

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <Typography variant="h1">Target Elements</Typography>
      <TextField
        width={PANEL_1_R_WIDTH}
        placeholder="Select the elements ..."
        value={value?.join(",") ?? ""}
      />
    </GuideBox>
  );
}
