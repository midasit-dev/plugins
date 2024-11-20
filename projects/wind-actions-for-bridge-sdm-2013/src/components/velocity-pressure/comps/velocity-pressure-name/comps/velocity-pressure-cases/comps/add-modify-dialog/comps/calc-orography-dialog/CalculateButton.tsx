import { Button } from "@midasit-dev/moaui";
import { useCallback } from "react";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import { full_calculate_coz } from "../../../../../../../../../../utils_pyscript";
import useTemporaryValueCozOptions from "../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import { useDelayCallback } from "../../../../../../../../../../utils/loadingUtils";

function toFixed3Number(value: number) {
  return Number(value.toFixed(3));
}

//TEST Python 계산 연결부
export default function CalculateButton() {
  const { tempValue } = useTemporaryValue();
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();
  const { isPending, delayCallback } = useDelayCallback();

  const onClickHandler = useCallback(() => {
    delayCallback(() => {
      if (!tempValue?.procedureFull) return;
      if (!tempValueCozOptions) return;

      const { velocity } = tempValue.procedureFull;
      const { refZ, h, lu, ld, x, loadLength, orographyType, location } =
        tempValueCozOptions;
      if (
        velocity === undefined ||
        refZ === undefined ||
        h === undefined ||
        lu === undefined ||
        ld === undefined ||
        x === undefined ||
        loadLength === undefined ||
        orographyType === undefined ||
        location === undefined
      ) {
        console.error(
          'there are undefined values in "cozOptions"',
          velocity,
          refZ,
          h,
          lu,
          ld,
          x,
          loadLength,
          orographyType,
          location
        );
        return;
      }

      const calculatedValue = full_calculate_coz(
        velocity,
        refZ,
        h,
        lu,
        ld,
        x,
        loadLength,
        orographyType,
        location
      );

      if (calculatedValue === null) {
        console.error("Error in full_calculate_coz");
        return;
      }

      const rawSb = calculatedValue.sb;
      const rawSc = calculatedValue.sc;
      const rawCoz = calculatedValue.coz;

      // console.log(
      //   velocity,
      //   refZ,
      //   h,
      //   lu,
      //   ld,
      //   x,
      //   loadLength,
      //   orographyType,
      //   location
      // );
      console.log("calculatedValue:", calculatedValue);

      setTempValueCozOptionsCallback({
        sbz: rawSb !== "null" ? toFixed3Number(rawSb) : "N.A",
        scz: rawSc !== "null" ? toFixed3Number(rawSc) : "N.A",
        coz: toFixed3Number(rawCoz),
      });
    });
  }, [
    delayCallback,
    setTempValueCozOptionsCallback,
    tempValue?.procedureFull,
    tempValueCozOptions,
  ]);

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
