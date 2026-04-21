/**
 * @fileoverview 말뚝 스프링 전체 계산 오케스트레이터.
 * 입력 데이터를 v1 호환 형식으로 변환한 뒤 py_main.py의 계산 함수들을
 * 순차적으로 호출하여 Beta / Alpha / K-value / Kv / A-matrix 결과를 반환합니다.
 */

import {
  CalculateBeta,
  CalAlphaHTheta,
  CalculateKv,
  CalculateKvalue,
  CalculateMatrix,
} from "../../utils_pyscript";
import {
  convertPileDataForCalc,
  convertSoilDataForCalc,
  resolveBaseTopLevel,
} from "../converters/pileCalcInputConverter";
import {
  defaultPileSpringCalcResult,
  PileSpringCalcResult,
} from "../../states/stateCalcResult";
import { PileDataItem, PileBasicDim } from "../../types/typePileDomain";
import { SoilBasic, SoilTable } from "../../types/typeSoilDomain";

export interface PileSpringCalcInput {
  pileDataList: PileDataItem[];
  pileBasicDim: PileBasicDim;
  soilBasic: SoilBasic;
  soilLayers: SoilTable[];
}

// 모든 계산 단계를 순서대로 실행
export const runPileSpringCalculation = (
  input: PileSpringCalcInput
): PileSpringCalcResult => {
  const { pileDataList, pileBasicDim, soilBasic, soilLayers } = input;

  const calcPileTableData = convertPileDataForCalc(pileDataList);
  const calcSoilData = convertSoilDataForCalc(soilLayers);
  const baseTopLevel = resolveBaseTopLevel(pileDataList);
  const groundLevel = Number(soilBasic.groundLevel);
  const groupEffectValue = Number(soilBasic.groupEffectValue);
  const slopeEffectState = !!soilBasic.slopeEffectState;

  // 1) Beta (상시 / 지진시 / 고유주기)
  const betaNormal = CalculateBeta(
    calcSoilData,
    calcPileTableData,
    "normal",
    slopeEffectState,
    groupEffectValue,
    baseTopLevel,
    groundLevel
  );
  const betaSeismic = CalculateBeta(
    calcSoilData,
    calcPileTableData,
    "seismic",
    slopeEffectState,
    groupEffectValue,
    baseTopLevel,
    groundLevel
  );
  const betaPeriod = CalculateBeta(
    calcSoilData,
    calcPileTableData,
    "period",
    slopeEffectState,
    groupEffectValue,
    baseTopLevel,
    groundLevel
  );

  // 2) 사면 보정 계수 Alpha_HTheta
  const alphaHTheta = CalAlphaHTheta(
    calcSoilData,
    slopeEffectState,
    calcPileTableData
  );

  // 3) K1 ~ K4 값 (headCondition / bottomCondition은 per-pile 값 사용 → Python에서 pileTableData[i] 참조)
  // 래퍼 시그니처 호환을 위해 첫 번째 말뚝의 값을 fallback으로 전달.
  const fallbackHead =
    pileDataList[0]?.initSetData.headCondition ?? "Head_Condition_Fixed";
  const fallbackBottom =
    pileDataList[0]?.initSetData.bottomCondition ?? "Bottom_Condition_Free";

  const kValueNormal = CalculateKvalue(
    calcPileTableData,
    groundLevel,
    baseTopLevel,
    calcSoilData,
    "normal",
    fallbackHead,
    fallbackBottom,
    alphaHTheta,
    betaNormal,
    betaSeismic,
    betaPeriod,
    "no"
  );
  const kValueSeismic = CalculateKvalue(
    calcPileTableData,
    groundLevel,
    baseTopLevel,
    calcSoilData,
    "seismic",
    fallbackHead,
    fallbackBottom,
    alphaHTheta,
    betaNormal,
    betaSeismic,
    betaPeriod,
    "no"
  );
  const kValueSeismicLiq = CalculateKvalue(
    calcPileTableData,
    groundLevel,
    baseTopLevel,
    calcSoilData,
    "seismic",
    fallbackHead,
    fallbackBottom,
    alphaHTheta,
    betaNormal,
    betaSeismic,
    betaPeriod,
    "yes"
  );
  const kValuePeriod = CalculateKvalue(
    calcPileTableData,
    groundLevel,
    baseTopLevel,
    calcSoilData,
    "period",
    fallbackHead,
    fallbackBottom,
    alphaHTheta,
    betaNormal,
    betaSeismic,
    betaPeriod,
    "no"
  );

  // 4) Kv
  const kv = CalculateKv(calcPileTableData, groundLevel, baseTopLevel);

  // 5) A-Matrix (X, Z 방향 × 4 case)
  const foundationWidth = Number(pileBasicDim.foundationWidth);
  const sideLength = Number(pileBasicDim.sideLength);
  const forcePointX = Number(pileBasicDim.forcePointX);
  const forcePointY = Number(pileBasicDim.forcePointY);

  const callMatrix = (
    type: "normal" | "seismic" | "period",
    dir: "X" | "Z",
    liq: "yes" | "no"
  ) =>
    CalculateMatrix(
      calcPileTableData,
      foundationWidth,
      sideLength,
      calcSoilData,
      type,
      dir,
      kv,
      kValueNormal,
      kValueSeismic,
      kValueSeismicLiq,
      kValuePeriod,
      forcePointX,
      forcePointY,
      liq
    );

  const matrixNormalX = callMatrix("normal", "X", "no");
  const matrixNormalZ = callMatrix("normal", "Z", "no");
  const matrixSeismicX = callMatrix("seismic", "X", "no");
  const matrixSeismicZ = callMatrix("seismic", "Z", "no");
  const matrixSeismicLiqX = callMatrix("seismic", "X", "yes");
  const matrixSeismicLiqZ = callMatrix("seismic", "Z", "yes");
  const matrixPeriodX = callMatrix("period", "X", "no");
  const matrixPeriodZ = callMatrix("period", "Z", "no");

  return {
    ...defaultPileSpringCalcResult,
    betaNormal,
    betaSeismic,
    betaPeriod,
    alphaHTheta,
    kValueNormal,
    kValueSeismic,
    kValueSeismicLiq,
    kValuePeriod,
    kv,
    matrixNormalX,
    matrixNormalZ,
    matrixSeismicX,
    matrixSeismicZ,
    matrixSeismicLiqX,
    matrixSeismicLiqZ,
    matrixPeriodX,
    matrixPeriodZ,
    isCalculated: true,
    lastCalculatedAt: new Date().toISOString(),
  };
};
