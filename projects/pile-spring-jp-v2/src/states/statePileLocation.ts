import { atom } from "recoil";

export const pileLocationState = atom({
  key: "pileLocationState",
  default: [{ id: 1 }, { id: 2 }],
});
