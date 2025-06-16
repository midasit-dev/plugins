import { useRecoilState } from "recoil";
import { soilBasicState } from "../states";
import { useCallback, useMemo } from "react";
import { ChangeEvent, SyntheticEvent } from "react";

type InputChangeEvent = ChangeEvent<HTMLInputElement>;

export const useSoilBasic = () => {
  const [soilBasic, setSoilBasic] = useRecoilState(soilBasicState);

  const handleChange = useCallback(
    (fieldName: keyof typeof soilBasic) => (e: InputChangeEvent) => {
      const value = e.target.value;
      setSoilBasic((prev) => ({
        ...prev,
        [fieldName]:
          typeof prev[fieldName] === "number" ? Number(value) : value,
      }));
    },
    [setSoilBasic]
  );

  const handleCheckBoxChange = useCallback(
    (fieldName: keyof typeof soilBasic) =>
      (_: SyntheticEvent<Element, Event>, checked: boolean) => {
        setSoilBasic((prev) => ({
          ...prev,
          [fieldName]: checked,
        }));
      },
    [setSoilBasic]
  );

  const memoizedValues = useMemo(() => soilBasic, [soilBasic]);

  return {
    values: memoizedValues,
    handleChange,
    handleCheckBoxChange,
  };
};
