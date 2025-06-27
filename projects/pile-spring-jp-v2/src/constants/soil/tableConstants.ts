/**
 * @fileoverview 토양 관련 테이블 상수값을 정의하는 모듈
 */

// 테이블 필드 너비 상수
export const SOIL_TABLE = {
  FIELD_WIDTHS: {
    NO: 60,
    TYPE: 80,
    LEVEL: 90,
    DEPTH: 80,
    AVG_N: 80,
    GAMMA: 80,
    AE0_NORMAL: 90,
    AE0_SEISMIC: 90,
    VD: 80,
    VSI: 80,
    ED: 80,
    DE: 80,
    LENGTH: 80,
    ACTIONS: 80,
  },

  TRANSLATION_KEYS: {
    HEADERS: {
      NO: "Soil_Table_No",
      TYPE: "Soil_Table_Type",
      LEVEL: "Soil_Table_Level",
      DEPTH: "Soil_Table_Depth",
      AVG_N: "Soil_Table_AvgN",
      GAMMA: "γ (kN/m³)",
      AE0_NORMAL: "Soil_Table_AE0_Normal",
      AE0_SEISMIC: "Soil_Table_AE0_Seismic",
      VD: "νd",
      VSI: "Vsi",
      ED: "ED (kN/m²)",
      DE: "DE",
      LENGTH: "Soil_Table_Length",
      ACTIONS: "Soil_Table_Actions",
    },
  },
} as const;
