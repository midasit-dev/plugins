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
    (data: Partial<TypeRoot> | null) => {
      setTempValue((prev: TypeRoot | null) => {
        if (data === null) return null;
        if (!data) return prev;

        let payload = {
          ...prev,

          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.value !== undefined ? { value: data.value } : {}),
          ...(data.procedureIndex !== undefined
            ? { procedureIndex: data.procedureIndex }
            : {}),
        };

        const simplified = data.procedureSimplified as TypeSimplified;
        if (simplified !== undefined) {
          payload = {
            ...payload,

            procedureSimplified: {
              ...prev?.procedureSimplified,

              ...(simplified.category !== undefined
                ? { category: simplified.category }
                : {}),
              ...(simplified.location !== undefined
                ? { location: simplified.location }
                : {}),
              ...(simplified.period !== undefined
                ? { period: simplified.period }
                : {}),
              ...(simplified.degree !== undefined
                ? { degree: simplified.degree }
                : {}),
            } as TypeSimplified,
          } as TypeRoot;
        }

        const full = data.procedureFull as TypeFull;
        if (full !== undefined) {
          payload = {
            ...payload,

            procedureFull: {
              ...prev?.procedureFull,

              ...(full.velocity !== undefined
                ? { velocity: full.velocity }
                : {}),
              ...(full.refZ !== undefined ? { refZ: full.refZ } : {}),
              ...(full.horLoadLength !== undefined
                ? { horLoadLength: full.horLoadLength }
                : {}),
              ...(full.degree !== undefined ? { degree: full.degree } : {}),
              ...(full.cozValue !== undefined
                ? { cozValue: full.cozValue }
                : {}),

              cozOptions: {
                ...(prev?.procedureFull as TypeFull)?.cozOptions,

                ...(full.cozOptions?.location !== undefined
                  ? { location: full.cozOptions.location }
                  : {}),
                ...(full.cozOptions?.h !== undefined
                  ? { h: full.cozOptions.h }
                  : {}),
                ...(full.cozOptions?.ld !== undefined
                  ? { ld: full.cozOptions.ld }
                  : {}),
                ...(full.cozOptions?.lu !== undefined
                  ? { lu: full.cozOptions.lu }
                  : {}),
                ...(full.cozOptions?.refZ !== undefined
                  ? { refZ: full.cozOptions.refZ }
                  : {}),
                ...(full.cozOptions?.loadLength !== undefined
                  ? { loadLength: full.cozOptions.loadLength }
                  : {}),
              },
              ...(full.kpc !== undefined ? { kpc: full.kpc } : {}),
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
      return data.procedureSimplified as TypeSimplified;
    },
    []
  );

  const asFull = useCallback((data: TypeRoot | null): TypeFull | null => {
    if (!data) return null;
    return data.procedureFull as TypeFull;
  }, []);

  return {
    tempValue,
    setTempValueCallback: setTempValueCallback,

    asSimplified,
    asFull,
  };
}
