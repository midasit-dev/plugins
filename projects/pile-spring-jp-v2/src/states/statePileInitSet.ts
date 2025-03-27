import { atom } from "recoil";

export const PileName = atom({
  key: "PileName",
  default: "",
});

export const PileLength = atom({
  key: "PileLength",
  default: 0,
});

export const TopLevel = atom({
  key: "TopLevel",
  default: 0,
});

export const ConstructionMethod = atom({
  key: "ConstructionMethod",
  default: "CM_DropHammer",
});

export const HeadCondition = atom({
  key: "HeadCondition",
  default: "Head_Condition_Fixed",
});

export const BottomCondition = atom({
  key: "BottomCondition",
  default: "Bottom_Condition_Free",
});
