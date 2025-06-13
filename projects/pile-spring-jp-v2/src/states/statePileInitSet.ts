import { atom } from "recoil";

// pileName: 말뚝 명칭
// pileLength: 말뚝 길이(m)
// topLevel: 저면 표고(m)

// constructionMethod: 시공방법
// [t("CM_DropHammer"), "CM_DropHammer"],
// [t("CM_VibroHammer"), "CM_VibroHammer"],
// [t("CM_InSitu"), "CM_InSitu"],
// [t("CM_Boring"), "CM_Boring"],
// [t("CM_Preboring"), "CM_Preboring"],
// [t("CM_SoilCement"), "CM_SoilCement"],
// [t("CM_Rotate"), "CM_Rotate"]

// headCondition: 말뚝 머리 접합 조건
// [t("Head_Condition_Fixed"), "Head_Condition_Fixed"],
// [t("Head_Condition_Hinge"), "Head_Condition_Hinge"],

// bottomCondition: 말뚝 선단 조건
// [t("Bottom_Condition_Free"), "Bottom_Condition_Free"],
// [t("Bottom_Condition_Hinge"), "Bottom_Condition_Hinge"],
// [t("Bottom_Condition_Fixed"), "Bottom_Condition_Fixed"],

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
