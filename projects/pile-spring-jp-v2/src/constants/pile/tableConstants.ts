/**
 * @fileoverview 말뚝 관련 테이블 상수값을 정의하는 모듈
 */

import { PILE_TYPES } from "./constants";
import { PileType } from "../../types/typePileDomain";

// 말뚝 단면 테이블 상수
export const PILE_SECTION_TABLE = {
  // 필드 수정 제한 설정
  NO_EDIT_FIELDS: {
    concrete: {
      thickness: [
        PILE_TYPES.CAST_IN_SITU,
        PILE_TYPES.STEEL_PILE,
        PILE_TYPES.SOIL_CEMENT_PILE,
      ] as PileType[],
      diameter: [PILE_TYPES.STEEL_PILE] as PileType[],
      modulus: [PILE_TYPES.STEEL_PILE] as PileType[],
    },
    steel: {
      diameter: [PILE_TYPES.SC_PILE] as PileType[],
      thickness: [PILE_TYPES.CAST_IN_SITU, PILE_TYPES.PHC_PILE] as PileType[],
      cor_thickness: [PILE_TYPES.CAST_IN_SITU] as PileType[],
    },
  },

  // 필드 너비 설정
  FIELD_WIDTHS: {
    name: 80,
    pileType: 140,
    length: 80,
    concrete: {
      diameter: 80,
      thickness: 80,
      modulus: 90,
    },
    steel: {
      diameter: 80,
      thickness: 80,
      modulus: 80,
      cor_thickness: 80,
    },
  },

  // i18n 키 정의
  TRANSLATION_KEYS: {
    HEADERS: {
      NAME: "Pile_Name",
      TYPE: "Pile_Type",
      LENGTH: "Pile_Length",
      CONCRETE: {
        DIAMETER: "Basic_Concrete_Diamter",
        THICKNESS: "Basic_Concrete_Thickness",
        MODULUS_CASE1: "Basic_Concrete_Modulus_Case1",
        MODULUS_CASE2: "Basic_Concrete_Modulus_Case2",
        GROUP: "Basic_Concrete_Total_Title",
      },
      STEEL: {
        DIAMETER_CASE1: "Basic_Steel_Diamter_Case1",
        DIAMETER_CASE2: "Basic_Steel_Diamter_Case2",
        THICKNESS: "Basic_Steel_Thickness",
        MODULUS: "Basic_Steel_Modulus",
        COR_CASE1: "Basic_Steel_Cor_Case1",
        COR_CASE2: "Basic_Steel_Cor_Case2",
        GROUP: "Basic_Steel_Total_Title",
      },
    },
  },
} as const;

// 말뚝 보강 테이블 상수
export const PILE_REINFORCED_TABLE = {
  // 필드 너비 설정
  FIELD_WIDTHS: {
    check: 50,
    method: 100,
    start: 100,
    end: 100,
    thickness: 100,
    modulus: 100,
  },

  // i18n 키 정의
  TRANSLATION_KEYS: {
    HEADERS: {
      METHOD: "Reinforced_Method",
      START: "Reinforced_Start",
      END: "Reinforced_End",
      THICKNESS: "Reinforced_Thickness",
      MODULUS: "Reinforced_Modulus",
    },
  },
} as const;

// 말뚝 위치 테이블 상수
export const PILE_LOCATION_TABLE = {
  // 필드 너비 설정
  FIELD_WIDTHS: {
    loc_title: 100,
    ref_point: 100,
    loc: 100,
    space: 100,
    angle: 100,
  },

  // i18n 키 정의
  TRANSLATION_KEYS: {
    HEADERS: {
      TITLE: "Pile_Location_Title",
      REF_POINT: "Pile_Ref_Point",
      LOC: "Pile_Loc",
      SPACE: "Pile_Space",
      ANGLE: "Pile_Angle",
    },
  },
} as const;
