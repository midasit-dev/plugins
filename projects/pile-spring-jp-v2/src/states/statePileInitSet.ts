import { atom } from "recoil";

export interface PileInitSetData {
  pileName: string;
  pileLength: number;
  topLevel: number;
  constructionMethod: string;
  headCondition: string;
  bottomCondition: string;
}

export const pileInitSetState = atom<PileInitSetData>({
  key: "pileInitSetState",
  default: {
    pileName: "",
    pileLength: 0,
    topLevel: 0,
    constructionMethod: "CM_DropHammer",
    headCondition: "Head_Condition_Fixed",
    bottomCondition: "Bottom_Condition_Free",
  },
});
