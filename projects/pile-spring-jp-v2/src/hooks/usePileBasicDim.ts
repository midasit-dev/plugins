import { useRecoilState } from "recoil";
import { pileBasicDimState } from "../states";
import { ChangeEvent, useCallback } from "react";

type InputChangeEvent = ChangeEvent<HTMLInputElement>;

export const usePileBasicDim = () => {
  const [dimensions, setDimensions] = useRecoilState(pileBasicDimState);

  const handleChange = useCallback(
    (fieldName: keyof typeof dimensions) => (e: InputChangeEvent) => {
      const value = e.target.value;
      setDimensions((prev) => ({
        ...prev,
        [fieldName]:
          typeof prev[fieldName] === "number" ? Number(value) : value,
      }));
    },
    [setDimensions]
  );

  return {
    values: dimensions,
    handleChange,
  };
};
