/**
 * @fileoverview 엑셀 계산서 생성을 위한 report JSON 빌더.
 * v1의 `ExcelJsonResult` 스펙을 그대로 유지하되, v2의 per-pile topLevel과
 * v2 도메인 데이터(PileDataItem / SoilTable 등)를 입력으로 받습니다.
 *
 * 출력 형태(키 목록)는 BaseSheet*.xlsx 템플릿이 기대하는 필드와 1:1 매칭됩니다.
 */

import { CalculateProperties } from "../../utils_pyscript";
import { PileSpringCalcResult } from "../../states/stateCalcResult";
import { PileBasicDim, PileDataItem } from "../../types/typePileDomain";
import { SoilBasic, SoilTable } from "../../types/typeSoilDomain";
import {
  convertPileDataForCalc,
  convertSoilDataForCalc,
  resolveBaseTopLevel,
  LegacyPileCalcItem,
  LegacySoilCalcItem,
} from "../converters/pileCalcInputConverter";

type Translate = (key: string) => string;

export interface ExcelJsonInput {
  translate: Translate;
  projectName: string;
  pileDataList: PileDataItem[];
  pileBasicDim: PileBasicDim;
  soilBasic: SoilBasic;
  soilLayers: SoilTable[];
  calcResult: PileSpringCalcResult;
  planViewImage: string;
  frontViewImage: string;
  sideViewImage: string;
}

const round = (value: number | string, digits: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Number(n.toFixed(digits));
};

const buildGeneralRows = (
  piles: LegacyPileCalcItem[],
  translate: Translate
): { items: any[]; totalPileNums: number } => {
  let total = 0;
  const items = piles.map((pile, i) => {
    const topProperty = CalculateProperties(pile, "top", "unreinforced");
    total += Number(pile.PileNums);
    return {
      __PileName: `(${i + 1}) ${pile.pileName}`,
      // per-pile topLevel — v1에서는 단일 기초 값이지만, v2는 말뚝별 값을 표기
      __TopLevel: round(pile.topLevel, 3),
      __PileType: translate(pile.pileType),
      __ConstructionMethod: translate(pile.constructionMethod),
      __HeadCondition: translate(pile.headCondition),
      __BottomCondition: translate(pile.bottomCondition),
      __PileDia: round(topProperty[3], 3),
      __PileLength: round(pile.pileLength, 2),
    };
  });
  return { items, totalPileNums: total };
};

const buildPilePropertyRows = (
  piles: LegacyPileCalcItem[],
  translate: Translate
) => {
  return piles.map((pile, i) => {
    const topProperty = CalculateProperties(pile, "top", "unreinforced");
    const bottomProperty = CalculateProperties(pile, "bottom", "unreinforced");

    // 상/하부/단일 말뚝 라벨
    const pileType_Name = pile.compositeTypeCheck
      ? translate("PileType2")
      : translate("PileType1");
    const pileType_Name2 = pile.compositeTypeCheck
      ? translate("PileType3")
      : translate("PileType1");

    let top_conc_E = 0,
      top_conc_Area = 0,
      top_conc_I = 0;
    let top_steel_E = 0,
      top_steel_Area = 0,
      top_steel_I = 0;
    let bot_conc_E = 0,
      bot_conc_Area = 0,
      bot_conc_I = 0;
    let bot_steel_E = 0,
      bot_steel_Area = 0,
      bot_steel_I = 0;

    if (pile.pileType === "Soil_Cement_Pile") {
      top_steel_E = topProperty[6];
      top_steel_Area = topProperty[4];
      top_steel_I = topProperty[8];
      top_conc_E = topProperty[7];
      top_conc_Area = topProperty[5];
      top_conc_I = topProperty[9];
    } else {
      top_conc_E = topProperty[1];
      top_conc_Area = topProperty[0];
      top_conc_I = topProperty[2];
    }

    if (pile.compositeTypeCheck) {
      if (pile.compPileType === "Soil_Cement_Pile") {
        bot_steel_E = bottomProperty[6];
        bot_steel_Area = bottomProperty[4];
        bot_steel_I = bottomProperty[8];
        bot_conc_E = bottomProperty[7];
        bot_conc_Area = bottomProperty[5];
        bot_conc_I = bottomProperty[9];
      } else {
        bot_conc_E = bottomProperty[1];
        bot_conc_Area = bottomProperty[0];
        bot_conc_I = bottomProperty[2];
      }
    }

    return {
      __PilePropertyIndex: `(${i + 1}) ${pile.pileName}`,
      __PileProperty_TopName: pileType_Name,
      __PileProperty_BotName: pileType_Name2,
      __Top_Conc_E: round(top_conc_E, 0),
      __Top_Conc_Area: round(top_conc_Area, 3),
      __Top_Conc_I: round(top_conc_I, 3),
      __Top_Steel_E: round(top_steel_E, 0),
      __Top_Steel_Area: round(top_steel_Area, 3),
      __Top_Steel_I: round(top_steel_I, 3),
      __Bot_Conc_E: round(bot_conc_E, 0),
      __Bot_Conc_Area: round(bot_conc_Area, 3),
      __Bot_Conc_I: round(bot_conc_I, 3),
      __Bot_Steel_E: round(bot_steel_E, 0),
      __Bot_Steel_Area: round(bot_steel_Area, 3),
      __Bot_Steel_I: round(bot_steel_I, 3),
    };
  });
};

