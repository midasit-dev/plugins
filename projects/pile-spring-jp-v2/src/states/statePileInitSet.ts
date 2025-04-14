import { atom } from "recoil";
import i18n from "../i18n"; // 번역 설정 파일 import

const t = (key: string) => i18n.t(key);

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
  default: t("Head_Condition_Fixed"),
});

export const BottomCondition = atom({
  key: "BottomCondition",
  default: "Bottom_Condition_Free",
});
