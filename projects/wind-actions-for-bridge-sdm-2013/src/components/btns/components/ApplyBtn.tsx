import { Button } from "@midasit-dev/moaui";
import { apply } from "../../../utils_pyscript";
import { useCallback } from "react";
import { useRecoilValue } from "recoil";
import {
  mainCfValueSelector,
  mainCsCdValueSelector,
  mainHeightOfRestraintSelector,
  mainSelDirectionSelector,
  mainSelVelocityPressureValueSelector,
  mainTargetElementsSelector,
  selLoadCaseNameSelector,
} from "../../../defines/applyDefines";
import { enqueueSnackbar } from "notistack";

//TEST Python 계산 연결부
export default function ApplyBtn() {
  const lcName = useRecoilValue(selLoadCaseNameSelector);
  const targetElements = useRecoilValue(mainTargetElementsSelector);
  const direction = useRecoilValue(mainSelDirectionSelector);
  const windPressureValue = useRecoilValue(
    mainSelVelocityPressureValueSelector
  );
  const cf = useRecoilValue(mainCfValueSelector);
  const csCd = useRecoilValue(mainCsCdValueSelector);
  const additional = useRecoilValue(mainHeightOfRestraintSelector);

  const onClickHandler = useCallback(() => {
    if (
      null === lcName ||
      null === targetElements ||
      null === direction ||
      null === windPressureValue ||
      null === cf ||
      null === csCd ||
      null === additional ||
      null === additional.isCheck ||
      null === additional.iEnd ||
      null === additional.jEnd ||
      null === additional.isCheckJEnd
    ) {
      enqueueSnackbar("There are undefined values in 'Apply'", {
        variant: "error",
      });

      console.error(
        'there are undefined values in "ApplyBtn"',
        lcName,
        targetElements,
        direction,
        windPressureValue,
        cf,
        csCd,
        additional
      );

      return;
    }

    apply(
      lcName,
      targetElements,
      direction,
      windPressureValue,
      cf,
      csCd,
      additional.isCheck,
      additional.iEnd,
      additional.jEnd,
      additional.isCheckJEnd
    );

    enqueueSnackbar("Successfully applied!", {
      variant: "success",
    });
  }, [
    additional,
    cf,
    csCd,
    direction,
    lcName,
    targetElements,
    windPressureValue,
  ]);

  return (
    <Button variant="contained" color="negative" onClick={onClickHandler}>
      Apply
    </Button>
  );
}
