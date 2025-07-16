/**
 * @fileoverview 토양 관련 모든 상수값을 정의하는 모듈
 */

// 토양 저항력 계산 방법
export const SOIL_RESISTANCE_METHODS = {
  CALCULATE_BY_N: "Calculate_by_N",
  CALCULATE_BY_C: "Calculate_by_C",
} as const;

// 토양 층 유형
export const SOIL_LAYER_TYPES = {
  CLAY: "SoilType_Clay",
  SAND: "SoilType_Sand",
  SANDSTONE: "SoilType_Sandstone",
} as const;
