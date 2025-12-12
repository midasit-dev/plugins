import { Button } from "@midasit-dev/moaui";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import { useCallback } from "react";
import { simplified_calculate_qp } from "../../../../../../../../../../utils_pyscript";
import { useDelayCallback } from "../../../../../../../../../../utils/loadingUtils";

//TEST Python 계산 연결부
export default function CalculateButton() {
  const { tempValue, setTempValueCallback } = useTemporaryValue();
  const { isPending, delayCallback } = useDelayCallback();

  const onClickHandler = useCallback(() => {
    delayCallback(() => {
      if (!tempValue?.procedureSimplified) return;

      // procedureSimplified에서 필요한 값 추출
      const { category, location, period, degree, reducedBy20 } =
        tempValue.procedureSimplified;

      // reducedBy20 값이 true이면 applyReduction 적용
      const applyReduction = reducedBy20 === true;

      // Python 함수 호출
      const calculatedValue = simplified_calculate_qp(
        category,
        location as string,
        period,
        degree,
        applyReduction // ✅ applyReduction 전달
      );

      // 계산된 값 업데이트
      setTempValueCallback({
        value: calculatedValue,
      });
    });
  }, [delayCallback, setTempValueCallback, tempValue?.procedureSimplified]);

  return (
    <Button
      color="negative"
      width="100%"
      onClick={onClickHandler}
      loading={isPending}
    >
      Calculate
    </Button>
  );
}
