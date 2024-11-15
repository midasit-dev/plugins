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

        // full일 경우

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

  return {
    tempValue,
    setTempValueCallback: setTempValueCallback,

    asSimplified,
  };
}
