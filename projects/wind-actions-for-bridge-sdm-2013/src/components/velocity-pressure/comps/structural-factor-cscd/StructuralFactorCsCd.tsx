import {
  GuideBox,
  TextFieldV2,
  Typography,
  Icon,
  IconButton,
} from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import {
  DEFAULT_MAIN_CSCD_VALUE,
  mainCsCdValueSelector,
} from "../../../../defines/applyDefines";
import InfoWrapper from "../../../common/InfoWrapper";
import TextFieldForRealNumber from "../../../common/TextFieldForRealNumber";
import { useEffect, useState } from "react";

export default function StructuralFactorCscd() {
  const [value, setValue] = useRecoilState(mainCsCdValueSelector);
  //임시 값
  const [tempValue, setTempValue] = useState<string>(
    value?.toString() ?? String(DEFAULT_MAIN_CSCD_VALUE)
  );
  const [isError, setIsError] = useState<boolean>(false);
  useEffect(() => {
    const isLessZero = Number(tempValue) <= 0;
    const isNotNumber = Number.isNaN(Number(tempValue));
    setIsError(isLessZero || isNotNumber);
    if (isLessZero || isNotNumber) return;

    setValue(Number(tempValue));
  }, [tempValue, setValue]);

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1" color={isError ? "#FF5733" : "primary"}>
        Structural Factor, CsCd
      </Typography>
      <InfoWrapper
        tooltipProps={{
          left: -130,
          bottom: 30,
        }}
        tooltip={
          <GuideBox width={300}>
            <Typography variant="h1" color="gray">
              Refer to Clause 3.4.5 (2)
            </Typography>
            <Typography>
              The size factor cs and the dynamic factor cd, shall both be taken
              as 1.0 for bridges that a “dynamic response procedure” is not
              needed.
            </Typography>
          </GuideBox>
        }
      >
        <IconButton transparent>
          <Icon iconName="Info" />
        </IconButton>
      </InfoWrapper>
      <TextFieldForRealNumber
        placeholder="Enter the value"
        width={PANEL_1_R_WIDTH}
        defaultValue={String(DEFAULT_MAIN_CSCD_VALUE)}
        onChange={(value: string) => setTempValue(value)}
        value={tempValue}
        error={isError}
        onlyPlusEnabled
      />
    </GuideBox>
  );
}