const buildSoilConditionTable = (
  soilData: LegacySoilCalcItem[],
  groundLevel: number,
  translate: Translate
) => {
  let level = Number(groundLevel);
  return soilData.map((soil) => {
    const row = [
      soil.LayerNo,
      translate(soil.LayerType),
      round(level, 3),
      round(soil.Depth, 3),
      round(soil.AvgNValue, 0),
      round(soil.gamma, 1),
      round(soil.aE0, 0),
      round(soil.aE0_Seis, 0),
      round(soil.vd, 1),
      round(soil.Vsi, 2),
      round(soil.ED, 0),
      round(soil.DE, 2),
    ];
    level -= Number(soil.Depth);
    return row;
  });
};

const buildSoilRCoefRows = (
  piles: LegacyPileCalcItem[],
  soilData: LegacySoilCalcItem[],
  alphaHTheta: number[],
  betaNormal: number[][],
  betaPeriod: number[][],
  groundLevel: number,
  groupEffectValue: number,
  liquefactionState: boolean
) => {
  return piles.map((pile, i) => {
    // 상시/지진시 테이블
    let levelN = Number(groundLevel);
    const normalTable: any[][] = [];
    for (let j = 0; j < soilData.length; j++) {
      const s = soilData[j];
      const alpha = Number(alphaHTheta[j] ?? 1);
      const KH0 = (s.aE0 / 0.3) * alpha;
      const KH = KH0 * Math.pow(Number(betaNormal[2][i]) / 0.3, -3 / 4);
      const KH0_Seis = (s.aE0_Seis / 0.3) * alpha;
      const KH_Seis = KH0_Seis * Math.pow(Number(betaNormal[2][i]) / 0.3, -3 / 4);

      const row: any[] = [
        s.LayerNo,
        round(levelN, 3),
        round(s.Depth, 3),
        round(s.DE, 2),
        round(alpha, 2),
        round(s.aE0 * alpha, 0),
        round(s.aE0_Seis * alpha, 0),
        round(KH0, 0),
        round(KH0_Seis, 0),
        round(KH, 0),
        round(KH_Seis, 0),
      ];
      if (liquefactionState) {
        row.push(round(KH_Seis * s.DE, 0));
      } else {
        row.push("-");
      }
      levelN -= Number(s.Depth);
      normalTable.push(row);
    }

    // 고유주기 테이블
    let levelP = Number(groundLevel);
    const periodTable: any[][] = [];
    for (let j = 0; j < soilData.length; j++) {
      const s = soilData[j];
      const alpha = Number(alphaHTheta[j] ?? 1);
      const KH0_Period = (s.ED / 0.3) * alpha;
      const KH_Period = KH0_Period * Math.pow(Number(betaPeriod[2][i]) / 0.3, -3 / 4);
      periodTable.push([
        s.LayerNo,
        round(levelP, 3),
        round(s.Depth, 3),
        round(s.DE, 2),
        round(alpha, 2),
        round(s.ED * alpha, 0),
        round(KH0_Period, 0),
        round(KH_Period, 0),
      ]);
      levelP -= Number(s.Depth);
    }

    return {
      __Soil_R_Coef_Index: `(${i + 1}) ${pile.pileName}`,
      __Normal_Beta: round(betaNormal[0][i], 3),
      __Normal_Beta_inv: round(1 / Number(betaNormal[0][i]), 3),
      __Normal_aE0: round(betaNormal[1][i], 0),
      __Normal_BH: round(betaNormal[2][i], 3),
      __Normal_KH0: round(betaNormal[3][i], 0),
      __Normal_KH: round(betaNormal[4][i], 0),
      __Normal_mu: round(groupEffectValue, 2),
      __Normal_Table: normalTable,
      __Period_Beta: round(betaPeriod[0][i], 3),
      __Period_Beta_inv: round(1 / Number(betaPeriod[0][i]), 3),
      __Period_aE0: round(betaPeriod[1][i], 0),
      __Period_BH: round(betaPeriod[2][i], 3),
      __Period_KH0: round(betaPeriod[3][i], 0),
      __Period_KH: round(betaPeriod[4][i], 0),
      __Period_mu: round(groupEffectValue, 2),
      __Period_Table: periodTable,
    };
  });
};

