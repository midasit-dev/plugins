import { GuideBox, Typography, IconButton, Icon } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import {
  DEFAULT_MAIN_CF_VALUE,
  mainCfValueSelector,
} from "../../../../defines/applyDefines";
import InfoWrapper from "../../../common/InfoWrapper";
import { useEffect, useState } from "react";
import TextFieldForRealNumber from "../../../common/TextFieldForRealNumber";
import { isOpenCfDialogSelector } from "../../../../defines/openDefines";
import GraphSample from "./comps/GraphSample";
import { isBlurSelector } from "../../../../defines/blurDefines";

export default function ForceCoefficientCf() {
  const [isOpen, setIsOpen] = useRecoilState(isOpenCfDialogSelector);
  const [, setIsBlur] = useRecoilState(isBlurSelector);

  //전역 값
  const [value, setValue] = useRecoilState(mainCfValueSelector);

  //임시 값
  const [tempValue, setTempValue] = useState<string>(
    value?.toString() ?? String(DEFAULT_MAIN_CF_VALUE)
  );
  const [isError, setIsError] = useState<boolean>(false);

  //에러 및 전역 값 갱신을 위한 Hook
  useEffect(() => {
    const isLessZero = Number(tempValue) <= 0;
    const isNotNumber = Number.isNaN(Number(tempValue));
    setIsError(isLessZero || isNotNumber);
    if (isLessZero || isNotNumber) return;

    setValue(Number(tempValue));
  }, [tempValue, setValue]);

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      {/** 에러 상태에 따라 문자열 색상 표시 */}
      <Typography variant="h1" color={isError ? "#FF5733" : "primary"}>
        Force Coefficient, Cf
      </Typography>

      <InfoWrapper
        tooltipProps={{
          left: -130,
          bottom: 30,
        }}
        tooltip={
          <GuideBox width={300}>
            <Typography variant="h1" color="gray">
              Refer to Clause 3.4.6
            </Typography>
            <Typography>
              Force coefficients give the overall effect of the wind on a
              structure, structural element or component as a whole, including
              friction, if not specifically excluded.
            </Typography>
          </GuideBox>
        }
      >
        <IconButton transparent>
          <Icon iconName="Help" />
        </IconButton>
      </InfoWrapper>

      <div className="flex gap-4 items-center">
        {/** 텍스트 필드 교체 */}
        <TextFieldForRealNumber
          placeholder="Enter the value"
          width={161}
          defaultValue={String(DEFAULT_MAIN_CF_VALUE)}
          onChange={(value: string) => setTempValue(value)}
          value={tempValue}
          error={isError}
          onlyPlusEnabled
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

          {isOpen && <GraphSample />}
        </div>
      </div>
    </GuideBox>
  );
}
