// SYMMETRIC
type SYMMETRIC = {
  "0": string;
  "1": string;
  [key: string]: string;
};
export const SYMMETRIC: SYMMETRIC = {
  0: "Symmetric",
  1: "Asymmetric",
};

export const getModelBeta = (HistoryModelLNG: string) => {
  switch (HistoryModelLNG) {
    case "Clough":
    case "Takeda":
    case "Modified_Takeda":
    case "Takeda_Slip":
      return true;
    default:
      return false;
  }
};

export const getModelAlpa = (HistoryModelLNG: string) => {
  switch (HistoryModelLNG) {
    case "Takeda":
    case "Modified_Takeda":
    case "Takeda_Slip":
      return true;
    default:
      return false;
  }
};

export const getModelGamma = (HistoryModelLNG: string) => {
  switch (HistoryModelLNG) {
    case "Takeda_Slip":
      return true;
    default:
      return false;
  }
};

export const getModelInitGap = (HistoryModelLNG: string) => {
  switch (HistoryModelLNG) {
    case "SLIP":
    case "SLIP_Tension":
    case "SLIP_Compression":
      return true;
    default:
      return false;
  }
};

// all history type
type ALL_Histroy_PND = {
  KIN: any;
  ORG: any;
  PKO: any;
  CLO: any;
  DEG: any;
  TAK: any;
  TTE: any;
  TAKS: any;
  MTK: any;
  MTT: any;
  NBI: any;
  EBI: any;
  ETR: any;
  ETE: any;
  SLBI: any;
  SLBT: any;
  SLBC: any;
  SLTR: any;
  SLTT: any;
  SLTC: any;
  [key: string]: number; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const ALL_Histroy_PND: ALL_Histroy_PND = {
  KIN: 3,
  ORG: 3,
  PKO: 3,
  CLO: 2,
  DEG: 3,
  TAK: 3,
  TTE: 4,
  TAKS: 3,
  MTK: 3,
  MTT: 4,
  NBI: 2,
  EBI: 2,
  ETR: 3,
  ETE: 4,
  SLBI: 2,
  SLTR: 3,
  SLBT: 3,
  SLTT: 2,
  SLBC: 2,
  SLTC: 3,
};

export const GetKeyFromLNG = (HistoryType_LNG: any, nPnD: number = 0) => {
  let subType = "";
  switch (nPnD) {
    case 2:
      subType = "Bilinear";
      break;
    case 3:
      subType = "Trilinear";
      break;
    case 4:
      subType = "Tetralinear";
      break;
    default:
      subType = "Bilinear";
      break;
  }

  switch (HistoryType_LNG) {
    case "Kinematic_Hardening":
      return "KIN";
    case "Origin_oriented":
      return "ORG";
    case "Peak_oriented":
      return "PKO";
    case "Clough":
      return "CLO";
    case "Degrading_Trilinear":
      return "DEG";
    case "Takeda":
      // 2개
      return TAKEDA_subType[subType];
    case "Takeda_Slip":
      return "TAKS";
    case "Modified_Takeda":
      // 2개
      return MODI_TAKEDA_subType[subType];
    case "Normal_Bilinear":
      return "NBI";
    case "Elastic_Bilinear":
      // 3개
      return ELASTIC_subType[subType];
    case "SLIP":
      return SLIP_subType[subType];
    case "SLIP_Tension":
      return SLIP_Tension_subType[subType];
    case "SLIP_Compression":
      return SLIP_Compression_subType[subType];
    default:
      return "";
  }
};

// all history type
type ALL_HistoryType_LNG = {
  KIN: any;
  ORG: any;
  PKO: any;
  CLO: any;
  DEG: any;
  TAK: any;
  TTE: any;
  TAKS: any;
  MTK: any;
  MTT: any;
  NBI: any;
  EBI: any;
  ETR: any;
  ETE: any;
  SLBI: any;
  SLBT: any;
  SLBC: any;
  SLTR: any;
  SLTT: any;
  SLTC: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const ALL_HistoryType_LNG: ALL_HistoryType_LNG = {
  KIN: "Kinematic_Hardening",
  ORG: "Origin_oriented",
  PKO: "Peak_oriented",
  CLO: "Clough",
  DEG: "Degrading_Trilinear",
  TAK: "Takeda",
  TTE: "Takeda",
  TAKS: "Takeda_Slip",
  MTK: "Modified_Takeda",
  MTT: "Modified_Takeda",
  NBI: "Normal_Bilinear",
  EBI: "Elastic_Bilinear",
  ETR: "Elastic_Bilinear",
  ETE: "Elastic_Bilinear",
  SLBI: "SLIP",
  SLTR: "SLIP",
  SLBT: "SLIP_Tension",
  SLTT: "SLIP_Tension",
  SLBC: "SLIP_Compression",
  SLTC: "SLIP_Compression",
};

//Takeda
type TAKEDA_subType = {
  Trilinear: any;
  Tetralinear: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const TAKEDA_subType: TAKEDA_subType = {
  Trilinear: "TAK",
  Tetralinear: "TTE",
};

//Modi_Takeda
type MODI_TAKEDA_subType = {
  Trilinear: any;
  Tetralinear: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const MODI_TAKEDA_subType: MODI_TAKEDA_subType = {
  Trilinear: "MTK",
  Tetralinear: "MTT",
};

// Elastic
type ELASTIC_subType = {
  Bilinear: any;
  Trilinear: any;
  Tetralinear: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const ELASTIC_subType: ELASTIC_subType = {
  Bilinear: "EBI",
  Trilinear: "ETR",
  Tetralinear: "ETE",
};

// SLIP_subType
type SLIP_subType = {
  Bilinear: any;
  Trilinear: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const SLIP_subType: SLIP_subType = {
  Bilinear: "SLBI",
  Trilinear: "SLTR",
};

// SLIP_Tension_Bilinear
type SLIP_Tension_subType = {
  Bilinear: any;
  Trilinear: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const SLIP_Tension_subType: SLIP_Tension_subType = {
  Bilinear: "SLBT",
  Trilinear: "SLTT",
};

//SLIP_Compression_Bilinear
type SLIP_Compression_subType = {
  Bilinear: any;
  Trilinear: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const SLIP_Compression_subType: SLIP_Compression_subType = {
  Bilinear: "SLBC",
  Trilinear: "SLTC",
};

// MULTLIN
type MULTLIN_nType = {
  "0": string;
  "1": string;
  "2": string;
  [key: string]: string;
};

export const MULTLIN_nType: MULTLIN_nType = {
  0: "Both",
  1: "Tensile_Only",
  2: "Compression_Only",
};

type MULTLIN_HistoryType = {
  MLEL: any;
  MLPK: any;
  MLPT: any;
  MLPP: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const MULTLIN_HistoryType: MULTLIN_HistoryType = {
  MLEL: "Multi-Linear_Elastic",
  MLPK: "Multi-Linear_Plastic_Kinematic",
  MLPT: "Multi-Linear_Plastic_Takeda",
  MLPP: "Multi-Linear_Plastic_Pivot",
};
