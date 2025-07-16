/**
 * @fileoverview 말뚝 데이터의 기본/위치/보강재 검증 모듈
 */

import { ValidationParams } from "./pileValidation";
import { VALIDATION_MESSAGES_PILE } from "../../constants/common/validationMessages";

// 기본 정보 검증
export const validatePileInitSet = (
  pileInitSet: ValidationParams["pileInitSet"],
  showNotification: ValidationParams["showNotification"]
): boolean => {
  if (!pileInitSet.pileName.trim()) {
    const message = VALIDATION_MESSAGES_PILE.PILE_NAME_REQUIRED;
    showNotification(message.key, message.type);
    return false;
  }

  if (typeof pileInitSet.topLevel !== "number" || isNaN(pileInitSet.topLevel)) {
    const message = VALIDATION_MESSAGES_PILE.TOP_LEVEL_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

  return true;
};

// 말뚝 배치 정보 검증
export const validatePileLocations = (
  pileLocations: ValidationParams["pileLocations"],
  showNotification: ValidationParams["showNotification"]
): boolean => {
  for (const location of pileLocations) {
    if (typeof location.loc !== "number" || isNaN(location.loc)) {
      const message = VALIDATION_MESSAGES_PILE.LOCATION_SPACE_INVALID;
      showNotification(message.key, message.type);
      return false;
    }

    if (!validateSpacing(location.space, showNotification)) return false;
    if (!validateAngles(location, pileLocations, showNotification))
      return false;
  }
  return true;
};

// 간격 검증
const validateSpacing = (
  space: number[],
  showNotification: ValidationParams["showNotification"]
): boolean => {
  if (space.length > 0) {
    for (const spacing of space) {
      if (spacing <= 0) {
        const message = VALIDATION_MESSAGES_PILE.SPACE_INVALID;
        showNotification(message.key, message.type);
        return false;
      }
    }
  }
  return true;
};

// 각도 검증
const validateAngles = (
  location: ValidationParams["pileLocations"][0],
  pileLocations: ValidationParams["pileLocations"],
  showNotification: ValidationParams["showNotification"]
): boolean => {
  const isSecondRow = pileLocations.indexOf(location) === 1;
  const referenceSpace = isSecondRow ? pileLocations[0].space : location.space;

  if (location.angle.length !== referenceSpace.length + 1) {
    const message = VALIDATION_MESSAGES_PILE.ANGLE_LENGTH_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

  for (const angle of location.angle) {
    if (typeof angle !== "number" || isNaN(angle)) {
      const message = VALIDATION_MESSAGES_PILE.ANGLE_INVALID;
      showNotification(message.key, message.type);
      return false;
    }
  }
  return true;
};

// 보강 정보 검증
export const validatePileReinforced = (
  pileReinforced: ValidationParams["pileReinforced"],
  pileLength: number,
  showNotification: ValidationParams["showNotification"]
): boolean => {
  const checkedReinforced = pileReinforced.filter(
    (reinforced) => reinforced.checked
  );

  if (!pileReinforced[0].checked && pileReinforced[1].checked) {
    const message = VALIDATION_MESSAGES_PILE.REINFORCED_CHECK_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

  for (const reinforced of checkedReinforced) {
    if (!validateReinforcedPoints(reinforced, pileLength, showNotification))
      return false;
    if (!validateReinforcedProperties(reinforced, showNotification))
      return false;
  }

  return true;
};

// 보강 지점 검증
const validateReinforcedPoints = (
  reinforced: ValidationParams["pileReinforced"][0],
  pileLength: number,
  showNotification: ValidationParams["showNotification"]
): boolean => {
  if (reinforced.start <= 0) {
    const message = VALIDATION_MESSAGES_PILE.REINFORCED_START_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

  if (reinforced.end <= reinforced.start) {
    const message = VALIDATION_MESSAGES_PILE.REINFORCED_END_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

  if (reinforced.start > pileLength || reinforced.end > pileLength) {
    const message = VALIDATION_MESSAGES_PILE.REINFORCED_POINT_EXCEED_LENGTH;
    showNotification(message.key, message.type);
    return false;
  }

  return true;
};

// 보강 속성 검증
const validateReinforcedProperties = (
  reinforced: ValidationParams["pileReinforced"][0],
  showNotification: ValidationParams["showNotification"]
): boolean => {
  if (reinforced.thickness <= 0) {
    const message = VALIDATION_MESSAGES_PILE.REINFORCED_THICKNESS_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

  if (reinforced.modulus <= 0) {
    const message = VALIDATION_MESSAGES_PILE.REINFORCED_MODULUS_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

  return true;
};
