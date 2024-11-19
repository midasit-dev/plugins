import { useRecoilState } from "recoil";
import {
  TempProcedureValueCozOptionsSelector,
  type VelocityPressureCaseProcedureFull,
  type VelocityPressureCaseProcedureSimplified,
} from "../defines/applyDefines";
import { useCallback } from "react";

export type TypeSimplified = VelocityPressureCaseProcedureSimplified;
export type TypeFull = VelocityPressureCaseProcedureFull;

export default function useTemporaryValueCozOptions() {
  const [tempValueCozOptions, setTempValueCozOptions] = useRecoilState(
    TempProcedureValueCozOptionsSelector
  );

  const setTempValueCozOptionsCallback = useCallback(
    (data: Partial<TypeFull["cozOptions"]> | null) => {
      setTempValueCozOptions((prev: TypeFull["cozOptions"] | null) => {
        if (!data) return prev;

        const payload = {
          ...prev,

          ...(data.orographyType !== undefined
            ? { orographyType: data.orographyType }
            : {}),
          ...(data.location !== undefined ? { location: data.location } : {}),
          ...(data.h !== undefined ? { h: data.h } : {}),
          ...(data.ld !== undefined ? { ld: data.ld } : {}),
          ...(data.lu !== undefined ? { lu: data.lu } : {}),
          ...(data.refZ !== undefined ? { refZ: data.refZ } : {}),
          ...(data.x !== undefined ? { x: data.x } : {}),
          ...(data.loadLength !== undefined
            ? { loadLength: data.loadLength }
            : {}),
          ...(data.sbz !== undefined ? { sbz: data.sbz } : {}),
          ...(data.scz !== undefined ? { scz: data.scz } : {}),
          ...(data.coz !== undefined ? { coz: data.coz } : {}),
        };

        return payload;
      });
    },
    [setTempValueCozOptions]
  );

  return {
    tempValueCozOptions,
    setTempValueCozOptionsCallback,
  };
}
