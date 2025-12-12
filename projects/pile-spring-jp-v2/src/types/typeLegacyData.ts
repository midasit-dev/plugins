/**
 * @fileoverview 레거시 파일 데이터 구조를 정의하는 인터페이스
 */

// 레거시 파일의 말뚝 데이터 구조를 정의하는 인터페이스
export interface LegacyPileData {
  pileName: string;
  pileLength: string | number;
  pileType: string;
  constructionMethod: string;
  headCondition: string;
  bottomCondition: string;
  concreteDiameter: string | number;
  concreteThickness: string | number;
  concreteModulus: string | number;
  steelDiameter: string | number;
  steelThickness: string | number;
  steelModulus: string | number;
  steelCorThickness: string | number;
  compositeTypeCheck: boolean;
  compStartLength: string | number;
  compPileType: string;
  compConcreteDiameter: string | number;
  compConcreteThickness: string | number;
  compConcreteModulus: string | number;
  compSteelDiameter: string | number;
  compSteelThickness: string | number;
  compSteelModulus: string | number;
  compSteelCorThickness: string | number;
  reinforcedMethod: string;
  reinforcedStartLength: string | number;
  reinforcedEndLength: string | number;
  outerThickness: string | number;
  outerModulus: string | number;
  innerThickness: string | number;
  innerModulus: string | number;
  majorRefValue: number;
  minorRefValue: number;
  majorStartPoint: string | number;
  minorStartPoint: string | number;
  majorSpace: string;
  majorDegree: string;
  minorDegree: string;
  PileNums: number;
}

// 레거시 JSON 파일의 전체 데이터 구조를 정의하는 인터페이스
export interface LegacyJsonData {
  projectName: string;
  piletableData: LegacyPileData[];
  soilData: LegacySoilTable[];
  topLevel: string;
  groundLevel: string;
  waterlevel: string;
  groupEffectValue: number;
  slopeEffectState: boolean;
  foundationWidth: string;
  sideLength: string;
  liquefactionState: boolean;
  calVsiState: boolean;
  groupEffectState: boolean;
  forcepointX: string | number;
  forcepointY: string | number;
  language: string;
}

// 레거시 토양 기본 데이터 인터페이스
export interface LegacySoilBasic {
  groundLevel: string | number;
  waterLevel: string | number;
  calVsiState: boolean;
  liquefactionState: boolean;
  slopeEffectState: boolean;
  groupEffectState: boolean;
  groupEffectValue: string | number;
}

// 레거시 토양 테이블 데이터 인터페이스
export interface LegacySoilTable {
  id: number;
  LayerNo: number;
  LayerType: string;
  LayerDepth: string | number;
  Depth: string | number;
  AvgNValue: string | number;
  c: string | number;
  pi: string | number;
  gamma: string | number;
  aE0: string | number;
  aE0_Seis: string | number;
  vd: string | number;
  Vsi: string | number;
  ED: string | number;
  DE: string | number;
  Length: string | number;
}
