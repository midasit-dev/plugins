/**
 * @fileoverview 말뚝 관련 모든 타입과 기본값을 정의하는 모듈
 */

import { PILE_TYPES } from "../constants/pile/constants";

// 말뚝 기초의 기본 치수 정보를 정의하는 인터페이스
export interface PileBasicDim {
  foundationWidth: number;
  sideLength: number;
  forcePointX: number;
  forcePointY: number;
}

// 말뚝의 초기 설정 정보를 정의하는 인터페이스
export interface PileInitSet {
  pileName: string;
  pileLength: number;
  topLevel: number;
  constructionMethod: string;
  headCondition: string;
  bottomCondition: string;
}

// 말뚝 단면 정보를 정의하는 인터페이스
export type PileType = (typeof PILE_TYPES)[keyof typeof PILE_TYPES];

export interface PileSection {
  id: number;
  checked: boolean;
  name: string;
  pileType: PileType;
  length: number;
  concrete: {
    diameter: number;
    thickness: number;
    modulus: number;
  };
  steel: {
    diameter: number;
    thickness: number;
    modulus: number;
    cor_thickness: number;
  };
}

// 말뚝 위치 정보를 정의하는 인터페이스
export interface PileLocation {
  id: number;
  loc_title: string;
  ref_point: string;
  loc: number;
  space: number[];
  angle: number[];
}

// 말뚝 보강재 정보를 정의하는 인터페이스
export interface PileReinforced {
  id: number;
  checked: boolean;
  method: string;
  start: number;
  end: number;
  thickness: number;
  modulus: number;
}

// 말뚝 데이터 항목의 타입 정의 (목록/선택/저장에 사용)
export interface PileDataItem {
  id: number; // 고유 ID
  pileName: string; // 말뚝 이름
  pileNumber: number; // 말뚝 개수
  initSetData: PileInitSet; // 초기 설정 데이터
  locationData: PileLocation[]; // 위치 데이터
  reinforcedData: PileReinforced[]; // 보강 데이터
  sectionData: PileSection[]; // 단면 데이터
}

// 말뚝 도메인 전체 상태 구조
export interface PileDomainState {
  basicDim: PileBasicDim; // 기초 제원
  currentPile: {
    initSet: PileInitSet; // 현재 편집 중인 말뚝의 초기 설정
    sections: PileSection[]; // 현재 편집 중인 말뚝의 단면 정보
    locations: PileLocation[]; // 현재 편집 중인 말뚝의 위치 정보
    reinforced: PileReinforced[]; // 현재 편집 중인 말뚝의 보강 정보
  };
  pileDataList: PileDataItem[]; // 저장된 말뚝 데이터 목록
  selectedPileDataId: number | null; // 선택된 말뚝 데이터의 ID
}
