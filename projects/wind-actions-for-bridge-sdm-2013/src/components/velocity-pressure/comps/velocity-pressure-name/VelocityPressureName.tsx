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
import {
  velocityPressureCasesSelector,
  mainSelVelocityPressureSelector,
} from "../../../../defines/applyDefines";
import { useEffect } from "react";

export default function VelocityPressureName() {
  const [isOpen, setIsOpen] = useRecoilState(
    isOpenVelocityPressureCasesSelector
  );
  const [, setIsBlur] = useRecoilState(isBlurSelector);
  const cases = useRecoilValue(velocityPressureCasesSelector);

  const [selItem, setSelItem] = useRecoilState(mainSelVelocityPressureSelector);

  // selItem이 null인 경우, selItem을 cases의 첫번째 요소로 설정
  useEffect(() => {
    if (
      (!selItem || !cases?.some((item) => item.name === selItem)) &&
      cases &&
      cases.length > 0
    ) {
      setSelItem(cases[0].name);
    }
  }, [cases, selItem, setSelItem]);

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <Typography variant="h1">Velocity Pressure</Typography>

      <div className="flex gap-4 items-center">
        <DropList
          width={161}
          itemList={cases?.map((item, index) => [item.name, item.name]) ?? []}
          onChange={(e: SelectChangeEvent) => {
            setSelItem(e.target.value);
          }}
          value={selItem}
          defaultValue={selItem}
          placeholder="Select ..."
          disabled={!cases || cases?.length === 0}
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
