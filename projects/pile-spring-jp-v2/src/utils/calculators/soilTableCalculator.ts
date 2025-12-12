/**
 * @fileoverview 토양 테이블 계산 관련 유틸리티 함수들
 * Vsi 및 ED 계산에 필요한 상수와 함수들을 정의합니다.
 */

import { SOIL_LAYER_TYPES } from "../../constants/soil/constants";

// Vsi 값을 계산하는 함수
export const calculateVsi = (layerType: string, avgN: number): number => {
  if (layerType === SOIL_LAYER_TYPES.CLAY) {
    return 100 * Math.pow(Math.min(avgN, 25), 1 / 3);
  } else if (
    layerType === SOIL_LAYER_TYPES.SAND ||
    layerType === SOIL_LAYER_TYPES.SANDSTONE
  ) {
    return 80 * Math.pow(Math.min(avgN, 50), 1 / 3);
  }
  return 0.0;
};

// ED 값을 계산하는 함수
export const calculateED = (Vsi: number, gamma: number, vd: number): number => {
  const Vsd = Vsi < 300 ? 0.8 * Vsi : Vsi;
  const Gd = (gamma / 9.8) * Math.pow(Vsd, 2);
  return 2 * (1 + vd) * Gd;
};
