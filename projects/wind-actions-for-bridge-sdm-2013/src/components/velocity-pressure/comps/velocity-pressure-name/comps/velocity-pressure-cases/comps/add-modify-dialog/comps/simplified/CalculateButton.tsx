import { Button } from "@midasit-dev/moaui";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import { useCallback } from "react";
import { simplified_calculate_qp } from "../../../../../../../../../../utils_pyscript";

//TEST Python 계산 연결부
export default function CalculateButton() {
  const { tempValue, setTempValueCallback } = useTemporaryValue();

  const onClickHandler = useCallback(() => {
    if (!tempValue?.procedureSimplified) return;

    const { category, location, period, degree } =
      tempValue.procedureSimplified;

    const calculatedValue = simplified_calculate_qp(
      category,
      location as string,
      period,
      degree
    );

    // console.log(category, location, period, degree);
    // console.log("calculatedValue:", calculatedValue);
    setTempValueCallback({
      value: calculatedValue,
    });
  }, [setTempValueCallback, tempValue?.procedureSimplified]);

  return (
    <Button color="negative" width="100%" onClick={onClickHandler}>
      Calculate
    </Button>
  );
}
