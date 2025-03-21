import { DropList, GuideBox, Typography } from "@midasit-dev/moaui";
import { PANEL_3_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";
import type { SelectChangeEvent } from "@mui/material";
import useTemporaryValue, {
  type TypeSimplified,
} from "../../../../../../../../../../../hooks/useTemporaryValue";

export default function CategoryOption3() {
  const { tempValue, setTempValueCallback, asSimplified } = useTemporaryValue();

  return (
    <>
      <GuideBox width="100%" horSpaceBetween row verCenter>
        <GuideBox row verCenter>
          <Typography>Degree of Exposure</Typography>
        </GuideBox>
        <DropList
          width={PANEL_3_R_WIDTH}
          itemList={[
            ["1", "1"],
            ["2", "2"],
            ["3", "3"],
            ["4", "4"],
          ]}
          onChange={(e: SelectChangeEvent) => {
            const selIndex = Number(e.target.value);
            setTempValueCallback({
              procedureSimplified: {
                degree: selIndex.toString() as TypeSimplified["degree"],
              } as TypeSimplified,
            });
          }}
          value={asSimplified(tempValue)?.degree ?? "1"}
          defaultValue={"1"}
          placeholder="Select ..."
        />
      </GuideBox>
    </>
  );
}