const buildPileSpringKvRows = (
  piles: LegacyPileCalcItem[],
  kv: number[][]
) => {
  return piles.map((pile, i) => ({
    __PileSpring_Kv_Index: `(${i + 1}) ${pile.pileName}`,
    __PileSpring_Kv_Alpha1: Number(kv[1][i]),
    __PileSpring_Kv_Alpha2: Number(kv[2][i]),
    __PileSpring_Kv: round(kv[0][i], 0),
  }));
};

const buildPileSpringKTable = (
  piles: LegacyPileCalcItem[],
  kValueNormal: number[][],
  kValueSeismic: number[][],
  kValueSeismicLiq: number[][],
  kValuePeriod: number[][],
  liquefactionState: boolean
) => {
  return piles.map((pile, i) => {
    const rowForKIndex = (kIdx: number) => {
      const row: any[] = [
        round(kValueNormal[i][kIdx], 0),
        round(kValueSeismic[i][kIdx], 0),
      ];
      row.push(
        liquefactionState ? round(kValueSeismicLiq[i][kIdx], 0) : "-"
      );
      row.push(round(kValuePeriod[i][kIdx], 0));
      return row;
    };

    return {
      __PileSpring_K_Index: `(${i + 1}) ${pile.pileName}`,
      __PileSpring_K_Table: [
        rowForKIndex(0),
        rowForKIndex(1),
        rowForKIndex(2),
        rowForKIndex(3),
      ],
    };
  });
};

