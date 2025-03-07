import { atom, selector } from "recoil";

export const isOpenVelocityPressureCasesState = atom<boolean>({
  key: "isOpenVelocityPressureCasesState",
  default: false,
});

export const isOpenVelocityPressureCasesSelector = selector<boolean>({
  key: "isOpenVelocityPressureCasesSelector",
  get: ({ get }) => {
    return get(isOpenVelocityPressureCasesState);
  },
  set: ({ set }, newValue) => {
    set(isOpenVelocityPressureCasesState, newValue);
  },
});

export const isOpenAddModVelocityPressureState = atom<boolean>({
  key: "isOpenAddModVelocityPressureState",
  default: false,
});

export const isOpenAddModVelocityPressureSelector = selector<boolean>({
  key: "isOpenAddModVelocityPressureSelector",
  get: ({ get }) => {
    return get(isOpenAddModVelocityPressureState);
  },
  set: ({ set }, newValue) => {
    set(isOpenAddModVelocityPressureState, newValue);
  },
});

export const isOpenCalcOrographyDialogState = atom<boolean>({
  key: "isOpenCalcOrographyDialogState",
  default: false,
});

export const isOpenCalcOrographyDialogSelector = selector<boolean>({
  key: "isOpenCalcOrographyDialogSelector",
  get: ({ get }) => {
    return get(isOpenCalcOrographyDialogState);
  },
  set: ({ set }, newValue) => {
    set(isOpenCalcOrographyDialogState, newValue);
  },
});

export const isOpenCfDialogState = atom<boolean>({
  key: "isOpenCfDialogState",
  default: false,
});

export const isOpenCfDialogSelector = selector<boolean>({
  key: "isOpenCfDialogSelector",
  get: ({ get }) => {
    return get(isOpenCfDialogState);
  },
  set: ({ set }, newValue) => {
    set(isOpenCfDialogState, newValue);
  },
});
