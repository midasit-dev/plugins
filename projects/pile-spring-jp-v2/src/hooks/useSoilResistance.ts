import { useRecoilState } from "recoil";
import { soilResistanceState, SoilResistance } from "../states";
import { useCallback, ChangeEvent, SyntheticEvent } from "react";

type NumberField = Extract<
  keyof SoilResistance,
  "tipCapacity" | "groundSlopeAngle" | "groundSurfaceLoad"
>;
type StringField = Extract<keyof SoilResistance, "clayFrictionMethod">;

export const useSoilResistance = () => {
  const [soilResis, setSoilResis] = useRecoilState(soilResistanceState);

  const handleChange = useCallback(
    (fieldName: NumberField | StringField) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setSoilResis((prev) => ({
          ...prev,
          [fieldName]:
            fieldName === "clayFrictionMethod" ? value : Number(value),
        }));
      },
    [setSoilResis]
  );

  const handleCheckBoxChange = useCallback(
    (_: SyntheticEvent, checked: boolean) => {
      setSoilResis((prev) => ({
        ...prev,
        useResistance: checked,
      }));
    },
    [setSoilResis]
  );

  return {
    values: soilResis,
    handleChange,
    handleCheckBoxChange,
  };
};
