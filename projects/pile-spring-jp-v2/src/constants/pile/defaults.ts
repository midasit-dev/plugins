/**
 * @fileoverview 말뚝 관련 기본값을 정의하는 모듈
 */

import {
  PileBasicDim,
  PileInitSet,
  PileLocation,
  PileReinforced,
  PileSection,
  PileDomainState,
} from "../../types/typePileDomain";
import {
  CONSTRUCTION_METHODS,
  HEAD_CONDITIONS,
  BOTTOM_CONDITIONS,
  REFERENCE_POINTS,
  REINFORCED_METHODS,
  PILE_CATEGORIES,
  PILE_TYPES,
} from "./constants";

// 기본 말뚝 기초 치수
export const defaultPileBasicDim: PileBasicDim = {
  foundationWidth: 10,
  sideLength: 10,
  forcePointX: 0,
  forcePointY: 0,
};

// 기본 말뚝 초기 설정
export const defaultPileInitSet: PileInitSet = {
  pileName: "",
  pileLength: 0,
  topLevel: 0,
  constructionMethod: CONSTRUCTION_METHODS.DROP_HAMMER,
  headCondition: HEAD_CONDITIONS.FIXED,
  bottomCondition: BOTTOM_CONDITIONS.FREE,
};

// 기본 말뚝 위치 정보
export const defaultPileLocation: PileLocation[] = [
  {
    id: 1,
    loc_title: "Pile_X_Dir",
    ref_point: REFERENCE_POINTS.RIGHT,
    loc: 0,
    space: [],
    angle: [0],
  },
  {
    id: 2,
    loc_title: "Pile_Y_Dir",
    ref_point: REFERENCE_POINTS.TOP,
    loc: 0,
    space: [],
    angle: [0],
  },
];

// 기본 말뚝 보강재 정보
export const defaultPileReinforced: PileReinforced[] = [
  {
    id: 1,
    checked: false,
    method: REINFORCED_METHODS.OUTER,
    start: 0,
    end: 0,
    thickness: 0,
    modulus: 0,
  },
  {
    id: 2,
    checked: false,
    method: REINFORCED_METHODS.INNER,
    start: 0,
    end: 0,
    thickness: 0,
    modulus: 0,
  },
];

// 말뚝 단면 관련 기본 상수값
export const PILE_SECTION_CONSTANTS = {
  DEFAULT_LENGTH: 10,
  DEFAULT_DIAMETER: 0,
  DEFAULT_THICKNESS: 0,
  DEFAULT_MODULUS: 0,
  MAX_SECTIONS: 4,
} as const;

// 새로운 말뚝 단면을 생성하는 함수
export const createPileSection = (
  id: number,
  name: string,
  checked: boolean = false
): PileSection => ({
  id,
  checked,
  name,
  pileType: PILE_TYPES.CAST_IN_SITU,
  length: PILE_SECTION_CONSTANTS.DEFAULT_LENGTH,
  concrete: {
    diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
  },
  steel: {
    diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    cor_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
  },
});

// 기본 말뚝 단면 배열을 생성하는 함수
export const createDefaultPileSections = (): PileSection[] => [
  createPileSection(1, PILE_CATEGORIES.BASIC, true),
  createPileSection(2, PILE_CATEGORIES.SUB1),
  createPileSection(3, PILE_CATEGORIES.SUB2),
  createPileSection(4, PILE_CATEGORIES.SUB3),
];

// 말뚝 도메인 상태의 기본값
export const defaultPileDomainState: PileDomainState = {
  basicDim: defaultPileBasicDim,
  currentPile: {
    initSet: defaultPileInitSet,
    sections: createDefaultPileSections(),
    locations: defaultPileLocation,
    reinforced: defaultPileReinforced,
  },
  pileDataList: [],
  selectedPileDataId: null,
};
