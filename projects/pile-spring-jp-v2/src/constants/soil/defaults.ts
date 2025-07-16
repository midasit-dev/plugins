/**
 * @fileoverview 토양 관련 기본값을 정의하는 모듈
 */

import {
  SoilBasic,
  SoilResistance,
  SoilTable,
  SoilDomainState,
} from "../../types/typeSoilDomain";

// 토양 기본 정보 초기값
export const defaultSoilBasic: SoilBasic = {
  groundLevel: 0,
  waterLevel: 0,
  calVsiState: false,
  liquefactionState: false,
  slopeEffectState: false,
  groupEffectState: false,
  groupEffectValue: 1,
};

// 토양 저항력 초기값
export const defaultSoilResistance: SoilResistance = {
  useResistance: false,
  clayFrictionMethod: "Calculate_by_N",
  tipCapacity: 0,
  groundSlopeAngle: 0,
  groundSurfaceLoad: 0,
};

// 토양 층 테이블 초기값
export const defaultSoilTable: SoilTable = {
  id: 1,
  layerNo: 1,
  layerType: "SoilType_Clay",
  layerDepth: 0,
  depth: 10,
  avgNvalue: 10,
  c: 0,
  pi: 0,
  gamma: 18,
  aE0: 14000,
  aE0_Seis: 28000,
  vd: 0.5,
  Vsi: 0,
  ED: 0,
  DE: 1,
  length: 1,
};

// 토양 도메인 상태 초기값
export const defaultSoilDomainState: SoilDomainState = {
  basic: defaultSoilBasic,
  resistance: defaultSoilResistance,
  soilLayers: [],
};