const buildMatrixMain = (
  calcResult: PileSpringCalcResult,
  liquefactionState: boolean
) => {
  const {
    matrixNormalX,
    matrixNormalZ,
    matrixSeismicX,
    matrixSeismicZ,
    matrixSeismicLiqX,
    matrixSeismicLiqZ,
    matrixPeriodX,
    matrixPeriodZ,
  } = calcResult;

  // v1 인덱스 규약: [Axx, Axy, Axa, Ayy, Aya, Aaa]
  // v1 매핑: Ayx=Axy, Aax=Axa, Aay=Aya
  const mapMatrix = (m: number[]) => ({
    Axx: round(m[0], 0),
    Axy: round(m[1], 0),
    Axa: round(m[2], 0),
    Ayx: round(m[1], 0),
    Ayy: round(m[3], 0),
    Aya: round(m[4], 0),
    Aax: round(m[2], 0),
    Aay: round(m[4], 0),
    Aaa: round(m[5], 0),
  });

  const normX = mapMatrix(matrixNormalX);
  const normZ = mapMatrix(matrixNormalZ);
  const seisX = mapMatrix(matrixSeismicX);
  const seisZ = mapMatrix(matrixSeismicZ);
  const perX = mapMatrix(matrixPeriodX);
  const perZ = mapMatrix(matrixPeriodZ);

  const result: Record<string, string | number> = {
    __X_Normal_Axx: normX.Axx,
    __X_Normal_Axy: normX.Axy,
    __X_Normal_Axa: normX.Axa,
    __X_Normal_Ayx: normX.Ayx,
    __X_Normal_Ayy: normX.Ayy,
    __X_Normal_Aya: normX.Aya,
    __X_Normal_Aax: normX.Aax,
    __X_Normal_Aay: normX.Aay,
    __X_Normal_Aaa: normX.Aaa,
    __X_Seis_Axx: seisX.Axx,
    __X_Seis_Axy: seisX.Axy,
    __X_Seis_Axa: seisX.Axa,
    __X_Seis_Ayx: seisX.Ayx,
    __X_Seis_Ayy: seisX.Ayy,
    __X_Seis_Aya: seisX.Aya,
    __X_Seis_Aax: seisX.Aax,
    __X_Seis_Aay: seisX.Aay,
    __X_Seis_Aaa: seisX.Aaa,
    __X_Period_Axx: perX.Axx,
    __X_Period_Axy: perX.Axy,
    __X_Period_Axa: perX.Axa,
    __X_Period_Ayx: perX.Ayx,
    __X_Period_Ayy: perX.Ayy,
    __X_Period_Aya: perX.Aya,
    __X_Period_Aax: perX.Aax,
    __X_Period_Aay: perX.Aay,
    __X_Period_Aaa: perX.Aaa,
    __Z_Normal_Axx: normZ.Axx,
    __Z_Normal_Axy: normZ.Axy,
    __Z_Normal_Axa: normZ.Axa,
    __Z_Normal_Ayx: normZ.Ayx,
    __Z_Normal_Ayy: normZ.Ayy,
    __Z_Normal_Aya: normZ.Aya,
    __Z_Normal_Aax: normZ.Aax,
    __Z_Normal_Aay: normZ.Aay,
    __Z_Normal_Aaa: normZ.Aaa,
    __Z_Seis_Axx: seisZ.Axx,
    __Z_Seis_Axy: seisZ.Axy,
    __Z_Seis_Axa: seisZ.Axa,
    __Z_Seis_Ayx: seisZ.Ayx,
    __Z_Seis_Ayy: seisZ.Ayy,
    __Z_Seis_Aya: seisZ.Aya,
    __Z_Seis_Aax: seisZ.Aax,
    __Z_Seis_Aay: seisZ.Aay,
    __Z_Seis_Aaa: seisZ.Aaa,
    __Z_Period_Axx: perZ.Axx,
    __Z_Period_Axy: perZ.Axy,
    __Z_Period_Axa: perZ.Axa,
    __Z_Period_Ayx: perZ.Ayx,
    __Z_Period_Ayy: perZ.Ayy,
    __Z_Period_Aya: perZ.Aya,
    __Z_Period_Aax: perZ.Aax,
    __Z_Period_Aay: perZ.Aay,
    __Z_Period_Aaa: perZ.Aaa,
  };

  const addLiq = (prefix: "X" | "Z", liqMatrix: number[]) => {
    if (liquefactionState) {
      const m = mapMatrix(liqMatrix);
      result[`__${prefix}_Seis_Liq_Axx`] = m.Axx;
      result[`__${prefix}_Seis_Liq_Axy`] = m.Axy;
      result[`__${prefix}_Seis_Liq_Axa`] = m.Axa;
      result[`__${prefix}_Seis_Liq_Ayx`] = m.Ayx;
      result[`__${prefix}_Seis_Liq_Ayy`] = m.Ayy;
      result[`__${prefix}_Seis_Liq_Aya`] = m.Aya;
      result[`__${prefix}_Seis_Liq_Aax`] = m.Aax;
      result[`__${prefix}_Seis_Liq_Aay`] = m.Aay;
      result[`__${prefix}_Seis_Liq_Aaa`] = m.Aaa;
    } else {
      [
        "Axx",
        "Axy",
        "Axa",
        "Ayx",
        "Ayy",
        "Aya",
        "Aax",
        "Aay",
        "Aaa",
      ].forEach((key) => {
        result[`__${prefix}_Seis_Liq_${key}`] = "-";
      });
    }
  };
  addLiq("X", matrixSeismicLiqX);
  addLiq("Z", matrixSeismicLiqZ);

  return result;
};

