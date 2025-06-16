import { useRecoilState } from "recoil";
import { pileBasicDimState } from "../states";
import { useCallback } from "react";

interface ChangeEvent {
  target: {
    value: string;
  };
}

export const usePileBasicDim = () => {
  const [dimensions, setDimensions] = useRecoilState(pileBasicDimState);

  const handleChange = useCallback(
    (fieldName: keyof typeof dimensions) => (e: ChangeEvent) => {
      const value = e.target.value;
      setDimensions((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    },
    [setDimensions]
  );

  return {
    values: dimensions,
    handleChange,
  };
};
