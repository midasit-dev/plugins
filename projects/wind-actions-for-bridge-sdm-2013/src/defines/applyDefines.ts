import { atom, selector } from "recoil";

export const selLoadCaseNameState = atom<[string, number]>({
  key: "selLoadCaseNameState",
  default: ["", 1],
});

export const selLoadCaseNameSelector = selector<[string, number]>({
  key: "selLoadCaseNameSelector",
  get: ({ get }) => {
    return get(selLoadCaseNameState);
  },
  set: ({ set }, newValue) => {
    set(selLoadCaseNameState, newValue);
  },
});

export type VelocityPressureCaseProcedureSimplified = {
  category: 1 | 2 | 3;
  location?: 1 | 2;
  period?: number;
  degree?: 1 | 2 | 3 | 4;
};

export type VelocityPressureCaseProcedureFull = {
  value: null;
};

export type VelocityPressureCaseType = {
  name: string;
  value: number;
  procedure: {
    name: "simplified" | "full";
    value:
      | VelocityPressureCaseProcedureSimplified
      | VelocityPressureCaseProcedureFull;
  };
};

// 생성된 케이스들
export const velocityPressureCases = atom<VelocityPressureCaseType[] | null>({
  key: "velocityPressureCases",
  default: [
    {
      name: "name1",
      value: 1.0,
      procedure: {
        name: "simplified",
        value: { category: 1, location: 1, period: 120 },
      },
    },
    {
      name: "name2",
      value: 2.7,
      procedure: { name: "simplified", value: { category: 2, location: 1 } },
    },
    {
      name: "name3",
      value: 3.2,
      procedure: { name: "simplified", value: { category: 3, degree: 1 } },
    },
  ],
});

export const velocityPressureCasesSelector = selector<
  VelocityPressureCaseType[] | null
>({
  key: "velocityPressureCasesSelector",
  get: ({ get }) => {
    return get(velocityPressureCases);
  },
  set: ({ set }, newValue) => {
    set(velocityPressureCases, newValue);
  },
});

type VelocityPressureCaseRemoveProcedure = Omit<
  VelocityPressureCaseType,
  "procedure"
>;
type VelocityPressureCaseLight = {
  index: number;
  item: VelocityPressureCaseRemoveProcedure;
};

// 선택된 케이스 데이터 (기본 이름, 값만)
export const selVelocityPressureCaseLight =
  atom<VelocityPressureCaseLight | null>({
    key: "selVelocityPressureCaseLight",
    default: null,
  });

export const selVelocityPressureCaseLightSelector =
  selector<VelocityPressureCaseLight | null>({
    key: "selVelocityPressureCaseLightSelector",
    get: ({ get }) => {
      return get(selVelocityPressureCaseLight);
    },
    set: ({ set }, newValue) => {
      set(selVelocityPressureCaseLight, newValue);
    },
  });

// 선택된 케이스 데이터 (전체)
export const selVelocityPressureCaseSelector =
  selector<VelocityPressureCaseType | null>({
    key: "selVelocityPressureCaseSelector",
    get: ({ get }) => {
      const sel = get(selVelocityPressureCaseLight);
      const cases = get(velocityPressureCases);
      if (!sel || !cases) return null;
      return cases[sel.index];
    },
  });

// 기본 값
export const tempProcedureValueDefault: VelocityPressureCaseType = {
  name: "new name",
  value: 3.865,
  procedure: {
    name: "simplified",
    value: { category: 1, location: 1, period: 120 },
  },
};

// 임시 공간
export const TempProcedureValueState = atom<VelocityPressureCaseType | null>({
  key: "TempProcedureValueState",
  default: tempProcedureValueDefault,
});

export const TempProcedureValueSelector =
  selector<VelocityPressureCaseType | null>({
    key: "TempProcedureValueSelector",
    get: ({ get }) => {
      return get(TempProcedureValueState);
    },
    set: ({ set }, newValue) => {
      set(TempProcedureValueState, newValue);
    },
  });

// 임시 플래그 ADD / MOD
export const TempProcedureFlagState = atom<"add" | "modify" | null>({
  key: "TempProcedureFlagState",
  default: null,
});

export const TempProcedureFlagSelector = selector<"add" | "modify" | null>({
  key: "TempProcedureFlagSelector",
  get: ({ get }) => {
    return get(TempProcedureFlagState);
  },
  set: ({ set }, newValue) => {
    set(TempProcedureFlagState, newValue);
  },
});
