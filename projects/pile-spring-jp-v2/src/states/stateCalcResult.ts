/**
 * @fileoverview 계산 결과(Beta / AlphaHTheta / Kvalue / Kv / Matrix)를 보관하는
 * Recoil 상태들을 정의합니다.
 */

import { atom } from "recoil";

// 단일 Condition에 대한 Beta 결과: [Beta[], Avg_alpha_E0[], Bh[], Kh0[], Kh[]]
export type BetaResult = number[][];

// K1~K4 배열: 각 말뚝마다 [K1, K2, K3, K4]
export type KValueResult = number[][];

// Kv 결과: [Kv[], Alpha1[], Alpha2[]]
export type KvResult = number[][];

// 단일 Matrix 결과 (X 또는 Z): [Axx, Axy, Axa, Ayy, Aya, Aaa]
export type MatrixResult = number[];

export interface PileSpringCalcResult {
  // Beta
  betaNormal: BetaResult;
  betaSeismic: BetaResult;
  betaPeriod: BetaResult;

  // 지층별 사면영향 보정계수
  alphaHTheta: number[];

  // K-value (K1~K4)
  kValueNormal: KValueResult;
  kValueSeismic: KValueResult;
  kValueSeismicLiq: KValueResult;
  kValuePeriod: KValueResult;

  // Kv
  kv: KvResult;

  // A-matrix
  matrixNormalX: MatrixResult;
  matrixNormalZ: MatrixResult;
  matrixSeismicX: MatrixResult;
  matrixSeismicZ: MatrixResult;
  matrixSeismicLiqX: MatrixResult;
  matrixSeismicLiqZ: MatrixResult;
  matrixPeriodX: MatrixResult;
  matrixPeriodZ: MatrixResult;

  // 실행 완료 플래그
  isCalculated: boolean;
  // 마지막 계산 시각(ISO) — 상태 변경 추적 용도
  lastCalculatedAt: string | null;
}

export const defaultPileSpringCalcResult: PileSpringCalcResult = {
  betaNormal: [],
  betaSeismic: [],
  betaPeriod: [],
  alphaHTheta: [],
  kValueNormal: [],
  kValueSeismic: [],
  kValueSeismicLiq: [],
  kValuePeriod: [],
  kv: [],
  matrixNormalX: [],
  matrixNormalZ: [],
  matrixSeismicX: [],
  matrixSeismicZ: [],
  matrixSeismicLiqX: [],
  matrixSeismicLiqZ: [],
  matrixPeriodX: [],
  matrixPeriodZ: [],
  isCalculated: false,
  lastCalculatedAt: null,
};

export const pileSpringCalcResultState = atom<PileSpringCalcResult>({
  key: "pileSpringCalcResultState",
  default: defaultPileSpringCalcResult,
});
