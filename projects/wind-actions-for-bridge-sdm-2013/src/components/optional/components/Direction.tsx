import { DropList, GuideBox, TextField, Typography } from "@midasit-dev/moaui";
import type { SelectChangeEvent } from "@mui/material";
import { PANEL_1_R_WIDTH } from "../../../defines/widthDefines";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  mainHeightOfRestraintSelector,
  mainSelDirectionSelector,
} from "../../../defines/applyDefines";
import { useEffect, useState } from "react";

export default function Direction() {
  const [value, setValue] = useRecoilState(mainSelDirectionSelector);

  const heightOfRestraint = useRecoilValue(mainHeightOfRestraintSelector);

  const [items, setItems] = useState<[string, string | number][]>();

  useEffect(() => {
    // 옵션 체크 시, 2가지 방향만 지원!
    if (heightOfRestraint?.isCheck) {
      setItems([
        ["Local y+", "LY+"],
        ["Local y-", "LY-"],
      ]);
    } else {
      setItems([
        ["Local y+", "LY+"],
        ["Local y-", "LY-"],
        ["Local z+", "LZ+"],
        ["Local z-", "LZ-"],
      ]);
    }
  }, [heightOfRestraint?.isCheck]);

  // 옵션 체크하면, items 갯수가 줄기때문에 방향을 LY+로 강제 변경.
  useEffect(() => {
    if ((value === "LZ+" || value === "LZ-") && heightOfRestraint?.isCheck) {
      setValue("LY+");
    }
  }, [heightOfRestraint?.isCheck, setValue, value]);

  return (
    <GuideBox width={"100%"} horSpaceBetween verCenter row>
      <Typography variant="h1">Direction</Typography>
      <DropList
        width={PANEL_1_R_WIDTH}
        itemList={items as [string, string | number][]}
        onChange={(e: SelectChangeEvent) => {
          setValue(e.target.value as string);
        }}
        value={value}
        defaultValue={value}
        placeholder="Select ..."
      />
    </GuideBox>
  );
}