// 엑셀 계산서 JSON 생성
export const buildExcelReportJson = (input: ExcelJsonInput) => {
  const {
    translate,
    projectName,
    pileDataList,
    pileBasicDim,
    soilBasic,
    soilLayers,
    calcResult,
    planViewImage,
    frontViewImage,
    sideViewImage,
  } = input;

  const piles = convertPileDataForCalc(pileDataList);
  const soilData = convertSoilDataForCalc(soilLayers);
  const groundLevel = Number(soilBasic.groundLevel);
  const groupEffectValue = Number(soilBasic.groupEffectValue);
  const liquefactionState = !!soilBasic.liquefactionState;
  const baseTopLevel = resolveBaseTopLevel(pileDataList);

  const generalBlock = buildGeneralRows(piles, translate);

  const reportjson_items: Record<string, any> = {};
  reportjson_items["_Project"] = { __ProjectName: projectName };
  reportjson_items["_General"] = generalBlock.items;

  reportjson_items["_PileBatch"] = {
    __PileNums: generalBlock.totalPileNums,
    __PileImage_PlanView: planViewImage,
    __PileImage_FrontView: frontViewImage,
    __PileImage_SideView: sideViewImage,
    __ForcePointX: Number(pileBasicDim.forcePointX),
    __ForcePointY: Number(pileBasicDim.forcePointY),
  };

  reportjson_items["_PilePropertyName"] = {};
  reportjson_items["_PileProperty_Main"] = buildPilePropertyRows(piles, translate);

  reportjson_items["_Soil_Condition"] = {
    __GroundLevel: round(groundLevel, 3),
    __WaterLevel: round(soilBasic.waterLevel, 3),
    __SoilTableData: buildSoilConditionTable(soilData, groundLevel, translate),
  };

  reportjson_items["_Soil_R_Coef_Title"] = {};
  reportjson_items["_Soil_R_Coef_Main"] = buildSoilRCoefRows(
    piles,
    soilData,
    calcResult.alphaHTheta,
    calcResult.betaNormal,
    calcResult.betaPeriod,
    groundLevel,
    groupEffectValue,
    liquefactionState
  );

  reportjson_items["_PileSpring_Kv_Title"] = {};
  reportjson_items["_PileSpring_Kv_Main"] = buildPileSpringKvRows(
    piles,
    calcResult.kv
  );

  reportjson_items["_PileSpring_K_Title"] = {};
  reportjson_items["_PileSpring_K_Table_Area"] = buildPileSpringKTable(
    piles,
    calcResult.kValueNormal,
    calcResult.kValueSeismic,
    calcResult.kValueSeismicLiq,
    calcResult.kValuePeriod,
    liquefactionState
  );

  reportjson_items["_PileMatrix_Title"] = {};
  reportjson_items["_PileSpring_Matrix_Main"] = buildMatrixMain(
    calcResult,
    liquefactionState
  );

  reportjson_items["_Rest"] = {};

  // baseTopLevel은 레거시 키는 없지만 로그용/디버깅용으로 남겨둠
  void baseTopLevel;

  return { report: reportjson_items };
};
