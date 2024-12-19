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

// all history type
type ALL_HistoryType = {
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

enum ALL_Enum_HistroyType {
  KIN,
  ORG,
  PKO,
  CLO,
  DEG,
  TAK,
  TTE,
  TAKS,
  MTK,
  MTT,
  NBI,
  EBI,
  ETR,
  ETE,
  SLBI,
  SLBT,
  SLBC,
  SLTR,
  SLTT,
  SLTC,
}

export const ALL_HistoryType = (HistoryType: any): string => {
  switch (HistoryType) {
    case "KIN":
      return "Kinematic_Hardening";
    case "ORG":
      return "Origin_oriented";
    case "PKO":
      return "Peak_oriented";
    case "CLO":
      return "Clough";
    case "DEG":
      return "Degrading_Trilinear";
    case "TAK":
    case "TTE":
      return "Takeda";
    case "TAKS":
      return "Takeda_Slip";
    case "MTK":
    case "MTT":
      return "Modified_Takeda";
    case "NBI":
      return "Normal_Bilinear";
    case "EBI":
    case "ETR":
    case "ETE":
      return "Elastic_Bilinear";
    case "SLBI":
    case "SLTR":
      return "SLIP";
    case "SLBT":
    case "SLTT":
      return "SLIP_Tension";
    case "SLBC":
    case "SLTC":
      return "SLIP_Compression";
    default:
      break;
  }
  return "";
};

//Takeda
type TAKEDA_subType = {
  TAK: any;
  TTE: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const TAKEDA_subType: TAKEDA_subType = {
  TAK: "Trilinear",
  TTE: "Tetralinear",
};

//Modi_Takeda
type MODI_TAKEDA_subType = {
  MTK: any;
  MTT: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const MODI_TAKEDA_subType: MODI_TAKEDA_subType = {
  MTK: "Trilinear",
  MTT: "Tetralinear",
};

// Elastic
type ELASTIC_subType = {
  EBI: any;
  ETR: any;
  ETE: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const ELASTIC_subType: ELASTIC_subType = {
  EBI: "Bilinear",
  ETR: "Trilinear",
  ETE: "Tetralinear",
};

// SLIP_subType
type SLIP_subType = {
  SLBI: any;
  SLTR: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const SLIP_subType: SLIP_subType = {
  SLBI: "Bilinear",
  SLTR: "Trilinear",
};

// SLIP_Tension_Bilinear
type SLIP_Tension_subType = {
  SLBT: any;
  SLTT: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const SLIP_Tension_subType: SLIP_Tension_subType = {
  SLBT: "Bilinear",
  SLTT: "Trilinear",
};

//SLIP_Compression_Bilinear
type SLIP_Compression_subType = {
  SLBC: any;
  SLTC: any;
  [key: string]: string; // 모든 문자열 키에 대한 인덱스 시그니처 추가
};

export const SLIP_Compression_subType: SLIP_Compression_subType = {
  SLBC: "Bilinear",
  SLTC: "Trilinear",
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
