import type { SelectChangeEvent } from "@mui/material";
import {
  DropList,
  GuideBox,
  Icon,
  IconButton,
  Typography,
} from "@midasit-dev/moaui";
import VelocityPressureCases from "./comps/velocity-pressure-cases/VelocityPressureCases";
import { useRecoilState, useRecoilValue } from "recoil";
import { isBlurSelector } from "../../../../defines/blurDefines";
import { isOpenVelocityPressureCasesSelector } from "../../../../defines/openDefines";
import { velocityPressureCasesSelector } from "../../../../defines/applyDefines";
import { useState } from "react";

export default function VelocityPressureName() {
  const [isOpen, setIsOpen] = useRecoilState(
    isOpenVelocityPressureCasesSelector
  );
  const [, setIsBlur] = useRecoilState(isBlurSelector);
  const cases = useRecoilValue(velocityPressureCasesSelector);

  //TODO 이거슨 applyDefines로 옮기자!
  const [selPressure, setSelPressure] = useState<number>(1);

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <Typography variant="h1">Velocity Pressure</Typography>

      <div className="flex gap-4 items-center">
        <DropList
          width={161}
          itemList={
            cases?.map((item, index) => [item.name, index + 1]) ?? [["", 1]]
          }
          onChange={(e: SelectChangeEvent) => {
            const selIndex = Number(e.target.value);
            setSelPressure(selIndex);
          }}
          value={selPressure}
          placeholder="Select ..."
        />

        <div className="relative">
          <IconButton
            onClick={() => {
              setIsOpen(!isOpen);
              setIsBlur(!isOpen);
            }}
          >
            <Icon iconName="MoreHoriz" />
          </IconButton>

          {isOpen && <VelocityPressureCases />}
        </div>
      </div>
    </GuideBox>
  );
}
