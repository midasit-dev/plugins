/**
 * @fileoverview 말뚝 단면 타입별 검증 모듈
 */

import { ValidationParams } from "./pileValidation";
import { VALIDATION_MESSAGES_PILE } from "../../constants/common/validationMessages";
import { PILE_TYPES } from "../../constants/pile/constants";
import { PileSection, PileType } from "../../types/typePileDomain";

type ValidationProperty =
  | `${keyof PileSection["concrete"] extends string
      ? `concrete.${keyof PileSection["concrete"]}`
      : never}`
  | `${keyof PileSection["steel"] extends string
      ? `steel.${keyof PileSection["steel"]}`
      : never}`;

// 각 파일 타입별 검증해야 할 속성 정의
const SECTION_VALIDATION_RULES: Record<PileType, ValidationProperty[]> = {
  [PILE_TYPES.CAST_IN_SITU]: [
    "concrete.diameter",
    "concrete.modulus",
    "steel.diameter",
    "steel.modulus",
  ],
  [PILE_TYPES.PHC_PILE]: [
    "concrete.diameter",
    "concrete.thickness",
    "concrete.modulus",
    "steel.diameter",
    "steel.modulus",
    "steel.cor_thickness",
  ],
  [PILE_TYPES.SC_PILE]: [
    "concrete.diameter",
    "concrete.thickness",
    "concrete.modulus",
    "steel.thickness",
    "steel.modulus",
    "steel.cor_thickness",
  ],
  [PILE_TYPES.STEEL_PILE]: [
    "steel.diameter",
    "steel.thickness",
    "steel.modulus",
    "steel.cor_thickness",
  ],
  [PILE_TYPES.SOIL_CEMENT_PILE]: [
    "concrete.diameter",
    "concrete.modulus",
    "steel.diameter",
    "steel.thickness",
    "steel.modulus",
    "steel.cor_thickness",
  ],
};

// 검증 실패 시 표시할 메시지 매핑
const VALIDATION_MESSAGE_MAP: Record<
  ValidationProperty,
  (typeof VALIDATION_MESSAGES_PILE)[keyof typeof VALIDATION_MESSAGES_PILE]
> = {
  "concrete.diameter": VALIDATION_MESSAGES_PILE.CONCRETE_DIAMETER_INVALID,
  "concrete.thickness": VALIDATION_MESSAGES_PILE.CONCRETE_THICKNESS_INVALID,
  "concrete.modulus": VALIDATION_MESSAGES_PILE.CONCRETE_MODULUS_INVALID,
  "steel.diameter": VALIDATION_MESSAGES_PILE.STEEL_DIAMETER_INVALID,
  "steel.thickness": VALIDATION_MESSAGES_PILE.STEEL_THICKNESS_INVALID,
  "steel.modulus": VALIDATION_MESSAGES_PILE.STEEL_MODULUS_INVALID,
  "steel.cor_thickness": VALIDATION_MESSAGES_PILE.STEEL_COR_THICKNESS_INVALID,
};

// 단면 정보 검증
export const validatePileSections = (
  sections: PileSection[],
  showNotification: ValidationParams["showNotification"]
): boolean => {
  const checkedSections = sections.filter((section) => section.checked);

  for (const section of checkedSections) {
    if (!validateSectionLength(section, showNotification)) return false;
    if (!validateSectionByType(section, showNotification)) return false;
  }

  return true;
};

// 단면 길이 검증
const validateSectionLength = (
  section: PileSection,
  showNotification: ValidationParams["showNotification"]
): boolean => {
  if (section.length <= 0) {
    const message = VALIDATION_MESSAGES_PILE.SECTION_LENGTH_INVALID;
    showNotification(message.key, message.type);
    return false;
  }
  return true;
};

// 속성값 검증
const validatePropertyValue = (
  section: PileSection,
  property: ValidationProperty,
  showNotification: ValidationParams["showNotification"]
): boolean => {
  const [category, field] = property.split(".") as [keyof PileSection, string];
  const value =
    section[category][field as keyof (typeof section)[typeof category]];

  if (value <= 0) {
    const message = VALIDATION_MESSAGE_MAP[property];
    showNotification(message.key, message.type);
    return false;
  }
  return true;
};

// 단면 타입별 검증
const validateSectionByType = (
  section: PileSection,
  showNotification: ValidationParams["showNotification"]
): boolean => {
  const rules = SECTION_VALIDATION_RULES[section.pileType];

  if (!rules) return true; // 알 수 없는 타입은 검증 통과

  for (const property of rules) {
    if (!validatePropertyValue(section, property, showNotification)) {
      return false;
    }
  }

  return true;
};
