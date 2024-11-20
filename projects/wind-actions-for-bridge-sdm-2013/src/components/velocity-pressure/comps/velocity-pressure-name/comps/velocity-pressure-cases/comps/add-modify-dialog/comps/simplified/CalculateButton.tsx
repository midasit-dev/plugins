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

      const { category, location, period, degree } =
        tempValue.procedureSimplified;

      const calculatedValue = simplified_calculate_qp(
        category,
        location as string,
        period,
        degree
      );

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
