import { atom } from "recoil";

export interface PileBasicDimensions {
  foundationWidth: number;
  sideLength: number;
  forcePointX: number;
  forcePointY: number;
}

export const pileBasicDimensions = atom<PileBasicDimensions>({
  key: "pileBasicDimensions",
  default: {
    foundationWidth: 10,
    sideLength: 10,
    forcePointX: 0,
    forcePointY: 0,
  },
});
