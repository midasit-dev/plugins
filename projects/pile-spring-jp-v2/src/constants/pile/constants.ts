/**
 * @fileoverview 말뚝 관련 모든 상수값을 정의하는 모듈
 */

// 말뚝 타입 정의
export const PILE_TYPES = {
  CAST_IN_SITU: "Cast_In_Situ",
  STEEL_PILE: "Steel_Pile",
  SOIL_CEMENT_PILE: "Soil_Cement_Pile",
  SC_PILE: "SC_Pile",
  PHC_PILE: "PHC_Pile",
} as const;

// 말뚝 시공 방법
export const CONSTRUCTION_METHODS = {
  DROP_HAMMER: "CM_DropHammer",
  VIBRO_HAMMER: "CM_VibroHammer",
  IN_SITU: "CM_InSitu",
  BORING: "CM_Boring",
  PREBORING: "CM_Preboring",
  SOIL_CEMENT: "CM_SoilCement",
  ROTATE: "CM_Rotate",
} as const;

// 말뚝 두부 조건
export const HEAD_CONDITIONS = {
  FIXED: "Head_Condition_Fixed",
  HINGE: "Head_Condition_Hinge",
} as const;

// 말뚝 선단 조건
export const BOTTOM_CONDITIONS = {
  FREE: "Bottom_Condition_Free",
  HINGE: "Bottom_Condition_Hinge",
  FIXED: "Bottom_Condition_Fixed",
} as const;

// 말뚝 보강 방법
export const REINFORCED_METHODS = {
  OUTER: "Reinforced_Method_Outer",
  INNER: "Reinforced_Method_Inner",
} as const;

// 말뚝 위치 참조점
export const REFERENCE_POINTS = {
  RIGHT: "Ref_Point_Right",
  LEFT: "Ref_Point_Left",
  TOP: "Ref_Point_Top",
  BOTTOM: "Ref_Point_Bottom",
} as const;

// 말뚝 카테고리 이름
export const PILE_CATEGORIES = {
  BASIC: "Pile_Category_Basic",
  SUB1: "Pile_Category_Sub1",
  SUB2: "Pile_Category_Sub2",
  SUB3: "Pile_Category_Sub3",
} as const;
