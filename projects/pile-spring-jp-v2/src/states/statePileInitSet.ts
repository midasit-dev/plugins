import { atom } from "recoil";

export interface PileInitSetData {
  pileName: string;
  pileLength: number;
  topLevel: number;
  constructionMethod: string;
  headCondition: string;
  bottomCondition: string;
}

export const defaultPileInitSetData: PileInitSetData = {
  pileName: "",
  pileLength: 0,
  topLevel: 0,
  constructionMethod: "CM_DropHammer",
  headCondition: "Head_Condition_Fixed",
  bottomCondition: "Bottom_Condition_Free",
};

export const pileInitSetState = atom<PileInitSetData>({
  key: "pileInitSetState",
  default: defaultPileInitSetData,
});
