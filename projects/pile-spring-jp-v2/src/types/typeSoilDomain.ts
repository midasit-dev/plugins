/**
 * @fileoverview 토양 관련 타입 정의 모듈
 */

// 기본 토양 정보를 정의하는 인터페이스
export interface SoilBasic {
  groundLevel: number;
  waterLevel: number;
  calVsiState: boolean;
  liquefactionState: boolean;
  slopeEffectState: boolean;
  groupEffectState: boolean;
  groupEffectValue: number;
}

// 지반 저항 정보를 정의하는 인터페이스
export interface SoilResistance {
  useResistance: boolean;
  clayFrictionMethod: string;
  tipCapacity: number;
  groundSlopeAngle: number;
  groundSurfaceLoad: number;
}

// 토양층 정보를 정의하는 인터페이스
export interface SoilTable {
  id: number;
  layerNo: number;
  layerType: string;
  layerDepth: number;
  depth: number;
  avgNvalue: number;
  c: number;
  pi: number;
  gamma: number;
  aE0: number;
  aE0_Seis: number;
  vd: number;
  Vsi: number;
  ED: number;
  DE: number;
  length: number;
}

// 통합된 Soil 도메인 상태를 정의하는 인터페이스
export interface SoilDomainState {
  basic: SoilBasic;
  resistance: SoilResistance;
  soilLayers: SoilTable[];
}
