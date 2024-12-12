import {
  DropList,
  GuideBox,
  Typography,
  Icon,
  IconButton,
} from "@midasit-dev/moaui";
import type { SelectChangeEvent } from "@mui/material";
import { PANEL_1_R_WIDTH } from "../../../defines/widthDefines";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  mainHeightOfRestraintSelector,
  mainSelDirectionSelector,
} from "../../../defines/applyDefines";
import { useEffect, useState } from "react";
import InfoWrapper from "../../common/InfoWrapper";

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
      <div className="flex items-center">
        <Typography variant="h1">Loading Direction</Typography>
        <InfoWrapper
          tooltipProps={{
            left: -100,
            bottom: 30,
          }}
          tooltip={
            <GuideBox width={390} spacing={1}>
              <Typography variant="h1" color="gray">
                Set the direction of beam loads.
              </Typography>
              <Typography>
                Local y+/-: Beam load applied in the element local y(+) or
                y(-)direction.
              </Typography>
              <Typography>
                Local z+/-: Beam load applied in the element local z(+) or z(-)
                direction.
              </Typography>
              <img src="./assets/direction.png" alt="Loading Direction" />

              <Typography>
                If you want the wind pressure to be applied in this direction,
                set it to
              </Typography>
              <div>
                <Typography variant="h1"> Local y-.</Typography>
              </div>
            </GuideBox>
          }
        >
          <IconButton transparent>
            <Icon iconName="Help" />
          </IconButton>
        </InfoWrapper>
      </div>

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
