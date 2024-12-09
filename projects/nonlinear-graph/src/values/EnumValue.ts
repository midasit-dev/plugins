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
