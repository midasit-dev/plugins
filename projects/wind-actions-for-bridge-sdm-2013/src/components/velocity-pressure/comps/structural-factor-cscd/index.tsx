import { GuideBox, TextField, Typography } from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../../defines/widthDefines";

export default function StructuralFactorCscd() {
  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1">Structural Factor, CsCd</Typography>
      <TextField width={PANEL_1_R_WIDTH} placeholder="Enter the value" />
    </GuideBox>
  );
}
