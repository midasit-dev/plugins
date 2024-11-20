import { atom, selector } from "recoil";

export const selLoadCaseNameState = atom<string>({
  key: "selLoadCaseNameState",
  default: "",
});

export const selLoadCaseNameSelector = selector<string>({
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
  HONG_KONG_OBSERVATORY = "Hong Kong Observatory",
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
  velocity?: FullVelocityEnum;
  refZ?: number;
  horLoadLength?: number;
  degree?: "1" | "2" | "3" | "4";
  cozValue?: number;
  cozOptions?: {
    orographyType?: FullOrographyTypeEnum;
    location?: FullLocationEnum;
    h?: number;
    ld?: number;
    lu?: number;
    x?: number;
    refZ?: number;
    loadLength?: number;

    sbz?: number | string;
    scz?: number | string;
    coz?: number;
  };
  kpc?: number;
};

export type VelocityPressureCaseType = {
  name: string;
  value: number;
  procedureIndex: 1 | 2; // 1: simplified, 2: full
  procedureSimplified?: VelocityPressureCaseProcedureSimplified;
  procedureFull?: VelocityPressureCaseProcedureFull;
};

// 생성된 케이스들
export const velocityPressureCases = atom<VelocityPressureCaseType[] | null>({
  key: "velocityPressureCases",
  // default: [
  //   {
  //     name: "name1",
  //     value: 1.0,
  //     procedureIndex: 1,
  //     procedureSimplified: {
  //       category: SimplifiedCategoryEnum.TABLE_3_6,
  //       location: SimplifiedLocationEnum.WAGLAN_ISLAND,
  //       period: 120,
  //     },
  //     procedureFull: {
  //       velocity: FullVelocityEnum.PEAK_VELOCITY,
  //       refZ: 50,
  //       horLoadLength: 600,
  //       degree: "1",
  //       cozValue: 1.0,
  //       kpc: 0,
  //     },
  //   },
  //   {
  //     name: "name2",
  //     value: 2.7,
  //     procedureIndex: 1,
  //     procedureSimplified: {
  //       category: SimplifiedCategoryEnum.TABLE_3_7,
  //       location: SimplifiedLocationEnum.SHELTERED_LOCATION,
  //     },
  //     procedureFull: {
  //       velocity: FullVelocityEnum.PEAK_VELOCITY,
  //       refZ: 50,
  //       horLoadLength: 600,
  //       degree: "1",
  //       cozValue: 1.0,
  //       kpc: 0,
  //     },
  //   },
  //   {
  //     name: "name3",
  //     value: 3.2,
  //     procedureIndex: 1,
  //     procedureSimplified: {
  //       category: SimplifiedCategoryEnum.TABLE_3_8,
  //       degree: "1",
  //     },
  //     procedureFull: {
  //       velocity: FullVelocityEnum.PEAK_VELOCITY,
  //       refZ: 50,
  //       horLoadLength: 600,
  //       degree: "1",
  //       cozValue: 1.0,
  //       kpc: 0,
  //     },
  //   },
  // ],
  default: null,
});

// 생성된 케이스 중 선택된 DropList Item
export const mainSelVelocityPressureState = atom<string | null>({
  key: "mainSelVelocityPressureState",
  default: null,
});

export const mainSelVelocityPressureSelector = selector<string | null>({
  key: "mainSelVelocityPressureSelector",
  get: ({ get }) => {
    return get(mainSelVelocityPressureState);
  },
  set: ({ set }, newValue) => {
    set(mainSelVelocityPressureState, newValue);
  },
});

// 생성된 케이스 중 선택된 케이스의 값만 추출
export const mainSelVelocityPressureValueSelector = selector<number | null>({
  key: "mainSelVelocityPressureValueSelector",
  get: ({ get }) => {
    const sel = get(mainSelVelocityPressureState);
    const cases = get(velocityPressureCases);
    if (!sel || !cases) return null;
    return cases.find((item) => item.name === sel)?.value ?? null;
  },
});

// 메인의 Cf 값
export const mainCfValueState = atom<number | null>({
  key: "mainCfValueState",
  default: 1.0,
});

export const mainCfValueSelector = selector<number | null>({
  key: "mainCfValueSelector",
  get: ({ get }) => {
    return get(mainCfValueState);
  },
  set: ({ set }, newValue) => {
    set(mainCfValueState, newValue);
  },
});

// 메인의 CsCd 값
export const mainCsCdValueState = atom<number | null>({
  key: "mainCsCdValueState",
  default: 1.0,
});

export const mainCsCdValueSelector = selector<number | null>({
  key: "mainCsCdValueSelector",
  get: ({ get }) => {
    return get(mainCsCdValueState);
  },
  set: ({ set }, newValue) => {
    set(mainCsCdValueState, newValue);
  },
});

// 메인의 TargetElements
export const mainTargetElementsState = atom<number[] | null>({
  key: "mainTargetElementsState",
  default: null,
});

export const mainTargetElementsSelector = selector<number[] | null>({
  key: "mainTargetElementsSelector",
  get: ({ get }) => {
    return get(mainTargetElementsState);
  },
  set: ({ set }, newValue) => {
    set(mainTargetElementsState, newValue);
  },
});

// 메인의 Direction
export const mainSelDirectionState = atom<string | null>({
  key: "mainSelDirectionState",
  default: "LY+",
});

export const mainSelDirectionSelector = selector<string | null>({
  key: "mainSelDirectionSelector",
  get: ({ get }) => {
    return get(mainSelDirectionState);
  },
  set: ({ set }, newValue) => {
    set(mainSelDirectionState, newValue);
  },
});

// 메인의 HeightOfRestraint
interface HeightOfRestraintType {
  isCheck: boolean;
  iEnd: number;
  jEnd: number;
  isCheckJEnd: boolean;
}

export const mainHeightOfRestraintState = atom<HeightOfRestraintType>({
  key: "mainHeightOfRestraintState",
  default: {
    isCheck: false,
    iEnd: 0.0,
    jEnd: 0.0,
    isCheckJEnd: false,
  },
});

export const mainHeightOfRestraintSelector = selector<HeightOfRestraintType>({
  key: "mainHeightOfRestraintSelector",
  get: ({ get }) => {
    return get(mainHeightOfRestraintState);
  },
  set: ({ set }, newValue) => {
    set(mainHeightOfRestraintState, newValue);
  },
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
  "procedureIndex" | "procedureSimplified" | "procedureFull"
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
  procedureSimplified: {
    category: SimplifiedCategoryEnum.TABLE_3_6,
    location: SimplifiedLocationEnum.WAGLAN_ISLAND,
    period: 120,
    degree: "1",
  },
  procedureFull: {
    velocity: FullVelocityEnum.PEAK_VELOCITY,
    refZ: 50,
    horLoadLength: 600,
    degree: "1",
    cozValue: 1.0,
    kpc: 1.22,
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

// 기본 값
export const tempProcedureValueCozOptionsDefalutForAdd: VelocityPressureCaseProcedureFull["cozOptions"] =
  {
    orographyType: FullOrographyTypeEnum.HILLS_AND_RIDGES,
    location: FullLocationEnum.UPWIND,
    h: 0.0,
    lu: 0.0,
    ld: 0.0,
    x: 0.0,
    refZ: 50.0,
    loadLength: 600.0,

    sbz: 0.0,
    scz: 0.0,
    coz: 0.0,
  };

export const TempProcedureValueCozOptionsState = atom<
  VelocityPressureCaseProcedureFull["cozOptions"] | null
>({
  key: "TempProcedureValueCozOptionsState",
  default: tempProcedureValueCozOptionsDefalutForAdd,
});

export const TempProcedureValueCozOptionsSelector = selector<
  VelocityPressureCaseProcedureFull["cozOptions"] | null
>({
  key: "TempProcedureValueCozOptionsSelector",
  get: ({ get }) => {
    return get(TempProcedureValueCozOptionsState);
  },
  set: ({ set }, newValue) => {
    set(TempProcedureValueCozOptionsState, newValue);
  },
});
