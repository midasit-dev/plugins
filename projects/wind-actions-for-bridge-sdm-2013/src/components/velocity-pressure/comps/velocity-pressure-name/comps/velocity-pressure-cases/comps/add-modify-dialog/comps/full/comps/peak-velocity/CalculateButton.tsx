import { Button } from "@midasit-dev/moaui";
import { useCallback } from "react";
import useTemporaryValue from "../../../../../../../../../../../../hooks/useTemporaryValue";
import { full_peak_calculate_qp } from "../../../../../../../../../../../../utils_pyscript";
import { useDelayCallback } from "../../../../../../../../../../../../utils/loadingUtils";

//TEST Python 계산 연결부
export default function CalculateButton() {
  const { tempValue, setTempValueCallback } = useTemporaryValue();
  const { isPending, delayCallback } = useDelayCallback();

  const onClickHandler = useCallback(() => {
    delayCallback(() => {
      if (!tempValue?.procedureFull) return;

      const { refZ, horLoadLength, cozValue, degree, kpc } =
        tempValue.procedureFull;

      if (
        refZ === undefined ||
        horLoadLength === undefined ||
        cozValue === undefined ||
        degree === undefined ||
        kpc === undefined
      ) {
        console.error(
          "refZ, horLoadLength, cozValue, degree, kpc is undefined!"
        );
        return;
      }

      const calculatedValue = full_peak_calculate_qp(
        refZ,
        horLoadLength,
        cozValue,
        degree,
        kpc
      );

      // console.log(refZ, horLoadLength, cozValue, degree, kpc);
      // console.log("calculatedValue:", calculatedValue);
      setTempValueCallback({
        value: calculatedValue,
      });
    });
  }, [delayCallback, setTempValueCallback, tempValue?.procedureFull]);

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
