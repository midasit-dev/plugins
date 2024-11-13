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
