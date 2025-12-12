/**
 * @fileoverview 말뚝 데이터의 모든 입력값에 대한 통합 검증 모듈
 * @description pileValidationBasic.ts, pileValidationSection.ts 파일을 통합하여 사용
 */

import {
  validatePileInitSet,
  validatePileLocations,
  validatePileReinforced,
} from "./pileValidationBasic";
import { validatePileSections } from "./pileValidationSection";

import { NotificationSeverity } from "../../hooks/common/useNotification";
import { PileSection } from "../../types/typePileDomain";

// 입력값 검증을 위한 파라미터 인터페이스
export interface ValidationParams {
  pileInitSet: {
    pileName: string;
    pileLength: number;
    topLevel: number;
  };
  pileLocations: Array<{
    loc: number;
    space: number[];
    angle: number[];
  }>;
  pileReinforced: Array<{
    checked: boolean;
    start: number;
    end: number;
    thickness: number;
    modulus: number;
  }>;
  pileSections: PileSection[];
  showNotification: (
    messageKey: string,
    severity?: NotificationSeverity,
    options?: object
  ) => void;
}

// 말뚝 데이터의 모든 입력값을 검증하는 함수
export const validatePileData = ({
  pileInitSet,
  pileLocations,
  pileReinforced,
  pileSections,
  showNotification,
}: ValidationParams): boolean => {
  if (!validatePileInitSet(pileInitSet, showNotification)) return false;
  if (!validatePileLocations(pileLocations, showNotification)) return false;
  if (
    !validatePileReinforced(
      pileReinforced,
      pileInitSet.pileLength,
      showNotification
    )
  )
    return false;
  if (!validatePileSections(pileSections, showNotification)) return false;

  return true;
};
