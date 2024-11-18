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

export enum SimplifiedCategoryEnum {
  TABLE_3_6 = "Table 3.6",
  TABLE_3_7 = "Table 3.7",
  TABLE_3_8 = "Table 3.8",
}

export enum SimplifiedLocationEnum {
  WAGLAN_ISLAND = "Waglan Island",
  HONG_KONG_OBSERVATION = "Hong Kong Observation",
  SHELTERED_LOCATION = "Sheltered Location",
  EXPOSED_LOCATION = "Exposed Location",
}

export type VelocityPressureCaseProcedureSimplified = {
  category: SimplifiedCategoryEnum;
  location?: SimplifiedLocationEnum;
  period?: number;
  degree?: "1" | "2" | "3" | "4";
};

export enum FullVelocityEnum {
  PEAK_VELOCITY = "Peak Velocity",
  MEAN_VELOCITY = "Mean Velocity",
}

export enum FullOrographyTypeEnum {
  CLIFFS_AND_ESCARPMENTS = "Cliffs and Escarpments",
  HILLS_AND_RIDGES = "Hills and Ridges",
}

export enum FullLocationEnum {
  UPWIND = "Upwind",
  DOWNWIND = "Downwind",
}

export type VelocityPressureCaseProcedureFull = {
  velocity: FullVelocityEnum;
  refZ?: number;
  horLoadLength?: number;
  degree?: "1" | "2" | "3" | "4";
  coz?: {
    value?: number;
    orographyType: FullOrographyTypeEnum;
    location?: FullLocationEnum;
    h?: number;
    ld?: number;
    lu?: number;
    refZ?: number;
    loadLength?: number;
  };
  kpc?: number;
};

export type VelocityPressureCaseType = {
  name: string;
  value: number;
  procedureIndex: 1 | 2; // 1: simplified, 2: full
  procedureValue:
    | VelocityPressureCaseProcedureSimplified
    | VelocityPressureCaseProcedureFull;
};

// 생성된 케이스들
export const velocityPressureCases = atom<VelocityPressureCaseType[] | null>({
  key: "velocityPressureCases",
  default: [
    {
      name: "name1",
      value: 1.0,
      procedureIndex: 1,
      procedureValue: {
        category: SimplifiedCategoryEnum.TABLE_3_6,
        location: SimplifiedLocationEnum.WAGLAN_ISLAND,
        period: 120,
      },
    },
    {
      name: "name2",
      value: 2.7,
      procedureIndex: 1,
      procedureValue: {
        category: SimplifiedCategoryEnum.TABLE_3_7,
        location: SimplifiedLocationEnum.SHELTERED_LOCATION,
      },
    },
    {
      name: "name3",
      value: 3.2,
      procedureIndex: 1,
      procedureValue: {
        category: SimplifiedCategoryEnum.TABLE_3_8,
        degree: "1",
      },
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
  "procedureIndex" | "procedureValue"
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
export const tempProcedureValueDefalutForAdd: VelocityPressureCaseType = {
  name: "new name",
  value: 3.865,
  procedureIndex: 1,
  procedureValue: {
    category: SimplifiedCategoryEnum.TABLE_3_6,
    location: SimplifiedLocationEnum.WAGLAN_ISLAND,
    period: 120,
  },
};

// 기본 값 (Procedure별)
export const tempProcedureValueDefaultSimplified1: Omit<
  VelocityPressureCaseType,
  "name" | "value"
> = {
  procedureIndex: 1,
  procedureValue: {
    category: SimplifiedCategoryEnum.TABLE_3_6,
    location: SimplifiedLocationEnum.WAGLAN_ISLAND,
    period: 120,
  },
};

export const tempProcedureValueDefaultSimplified2: Omit<
  VelocityPressureCaseType,
  "name" | "value"
> = {
  procedureIndex: 1,
  procedureValue: {
    category: SimplifiedCategoryEnum.TABLE_3_7,
    location: SimplifiedLocationEnum.SHELTERED_LOCATION,
  },
};

export const tempProcedureValueDefaultSimplified3: Omit<
  VelocityPressureCaseType,
  "name" | "value"
> = {
  procedureIndex: 1,
  procedureValue: {
    category: SimplifiedCategoryEnum.TABLE_3_8,
    degree: "1",
  },
};

export const tempProcedureValueDefaultFull1: Omit<
  VelocityPressureCaseType,
  "name" | "value"
> = {
  procedureIndex: 2,
  procedureValue: {
    velocity: FullVelocityEnum.PEAK_VELOCITY,
    refZ: 50,
    horLoadLength: 600,
    degree: "1",
    coz: {
      value: 0.5,
      orographyType: FullOrographyTypeEnum.CLIFFS_AND_ESCARPMENTS,
      location: FullLocationEnum.UPWIND,
      h: 10,
      ld: 10,
      lu: 10,
      refZ: 10,
      loadLength: 10,
    },
    kpc: 10,
  },
};

export const tempProcedureValueDefaultFull2: Omit<
  VelocityPressureCaseType,
  "name" | "value"
> = {
  procedureIndex: 2,
  procedureValue: {
    velocity: FullVelocityEnum.MEAN_VELOCITY,
    refZ: 50,
    horLoadLength: 600,
    degree: "1",
    coz: {
      value: 0.5,
      orographyType: FullOrographyTypeEnum.CLIFFS_AND_ESCARPMENTS,
      location: FullLocationEnum.UPWIND,
      h: 10,
      ld: 10,
      lu: 10,
      refZ: 10,
      loadLength: 10,
    },
    kpc: 10,
  },
};

// 임시 공간
export const TempProcedureValueState = atom<VelocityPressureCaseType | null>({
  key: "TempProcedureValueState",
  default: tempProcedureValueDefalutForAdd,
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
