import { atom, selector } from "recoil";

export const isBlurState = atom<boolean>({
  key: "isBlurState",
  default: false,
});

export const isBlurSelector = selector<boolean>({
  key: "isBlurSelector",
  get: ({ get }) => {
    return get(isBlurState);
  },
  set: ({ set }, newValue) => {
    set(isBlurState, newValue);
  },
});
