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
