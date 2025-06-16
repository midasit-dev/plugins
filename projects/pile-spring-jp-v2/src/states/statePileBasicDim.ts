import { atom } from "recoil";

export interface PileBasicDim {
  foundationWidth: number;
  sideLength: number;
  forcePointX: number;
  forcePointY: number;
}

export const defaultPileBasicDim: PileBasicDim = {
  foundationWidth: 10,
  sideLength: 10,
  forcePointX: 0,
  forcePointY: 0,
};

export const pileBasicDimState = atom<PileBasicDim>({
  key: "pileBasicDimState",
  default: defaultPileBasicDim,
});
