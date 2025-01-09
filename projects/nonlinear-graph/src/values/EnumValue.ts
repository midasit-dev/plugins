// TableTypeName
type TableTypeName = {
  "1": string;
  "2": string;
  "3": string;
  [key: string]: string;
};

export const TableTypeName: TableTypeName = {
  1: "TabDisp",
  2: "TabStiff",
  3: "TabMulti",
};

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
  SLBT: 2,
  SLTT: 3,
  SLBC: 2,
  SLTC: 3,
};

export const eSubType = {
  Bilinear: 1,
  Trilinear: 2,
  Tetralinear: 3,
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

// Graph data
const initValue = (DATA: any, HistoryModel: string) => {
  const dP1: number[] =
    DATA.P_DATA.length > 0 ? [...DATA.P_DATA[0]] : [NaN, NaN];
  const dP2: number[] =
    DATA.P_DATA.length > 1 ? [...DATA.P_DATA[1]] : [NaN, NaN];
  const dP3: number[] =
    DATA.P_DATA.length > 2 ? [...DATA.P_DATA[2]] : [NaN, NaN];
  const dP4: number[] =
    DATA.P_DATA.length > 3 ? [...DATA.P_DATA[3]] : [NaN, NaN];

  const dD1: number[] =
    DATA.D_DATA.length > 0 ? [...DATA.D_DATA[0]] : [NaN, NaN];
  const dD2: number[] =
    DATA.D_DATA.length > 1 ? [...DATA.D_DATA[1]] : [NaN, NaN];
  const dD3: number[] =
    DATA.D_DATA.length > 2 ? [...DATA.D_DATA[2]] : [NaN, NaN];
  const dD4: number[] =
    DATA.D_DATA.length > 3 ? [...DATA.D_DATA[3]] : [NaN, NaN];

  const dA1: number[] =
    DATA.A_DATA.length > 0 ? [...DATA.A_DATA[0]] : [NaN, NaN];
  const dA2: number[] =
    DATA.A_DATA.length > 1 ? [...DATA.A_DATA[1]] : [NaN, NaN];
  const dA3: number[] =
    DATA.A_DATA.length > 2 ? [...DATA.A_DATA[2]] : [NaN, NaN];

  const dGap: number[] = [0, 0];
  dGap[0] = HistoryModel !== "SLBC" ? DATA.INIT_GAP?.[0] : 0.0;
  dGap[1] = HistoryModel !== "SLBT" ? DATA.INIT_GAP?.[1] : 0.0;
  dGap[0] = HistoryModel !== "SLTC" ? DATA.INIT_GAP?.[0] : 0.0;
  dGap[1] = HistoryModel !== "SLTT" ? DATA.INIT_GAP?.[1] : 0.0;

  const result = {
    dP: [dP1, dP2, dP3, dP4],
    dD: [dD1, dD2, dD3, dD4],
    dA: [dA1, dA2, dA3],
    dG: dGap,
  };
  return result;
};

export const getSlipCase = (
  DATA: any,
  nTableType: number,
  HistoryModel: string,
  nSubType: number
) => {
  let dP1: number[] = [0.0, 0.0];
  let dP2: number[] = [0.0, 0.0];
  let dP3: number[] = [0.0, 0.0];
  let dP4: number[] = [0.0, 0.0];
  let dD1: number[] = [0.0, 0.0];
  let dD2: number[] = [0.0, 0.0];
  let dD3: number[] = [0.0, 0.0];
  let dD4: number[] = [0.0, 0.0];
  let dA1: number[] = [0.0, 0.0];
  let dA2: number[] = [0.0, 0.0];
  let dA3: number[] = [0.0, 0.0];
  let dGap: number[] = [0.0, 0.0];

  [dP1, dP2, dP3, dP4] = initValue(DATA, HistoryModel).dP;
  [dA1, dA2, dA3] = initValue(DATA, HistoryModel).dA;
  if (nTableType === 1) {
    [dD1, dD2, dD3, dD4] = initValue(DATA, HistoryModel).dD;
    dGap = initValue(DATA, HistoryModel).dG;

    if (Math.abs(dD1[0]) <= 0.0 || Math.abs(dD1[1]) <= 0.0) return [];
    if (Math.abs(dD2[0]) <= 0.0 || Math.abs(dD2[1]) <= 0.0) return [];

    [dA1, dA2, dA3] = getAlapa(
      nSubType,
      HistoryModel,
      true,
      dP1,
      dP2,
      dP3,
      dP4,
      dD1,
      dD2,
      dD3,
      dD4,
      dGap
    );
  }

  if (HistoryModel === "SLBT" || HistoryModel === "SLTT") {
    dP1[1] = dP1[0];
    dP2[1] = dP2[0];
    dP3[1] = dP3[0];
    dP4[1] = dP4[0];
    // dD1[1] = dD1[0];
    // dD2[1] = dD2[0];
    // dD3[1] = dD3[0];
    // dD4[1] = dD4[0];
    dA1[1] = dA1[0];
    dA2[1] = dA2[0];
    dA3[1] = dA3[0];
  }
  if (HistoryModel === "SLBC" || HistoryModel === "SLTC") {
    dP1[0] = dP1[1];
    dP2[0] = dP2[1];
    dP3[0] = dP3[1];
    dP4[0] = dP4[1];
    // dD1[0] = dD1[1];
    // dD2[0] = dD2[1];
    // dD3[0] = dD3[1];
    // dD4[0] = dD4[1];
    dA1[0] = dA1[1];
    dA2[0] = dA2[1];
    dA3[0] = dA3[1];
  }

  if (dA1[0] <= 0.0) dA1[0] = 1.0e-10;
  if (dA1[1] <= 0.0) dA1[1] = 1.0e-10;
  if (dA2[0] <= 0.0) dA2[0] = 1.0e-10;
  if (dA2[1] <= 0.0) dA2[1] = 1.0e-10;

  if (Math.abs(dP1[0]) <= 0.0 || Math.abs(dP1[1]) <= 0.0) return [];
  if (Math.abs(dA1[0]) <= 0.0 || Math.abs(dA1[1]) <= 0.0) return [];
  if (Math.abs(dA2[0]) <= 0.0 || Math.abs(dA2[1]) <= 0.0) return [];

  let X1p = 0.0,
    X2p = 0.0,
    X3p = 0.0,
    Am = 0.0,
    X1m = 0.0,
    X2m = 0.0,
    X3m = 0.0,
    dGap_p = 0.0,
    dGap_m = 0.0;
  // Option // oOm...
  let dOp = 0.0,
    dOm = 0.0;

  dGap_p = DATA.INIT_GAP?.[0];
  dGap_m = DATA.INIT_GAP?.[1];
  dGap_p = dGap_p > 0 ? dGap_p / Math.max(dGap_p, dGap_m) : 0;
  dGap_m = dGap_m > 0 ? dGap_m / Math.max(dGap_p, dGap_m) : 0;
  if (dGap_p < 0.0 || dGap_m < 0.0) return [];

  if (
    HistoryModel === "SLBI" ||
    HistoryModel === "SLBT" ||
    HistoryModel === "SLBC"
  ) {
    // Bilinear
    X1p = dA1[0];
    X2p = X1p * 2.0;
    dP2[0] = X1p * dP1[0] + dP1[0];

    Am = (dP1[1] / (dA1[1] * dP1[0])) * X1p;
    X1m = Am * dA1[1];
    X2m = 2.0 * X1m;
    dP2[1] = X1m * dP1[1] + dP1[1];
    if (Math.abs(dP2[0]) <= 0.0 || Math.abs(dP2[1]) <= 0.0) return [];

    dGap_p *= X2p / 5.0;
    dGap_m *= X2p / 5.0;
    X1p += dGap_p;
    X2p += dGap_p;
    X1m += dGap_m;
    X2m += dGap_m;

    const dMaxX = Math.max(X2p, X2m);
    const dMaxY = Math.max(dP2[0], dP2[1]);
    if (Math.abs(dMaxX) <= 0.0 || Math.abs(dMaxY) <= 0.0) return [];

    // x
    let dx: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
    dx[0] = 0;
    dx[1] = (2.0 * dGap_p) / dMaxX;
    dx[2] = (2.0 * X1p) / dMaxX;
    dx[3] = (2.0 * X2p) / dMaxX;
    dx[4] = (-2.0 * dGap_m) / dMaxX;
    dx[5] = (-2.0 * X1m) / dMaxX;
    dx[6] = (-2.0 * X2m) / dMaxX;
    dx = setRoundNumber(dx);
    // y
    let dy: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
    dy[0] = 0;
    dy[1] = 0;
    dy[2] = (2.0 * dP1[0]) / dMaxY;
    dy[3] = (2.0 * dP2[0]) / dMaxY;
    dy[4] = 0;
    dy[5] = (-2.0 * dP1[1]) / dMaxY;
    dy[6] = (-2.0 * dP2[1]) / dMaxY;
    dy = setRoundNumber(dy);

    [dx, dy] = setEndPoint(7, dx, dy);

    if (HistoryModel === "SLBT") {
      dx[4] = dx[5] = dx[6] = -2;
      dy[4] = dy[5] = dy[6] = 0;
    }
    if (HistoryModel === "SLBC") {
      dx[1] = dx[2] = dx[3] = 2;
      dy[1] = dy[2] = dy[3] = 0;
    }

    dGap_p *= 2.0 / dMaxX;
    dGap_m *= -2.0 / dMaxX;

    if (HistoryModel === "SLBI" || HistoryModel === "SLBT") {
      const dKE =
        Math.abs(dx[2] - dGap_p) < 1e-10 ? 1 : dy[2] / (dx[2] - dGap_p);
      dOp = dx[3] - dy[3] / dKE;
    }
    if (HistoryModel === "SLBI" || HistoryModel === "SLBC") {
      const dKE =
        Math.abs(dx[5] - dGap_m) < 1e-10 ? 1 : dy[5] / (dx[5] - dGap_m);
      dOm = dx[6] - dy[6] / dKE;
    }
    const dO = [dOp, dOm];
    const xyPoint = getPointXY(4, dx, dy, dO);

    return xyPoint;
  } else {
    // Trilinear
    X1p = dA1[0] * dA2[0];
    X2p = X1p + (dP2[0] / dP1[0] - 1) * dA2[0];
    X3p = 2 * X2p;
    dP3[0] = (X2p / dA1[0]) * dP1[0] + dP2[0];

    Am = (dP1[1] / (dA1[1] * dA2[1] * dP1[0])) * X1p;
    X1m = Am * dA1[1] * dA2[1];
    X2m = X1m + Am * (dP2[1] / dP1[1] - 1) * dA2[1];
    X3m = 2.0 * X2m;
    dP3[1] = (X2m / (Am * dA1[1])) * dP1[1] + dP2[1];
    if (Math.abs(dP3[0]) <= 0 || Math.abs(dP3[1]) <= 0) return [];
    dGap_p *= X3p / 5;
    dGap_m *= X3p / 5;
    X1p += dGap_p;
    X2p += dGap_p;
    X3p += dGap_p;
    X1m += dGap_m;
    X2m += dGap_m;
    X3m += dGap_m;

    const dMaxX = Math.max(X3p, X3m);
    const dMaxY = Math.max(dP3[0], dP3[1]);
    if (Math.abs(dMaxX) <= 0 || Math.abs(dMaxY) <= 0) return [];

    // x
    let dx: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
    dx[0] = 0;
    dx[1] = (2.0 * dGap_p) / dMaxX;
    dx[2] = (2.0 * X1p) / dMaxX;
    dx[3] = (2.0 * X2p) / dMaxX;
    dx[4] = (2.0 * X3p) / dMaxX;
    dx[5] = (-2.0 * dGap_m) / dMaxX;
    dx[6] = (-2.0 * X1m) / dMaxX;
    dx[7] = (-2.0 * X2m) / dMaxX;
    dx[8] = (-2.0 * X3m) / dMaxX;
    dx = setRoundNumber(dx);
    // y
    let dy: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
    dy[0] = 0;
    dy[1] = 0;
    dy[2] = (2.0 * dP1[0]) / dMaxY;
    dy[3] = (2.0 * dP2[0]) / dMaxY;
    dy[4] = (2.0 * dP3[0]) / dMaxY;
    dy[5] = 0;
    dy[6] = (-2.0 * dP1[1]) / dMaxY;
    dy[7] = (-2.0 * dP2[1]) / dMaxY;
    dy[8] = (-2.0 * dP3[1]) / dMaxY;
    dy = setRoundNumber(dy);

    [dx, dy] = setEndPoint(9, dx, dy);

    if (HistoryModel === "SLTT") {
      dx[5] = dx[6] = dx[7] = dx[8] = -2.0;
      dy[5] = dy[6] = dy[7] = dy[8] = 0;
    }
    if (HistoryModel === "SLTC") {
      dx[1] = dx[2] = dx[3] = dx[4] = 2.0;
      dy[1] = dy[2] = dy[3] = dy[4] = 0;
    }

    dGap_p *= 2.0 / dMaxX;
    dGap_m *= -2.0 / dMaxX;
    if (HistoryModel === "SLTR" || HistoryModel === "SLTT") {
      const dKE =
        Math.abs(dx[2] - dGap_p) < 1e-10 ? 1 : dy[2] / (dx[2] - dGap_p);
      dOp = dx[4] - dy[4] / dKE;
    }
    if (HistoryModel === "SLTR" || HistoryModel === "SLTC") {
      const dKE =
        Math.abs(dx[6] - dGap_m) < 1e-10 ? 1 : dy[6] / (dx[6] - dGap_m);
      dOm = dx[8] - dy[8] / dKE;
    }

    const dO = [dOp, dOm];
    const xyPoint = getPointXY(5, dx, dy, dO);
    return xyPoint;
  }
};

export const getBinlinearCase = (
  DATA: any,
  nTableType: number,
  HistoryModel: string,
  nSubType: number
) => {
  let dP1: number[] = [0.0, 0.0];
  let dP2: number[] = [0.0, 0.0];
  let dP3: number[] = [0.0, 0.0];
  let dP4: number[] = [0.0, 0.0];
  let dD1: number[] = [0.0, 0.0];
  let dD2: number[] = [0.0, 0.0];
  let dD3: number[] = [0.0, 0.0];
  let dD4: number[] = [0.0, 0.0];
  let dA1: number[] = [0.0, 0.0];
  let dA2: number[] = [0.0, 0.0];
  let dA3: number[] = [0.0, 0.0];
  let dGap: number[] = [0.0, 0.0];

  [dP1, dP2, dP3, dP4] = initValue(DATA, HistoryModel).dP;
  [dA1, dA2, dA3] = initValue(DATA, HistoryModel).dA;

  if (nTableType === 1) {
    [dD1, dD2, dD3, dD4] = initValue(DATA, HistoryModel).dD;
    dGap = initValue(DATA, HistoryModel).dG;

    if (Math.abs(dD1[0]) <= 0.0 || Math.abs(dD1[1]) <= 0.0) return [];
    if (Math.abs(dD2[0]) <= 0.0 || Math.abs(dD2[1]) <= 0.0) return [];

    [dA1, dA2, dA3] = getAlapa(
      nSubType,
      HistoryModel,
      false,
      dP1,
      dP2,
      dP3,
      dP4,
      dD1,
      dD2,
      dD3,
      dD4,
      dGap
    );
  }
  if (dA1[0] <= 0.0) dA1[0] = 1.0e-10;
  if (dA1[1] <= 0.0) dA1[1] = 1.0e-10;

  if (Math.abs(dP1[0]) <= 0.0 || Math.abs(dP1[1]) <= 0.0) return [];
  if (Math.abs(dA1[0]) <= 0.0 || Math.abs(dA1[1]) <= 0.0) return [];

  let X1p = 0.0,
    X2p = 0.0,
    Am = 0.0,
    X1m = 0.0,
    X2m = 0.0;
  // Option // oOm...
  let dOp = 0.0,
    dOm = 0.0;

  if (nTableType === 1 && HistoryModel === "EBI") {
    X1p = dD1[0];
    X2p = dD2[0];
    X1m = dD1[1];
    X2m = dD2[1];
  } else {
    X1p = dA1[0];
    X2p = X1p * 2.0;
    dP2[0] = X1p * dP1[0] + dP1[0];

    Am = (dP1[1] / (dA1[1] * dP1[0])) * X1p;
    X1m = Am * dA1[1];
    X2m = 2.0 * X1m;
    dP2[1] = X1m * dP1[1] + dP1[1];
  }

  const dMaxX1 = Math.max(X1p, X1m);
  const dMaxX2 = Math.max(X2p, X2m);
  const dMaxX = Math.max(dMaxX1, dMaxX2);
  const dMaxY1 = Math.max(dP1[0], dP1[1]);
  const dMaxY2 = Math.max(dP2[0], dP2[1]);
  const dMaxY = Math.max(dMaxY1, dMaxY2);
  if (Math.abs(dMaxX) <= 0.0 || Math.abs(dMaxY) <= 0.0) return [];

  // x
  let dx: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
  dx[0] = 0;
  dx[1] = (2.0 * X1p) / dMaxX;
  dx[2] = (2.0 * X2p) / dMaxX;
  dx[3] = (-2.0 * X1m) / dMaxX;
  dx[4] = (-2.0 * X2m) / dMaxX;
  dx = setRoundNumber(dx);

  // y
  let dy: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
  dy[0] = 0;
  dy[1] = (2.0 * dP1[0]) / dMaxY;
  dy[2] = (2.0 * dP2[0]) / dMaxY;
  dy[3] = (-2.0 * dP1[1]) / dMaxY;
  dy[4] = (-2.0 * dP2[1]) / dMaxY;
  dy = setRoundNumber(dy);

  [dx, dy] = setEndPoint(5, dx, dy);

  let dO = [dOp, dOm];
  const xyPoint = getPointXY(1, dx, dy, dO);
  return xyPoint;
  // return [dx.sort((a, b) => a - b), dy.sort((a, b) => a - b), dO];
};

export const getTrilinearCase = (
  DATA: any,
  nTableType: number,
  HistoryModel: string,
  nSubType: number
) => {
  let dP1: number[] = [0.0, 0.0];
  let dP2: number[] = [0.0, 0.0];
  let dP3: number[] = [0.0, 0.0];
  let dP4: number[] = [0.0, 0.0];
  let dD1: number[] = [0.0, 0.0];
  let dD2: number[] = [0.0, 0.0];
  let dD3: number[] = [0.0, 0.0];
  let dD4: number[] = [0.0, 0.0];
  let dA1: number[] = [0.0, 0.0];
  let dA2: number[] = [0.0, 0.0];
  let dA3: number[] = [0.0, 0.0];
  let dGap: number[] = [0.0, 0.0];

  [dP1, dP2, dP3, dP4] = initValue(DATA, HistoryModel).dP;
  [dA1, dA2, dA3] = initValue(DATA, HistoryModel).dA;

  if (nTableType === 1) {
    [dD1, dD2, dD3, dD4] = initValue(DATA, HistoryModel).dD;
    dGap = initValue(DATA, HistoryModel).dG;

    if (Math.abs(dD1[0]) <= 0.0 || Math.abs(dD1[1]) <= 0.0) return [];
    if (Math.abs(dD2[0]) <= 0.0 || Math.abs(dD2[1]) <= 0.0) return [];
    if (Math.abs(dD3[0]) <= 0.0 || Math.abs(dD3[1]) <= 0.0) return [];

    [dA1, dA2, dA3] = getAlapa(
      nSubType,
      HistoryModel,
      false,
      dP1,
      dP2,
      dP3,
      dP4,
      dD1,
      dD2,
      dD3,
      dD4,
      dGap
    );
  }

  if (dA1[0] <= 0.0) dA1[0] = 1.0e-10;
  if (dA1[1] <= 0.0) dA1[1] = 1.0e-10;
  if (dA2[0] <= 0.0) dA2[0] = 1.0e-10;
  if (dA2[1] <= 0.0) dA2[1] = 1.0e-10;

  if (
    Math.abs(dP1[0]) - Math.abs(dP2[0]) > 0.0 ||
    Math.abs(dP1[1]) - Math.abs(dP2[1]) > 0.0
  )
    return [];
  if (Math.abs(dP1[0]) <= 0.0 || Math.abs(dP1[1]) <= 0.0) return [];
  if (Math.abs(dP2[0]) <= 0.0 || Math.abs(dP2[1]) <= 0.0) return [];
  if (Math.abs(dA1[0]) <= 0.0 || Math.abs(dA1[1]) <= 0.0) return [];
  if (Math.abs(dA2[0]) <= 0.0 || Math.abs(dA2[1]) <= 0.0) return [];

  let X1p = 0.0,
    X2p = 0.0,
    X3p = 0.0,
    Am = 0.0,
    X1m = 0.0,
    X2m = 0.0,
    X3m = 0.0;
  // Option // oOm...
  let dOp = 0.0,
    dOm = 0.0;

  if (
    nTableType === 1 &&
    (HistoryModel === "ORG" || HistoryModel === "PKO" || HistoryModel === "ETR")
  ) {
    X1p = dD1[0];
    X2p = dD2[0];
    X3p = dD3[0];
    X1m = dD1[1];
    X2m = dD2[1];
    X3m = dD3[1];
  } else {
    X1p = dA1[0] * dA2[0];
    X2p = X1p + (dP2[0] / dP1[0] - 1.0) * dA2[0];
    X3p = 2.0 * X2p;
    dP3[0] = (X2p / dA1[0]) * dP1[0] + dP2[0];

    Am = (dP1[1] / (dA1[1] * dA2[1] * dP1[0])) * X1p;
    X1m = Am * dA1[1] * dA2[1];
    X2m = X1m + Am * (dP2[1] / dP1[1] - 1.0) * dA2[1];
    X3m = 2.0 * X2m;
    dP3[1] = (X2m / (Am * dA1[1])) * dP1[1] + dP2[1];
  }

  const dMaxX1 = Math.max(X1p, X1m);
  const dMaxX2 = Math.max(X2p, X2m);
  const dMaxX3 = Math.max(X3p, X3m);
  const dMaxX = Math.max(dMaxX1, dMaxX2, dMaxX3);
  const dMaxY1 = Math.max(dP1[0], dP1[1]);
  const dMaxY2 = Math.max(dP2[0], dP2[1]);
  const dMaxY3 = Math.max(dP3[0], dP3[1]);
  const dMaxY = Math.max(dMaxY1, dMaxY2, dMaxY3);
  if (Math.abs(dMaxX) <= 0.0 || Math.abs(dMaxY) <= 0.0) return [];

  // x
  let dx: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
  dx[0] = 0;
  dx[1] = (2.0 * X1p) / dMaxX;
  dx[2] = (2.0 * X2p) / dMaxX;
  dx[3] = (2.0 * X3p) / dMaxX;
  dx[4] = (-2.0 * X1m) / dMaxX;
  dx[5] = (-2.0 * X2m) / dMaxX;
  dx[6] = (-2.0 * X3m) / dMaxX;
  dx = setRoundNumber(dx);

  // y
  let dy: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
  dy[0] = 0;
  dy[1] = (2.0 * dP1[0]) / dMaxY;
  dy[2] = (2.0 * dP2[0]) / dMaxY;
  dy[3] = (2.0 * dP3[0]) / dMaxY;
  dy[4] = (-2.0 * dP1[1]) / dMaxY;
  dy[5] = (-2.0 * dP2[1]) / dMaxY;
  dy[6] = (-2.0 * dP3[1]) / dMaxY;
  dy = setRoundNumber(dy);

  [dx, dy] = setEndPoint(7, dx, dy);

  let dO = [dOp, dOm];
  const xyPoint = getPointXY(2, dx, dy, dO);
  return xyPoint;
};

export const getTetralinearCase = (
  DATA: any,
  nTableType: number,
  HistoryModel: string,
  nSubType: number
) => {
  let dP1: number[] = [0.0, 0.0];
  let dP2: number[] = [0.0, 0.0];
  let dP3: number[] = [0.0, 0.0];
  let dP4: number[] = [0.0, 0.0];
  let dD1: number[] = [0.0, 0.0];
  let dD2: number[] = [0.0, 0.0];
  let dD3: number[] = [0.0, 0.0];
  let dD4: number[] = [0.0, 0.0];
  let dA1: number[] = [0.0, 0.0];
  let dA2: number[] = [0.0, 0.0];
  let dA3: number[] = [0.0, 0.0];
  let dGap: number[] = [0.0, 0.0];

  [dP1, dP2, dP3, dP4] = initValue(DATA, HistoryModel).dP;
  [dA1, dA2, dA3] = initValue(DATA, HistoryModel).dA;

  if (nTableType === 1) {
    [dD1, dD2, dD3, dD4] = initValue(DATA, HistoryModel).dD;
    dGap = initValue(DATA, HistoryModel).dG;

    if (Math.abs(dD1[0]) <= 0.0 || Math.abs(dD1[1]) <= 0.0) return [];
    if (Math.abs(dD2[0]) <= 0.0 || Math.abs(dD2[1]) <= 0.0) return [];
    if (Math.abs(dD3[0]) <= 0.0 || Math.abs(dD3[1]) <= 0.0) return [];
    if (Math.abs(dD4[0]) <= 0.0 || Math.abs(dD4[1]) <= 0.0) return [];

    [dA1, dA2, dA3] = getAlapa(
      nSubType,
      HistoryModel,
      false,
      dP1,
      dP2,
      dP3,
      dP4,
      dD1,
      dD2,
      dD3,
      dD4,
      dGap
    );
  }

  if (dA1[0] <= 0.0) dA1[0] = 1.0e-10;
  if (dA1[1] <= 0.0) dA1[1] = 1.0e-10;
  if (dA2[0] <= 0.0) dA2[0] = 1.0e-10;
  if (dA2[1] <= 0.0) dA2[1] = 1.0e-10;
  if (dA3[0] <= 0.0) dA3[0] = 1.0e-10;
  if (dA3[1] <= 0.0) dA3[1] = 1.0e-10;

  if (
    Math.abs(dP1[0]) - Math.abs(dP2[0]) > 0.0 ||
    Math.abs(dP1[1]) - Math.abs(dP2[1]) > 0.0
  )
    return [];
  if (
    Math.abs(dP2[0]) - Math.abs(dP3[0]) > 0.0 ||
    Math.abs(dP2[1]) - Math.abs(dP3[1]) > 0.0
  )
    return [];
  if (Math.abs(dP1[0]) <= 0.0 || Math.abs(dP1[1]) <= 0.0) return [];
  if (Math.abs(dP2[0]) <= 0.0 || Math.abs(dP2[1]) <= 0.0) return [];
  if (Math.abs(dP3[0]) <= 0.0 || Math.abs(dP3[1]) <= 0.0) return [];
  if (Math.abs(dA1[0]) <= 0.0 || Math.abs(dA1[1]) <= 0.0) return [];
  if (Math.abs(dA2[0]) <= 0.0 || Math.abs(dA2[1]) <= 0.0) return [];
  if (Math.abs(dA3[0]) <= 0.0 || Math.abs(dA3[1]) <= 0.0) return [];

  let X1p = 0.0,
    X2p = 0.0,
    X3p = 0.0,
    X4p = 0.0,
    Am = 0.0,
    X1m = 0.0,
    X2m = 0.0,
    X3m = 0.0,
    X4m = 0.0;
  // Fep, Fem
  let FEp = 0.0,
    FEm = 0.0;
  // Option // oOm...
  let dOp = 0.0,
    dOm = 0.0;

  if (nTableType === 1 && HistoryModel === "ETE") {
    X1p = dD1[0];
    X2p = dD2[0];
    X3p = dD3[0];
    X4p = dD4[0];
    X1m = dD1[1];
    X2m = dD2[1];
    X3m = dD3[1];
    X4m = dD4[1];
  } else {
    X1p = dA1[0] * dA2[0] * dA3[0];
    X2p = X1p + dA2[0] * dA3[0] * (dP2[0] / dP1[0] - 1);
    X3p = X2p + dA1[0] * dA3[0] * (dP3[0] / dP1[0] - dP2[0] / dP1[0]);
    X4p = 1.5 * X3p;
    if (X1p <= 0) return [];

    Am = (dP1[1] / (dA1[1] * dA2[1] * dA3[1] * dP1[0])) * X1p;
    X1m = Am * dA1[1] * dA2[1] * dA3[1];
    X2m = X1m + Am * dA2[1] * dA3[1] * (dP2[1] / dP1[1] - 1);
    X3m = X2m + Am * dA1[1] * dA3[1] * (dP3[1] / dP1[1] - dP2[1] / dP1[1]);
    X4m = 1.5 * X3m;
    if (X1m <= 0) return [];
  }
  FEp = dP3[0] + (dA3[0] * (X3p - X4p) * dP1[0]) / X1p;
  FEm = dP3[1] + (dA3[1] * (X3m - X4m) * dP1[1]) / X1m;

  const dMaxX1 = Math.max(X1p, X1m);
  const dMaxX2 = Math.max(X2p, X2m);
  const dMaxX3 = Math.max(X3p, X3m);
  const dMaxX4 = Math.max(X4p, X4m);
  const dMaxX = Math.max(dMaxX1, dMaxX2, dMaxX3, dMaxX4);
  const dMaxY1 = Math.max(dP1[0], dP1[1]);
  const dMaxY2 = Math.max(dP2[0], dP2[1]);
  const dMaxY3 = Math.max(dP3[0], dP3[1]);
  const dMaxY4 = Math.max(FEp, FEm);
  const dMaxY = Math.max(dMaxY1, dMaxY2, dMaxY3, dMaxY4);
  if (Math.abs(dMaxX) <= 0.0 || Math.abs(dMaxY) <= 0.0) return [];

  // x
  let dx: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
  dx[0] = 0;
  dx[1] = (2.0 * X1p) / dMaxX;
  dx[2] = (2.0 * X2p) / dMaxX;
  dx[3] = (2.0 * X3p) / dMaxX;
  dx[4] = (2.0 * X4p) / dMaxX;
  dx[5] = (-2.0 * X1m) / dMaxX;
  dx[6] = (-2.0 * X2m) / dMaxX;
  dx[7] = (-2.0 * X3m) / dMaxX;
  dx[8] = (-2.0 * X4m) / dMaxX;
  dx = setRoundNumber(dx);

  // y
  let dy: number[] = new Array(9).fill(0); // 길이 6, 초기값 0
  dy[0] = 0;
  dy[1] = (2.0 * dP1[0]) / dMaxY;
  dy[2] = (2.0 * dP2[0]) / dMaxY;
  dy[3] = (2.0 * dP3[0]) / dMaxY;
  dy[4] = (2.0 * FEp) / dMaxY;
  dy[5] = (-2.0 * dP1[1]) / dMaxY;
  dy[6] = (-2.0 * dP2[1]) / dMaxY;
  dy[7] = (-2.0 * dP3[1]) / dMaxY;
  dy[8] = (-2.0 * FEm) / dMaxY;
  dy = setRoundNumber(dy);

  [dx, dy] = setEndPoint(9, dx, dy);

  let dO = [dOp, dOm];
  const xyPoint = getPointXY(3, dx, dy, dO);
  return xyPoint;
};

const getAlapa = (
  nType: number,
  nHysModel: string,
  bSlip: boolean,
  dP1: number[],
  dP2: number[],
  dP3: number[],
  dP4: number[],
  dD1: number[],
  dD2: number[],
  dD3: number[],
  dD4: number[],
  dGap: number[]
) => {
  let dA1 = [0, 0];
  let dA2 = [0, 0];
  let dA3 = [0, 0];
  let dK = [0, 0]; // ???
  const dTol = 1.0e-9;
  // dk
  if (bSlip) {
    for (let i = 0; i < 2; ++i) {
      if (dD1[i] - dGap[i] <= dTol || dP1[i] <= dTol) dK[i] = 1.0; // 예외 처리
      else dK[i] = dP1[i] / (dD1[i] - dGap[i]);
    }
  } else {
    for (let i = 0; i < 2; ++i) {
      if (dD1[i] <= dTol || dP1[i] <= dTol) dK[i] = 1.0; // 예외 처리
      else dK[i] = dP1[i] / dD1[i];
    }
  }

  if (
    nHysModel !== "ORG" &&
    nHysModel !== "EBI" &&
    nHysModel !== "ETR" &&
    nHysModel !== "ETE" &&
    // nHysModel !== "" && // Origin-Oriented Tetralinear(17)
    nHysModel !== "PKO"
  ) {
    dK[0] = dK[1] = Math.max(dK[0], dK[1]);
  }

  // A
  switch (nType) {
    case 3: //Tetralinear
      for (let i = 0; i < 2; i++) {
        if (Math.abs(dD4[i] - dD3[i]) < dTol) {
          if (Math.abs(dP4[i] - dP3[i]) <= dTol) dA3[i] = 1.0;
          else return [];
        } else dA3[i] = (dP4[i] - dP3[i]) / (dD3[i] - dD4[i]) / dK[i]; // 분모의 순서 주의!
      }
    // fallthrough
    case 2: //Trilinear
      for (let i = 0; i < 2; i++) {
        if (Math.abs(dD3[i] - dD2[i]) < dTol) {
          if (Math.abs(dP3[i] - dP2[i]) <= dTol) dA2[i] = 1.0;
          else return [];
        } else dA2[i] = (dP3[i] - dP2[i]) / (dD3[i] - dD2[i]) / dK[i];
      }
    // fallthrough
    case 1: //Binlinear
      for (let i = 0; i < 2; i++) {
        if (Math.abs(dD2[i] - dD1[i]) < dTol) {
          if (Math.abs(dP2[i] - dP1[i]) <= dTol) dA1[i] = 1.0;
          else return [];
        } else dA1[i] = (dP2[i] - dP1[i]) / (dD2[i] - dD1[i]) / dK[i];
      }
      break;
    default:
      return [];
  }
  return [dA1, dA2, dA3, dK];
};

const getPointXY = (
  nType: number,
  xArr: number[],
  yArr: number[],
  doArr: number[]
) => {
  const scaleFactor = 1e10; // 10^10으로 배율 적용
  // 정수 변환 함수 (배율 적용 후 반올림)
  const toScaledInteger = (value: number): number =>
    Math.round(value * scaleFactor);
  let xyPoint: any[] = [];
  console.log("!!!!!!!!!!", xArr);
  console.log("!!!!!!!!!!", yArr);
  console.log("@@@@@@@@@@@@@", doArr);
  let bstop = false;
  for (let i = 0; i <= 9; i++) {
    const x = xArr[i];
    const y = yArr[i];

    switch (nType) {
      case 1: // [Bilinear]
        if (i > 4) bstop = true;
        else if (i === 2 || i === 4) {
          xyPoint.push({ x: x, y: y });
          xyPoint.push({ x: xArr[i - 1], y: yArr[i - 1] });
          xyPoint.push({ x: 0, y: 0 });
        } else xyPoint.push({ x: x, y: y });
        break;
      case 2: // [Trilinear]
        if (i > 6) bstop = true;
        else if (i === 3 || i === 6) {
          xyPoint.push({ x: x, y: y });
          xyPoint.push({ x: xArr[i - 1], y: yArr[i - 1] });
          xyPoint.push({ x: xArr[i - 2], y: yArr[i - 2] });
          xyPoint.push({ x: 0, y: 0 });
        } else xyPoint.push({ x: x, y: y });
        break;
      case 3: // [Tetralinear]
        if (i > 8) bstop = true;
        else if (i === 4 || i === 8) {
          xyPoint.push({ x: x, y: y });
          xyPoint.push({ x: xArr[i - 1], y: yArr[i - 1] });
          xyPoint.push({ x: xArr[i - 2], y: yArr[i - 2] });
          xyPoint.push({ x: xArr[i - 3], y: yArr[i - 3] });
          xyPoint.push({ x: 0, y: 0 });
        } else xyPoint.push({ x: x, y: y });
        break;
      case 4: // SLIP Bilinear
        if (i > 7) bstop = true;
        else if (i === 4 || i === 7) {
          xyPoint.push({
            x: i === 4 ? doArr[0] : doArr[1],
            y: 0,
          });
          xyPoint.push({ x: 0, y: 0 });
          xyPoint.push({ x: x, y: y });
        } else xyPoint.push({ x: x, y: y });
        break;
      case 5: // SLIP Trilinear
        if (i > 9) bstop = true;
        else if (i === 5 || i === 9) {
          xyPoint.push({
            x: i === 5 ? doArr[0] : doArr[1],
            y: 0,
          });
          xyPoint.push({ x: 0, y: 0 });
          xyPoint.push({ x: x, y: y });
        } else xyPoint.push({ x: x, y: y });
        break;
      default:
        break;
    }
    if (bstop) break;
  }
  return xyPoint;
};

const setEndPoint = (
  nDataLength: number,
  xArr: number[],
  yArr: number[]
): [number[], number[]] => {
  const endIndex = nDataLength;
  const startIndex = Math.floor(nDataLength / 2);

  let xa0 = xArr[endIndex - 1]; // last
  let ya0 = yArr[endIndex - 1];
  let xa1 = xArr[endIndex - 2]; // last -1
  let ya1 = yArr[endIndex - 2];

  let xb1 = xArr[startIndex]; // middle
  let yb1 = yArr[startIndex];
  let xb0 = xArr[startIndex - 1]; // middle -1
  let yb0 = yArr[startIndex - 1];

  let dSlope, dXtmp, dYtmp;
  if (xa0 > -2.0 && ya0 > -2.0) {
    if (xa0 == xa1) return [xArr, yArr];
    dSlope = (ya1 - ya0) / (xa1 - xa0);
    dYtmp = dSlope * (-2.0 - xa0) + ya0; // (-2.0, dYtmp)
    dXtmp = (-2.0 - ya0) / dSlope + xa0; // (dXtmp, -2.0)
    if (dYtmp >= -2.0) {
      xa0 = -2.0;
      ya0 = dYtmp;
    } else if (dXtmp >= -2.0) {
      xa0 = dXtmp;
      ya0 = -2.0;
    }
  } else if (xb1 < 2.0 && yb1 < 2.0) {
    if (xb0 == xb1) return [xArr, yArr];
    dSlope = (yb1 - yb0) / (xb1 - xb0);
    dYtmp = dSlope * (2.0 - xb0) + yb0; // (2.0, dYtmp)
    dXtmp = (2.0 - yb0) / dSlope + xb0; // (dXtmp, 2.0)
    if (dYtmp <= 2.0) {
      xb1 = 2.0;
      yb1 = dYtmp;
    } else if (dXtmp <= 2.0) {
      xb1 = dXtmp;
      yb1 = 2.0;
    }
  }

  let setXarr = [...xArr];
  let setYarr = [...yArr];
  setXarr[endIndex - 1] = xa0;
  setYarr[endIndex - 1] = ya0;
  setXarr[startIndex] = xb1;
  setYarr[startIndex] = yb1;

  return [setXarr, setYarr];
};

const setRoundNumber = (arr: number[]) => {
  // 부동소수점 연산을 위해 1e10 까지만 계산산
  let setArr = [...arr];

  setArr.forEach((value, idx) => {
    setArr[idx] = Math.round(setArr[idx] * 1e10) / 1e10;
  });
  return setArr;
};
