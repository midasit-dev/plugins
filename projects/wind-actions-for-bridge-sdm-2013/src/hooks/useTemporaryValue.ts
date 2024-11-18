import { useRecoilState } from "recoil";
import {
  TempProcedureValueSelector,
  type VelocityPressureCaseProcedureFull,
  type VelocityPressureCaseProcedureSimplified,
} from "../defines/applyDefines";
import { useCallback } from "react";
import type { VelocityPressureCaseType } from "../defines/applyDefines";

type TypeRoot = VelocityPressureCaseType;
export type TypeSimplified = VelocityPressureCaseProcedureSimplified;
export type TypeFull = VelocityPressureCaseProcedureFull;

export default function useTemporaryValue() {
  const [tempValue, setTempValue] = useRecoilState(TempProcedureValueSelector);

  const setTempValueCallback = useCallback(
    (data: Partial<TypeRoot>) => {
      setTempValue((prev: TypeRoot | null) => {
        if (!data) return prev;

        const payload = {
          ...prev,

          ...(data.name ? { name: data.name } : {}),
          ...(data.value ? { value: data.value } : {}),
          ...(data.procedureIndex
            ? { procedureIndex: data.procedureIndex }
            : {}),
        };

        const simplified = data.procedureValue as TypeSimplified;
        if (payload.procedureIndex === 1 && simplified !== undefined) {
          return {
            ...payload,

            procedureValue: {
              ...prev?.procedureValue,

              ...(simplified.category ? { category: simplified.category } : {}),
              ...(simplified.location ? { location: simplified.location } : {}),
              ...(simplified.period ? { period: simplified.period } : {}),
              ...(simplified.degree ? { degree: simplified.degree } : {}),
            } as TypeSimplified,
          } as TypeRoot;
        }

        const full = data.procedureValue as TypeFull;
        if (payload.procedureIndex === 2 && full !== undefined) {
          return {
            ...payload,

            procedureValue: {
              ...prev?.procedureValue,

              ...(full.velocity ? { velocity: full.velocity } : {}),
              ...(full.refZ ? { refZ: full.refZ } : {}),
              ...(full.horLoadLength
                ? { horLoadLength: full.horLoadLength }
                : {}),
              ...(full.degree ? { degree: full.degree } : {}),
              coz: {
                ...(prev?.procedureValue as TypeFull).coz,

                ...(full.coz?.value ? { value: full.coz.value } : {}),
                ...(full.coz?.location ? { location: full.coz.location } : {}),
                ...(full.coz?.h ? { h: full.coz.h } : {}),
                ...(full.coz?.ld ? { ld: full.coz.ld } : {}),
                ...(full.coz?.lu ? { lu: full.coz.lu } : {}),
                ...(full.coz?.refZ ? { refZ: full.coz.refZ } : {}),
                ...(full.coz?.loadLength
                  ? { loadLength: full.coz.loadLength }
                  : {}),
              },
              ...(full.kpc ? { kpc: full.kpc } : {}),
            } as TypeFull,
          } as TypeRoot;
        }

        return payload as TypeRoot;
      });
    },
    [setTempValue]
  );

  const asSimplified = useCallback(
    (data: TypeRoot | null): TypeSimplified | null => {
      if (!data) return null;
      return data.procedureValue as TypeSimplified;
    },
    []
  );

  const asFull = useCallback((data: TypeRoot | null): TypeFull | null => {
    if (!data) return null;
    return data.procedureValue as TypeFull;
  }, []);

  return {
    tempValue,
    setTempValueCallback: setTempValueCallback,

    asSimplified,
    asFull,
  };
}
