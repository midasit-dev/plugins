import { isEmpty } from "lodash";
import {
  eSubType,
  getBinlinearCase,
  getSlipCase,
  getTetralinearCase,
  getTrilinearCase,
} from "../../../values/EnumValue";

export interface XYPoint {
  x: number;
  y: number;
}

export interface CurveResult {
  /** 유효성 검사를 통과했는지. false면 호출부가 이전 곡선으로 되돌린다. */
  valid: boolean;
  points: XYPoint[];
}

/** 슬립 계열 이력 모델 (곡선의 한쪽을 0으로 눕힌다) */
const SLIP_BILINEAR = ["SLBI", "SLBT", "SLBC"];
const SLIP_TRILINEAR = ["SLTR", "SLTT", "SLTC"];

/**
 * 테이블 한 행을 그래프 곡선으로 바꾼다.
 *
 * @returns 곡선과 유효성. 지원하지 않는 점 개수(nPnd)면 null — 호출부는 그 행을 건너뛴다.
 */
export function buildCurve(
  tableType: number,
  value: any
): CurveResult | null {
  if (tableType === 3) {
    const points = buildMultiPoints(value.DATA);
    return { valid: !isEmpty(points), points };
  }

  const DATA = value.DATA;
  const historyModel: string = value.HISTORY_MODEL;
  // stiff 테이블은 마지막 구간이 하나 더 그려진다
  const nPnd = tableType === 1 ? DATA.PND : DATA.PND + 1;

  let validated: any;
  switch (nPnd) {
    case 2: // Binlinear
      validated = SLIP_BILINEAR.includes(historyModel)
        ? getSlipCase(DATA, tableType, historyModel, eSubType["Bilinear"])
        : getBinlinearCase(DATA, tableType, historyModel, eSubType["Bilinear"]);
      break;
    case 3: // Trilinear
      validated = SLIP_TRILINEAR.includes(historyModel)
        ? getSlipCase(DATA, tableType, historyModel, eSubType["Trilinear"])
        : getTrilinearCase(DATA, tableType, historyModel, eSubType["Trilinear"]);
      break;
    case 4: // Tetralinear
      validated = getTetralinearCase(
        DATA,
        tableType,
        historyModel,
        eSubType["Tetralinear"]
      );
      break;
    default:
      return null;
  }

  return {
    valid: !isEmpty(validated),
    points: buildHystereticPoints(tableType, DATA, historyModel),
  };
}

/** disp(1) / stiff(2) 테이블의 곡선. 그 외 테이블은 빈 배열. */
function buildHystereticPoints(
  tableType: number,
  DATA: any,
  historyModel: string
): XYPoint[] {
  switch (tableType) {
    case 1: // disp
      return assemble(DATA.D_DATA, DATA.P_DATA, DATA, historyModel);
    case 2: {
      // stiff
      // DATA.K0 는 조회가 채운다 (py_iehp.toTableRow -> py_stiffness.resolve,
      // 타입 4 는 fillElasticK0 가 요소의 E*I 로 뒤늦게 채운다). 못 구한 행은
      // undefined 로 와서 stiffAxes 가 1 로 정규화한다.
      const [xPoint, nextY] = stiffAxes(
        DATA.P_DATA,
        DATA.A_DATA,
        DATA.PND,
        DATA.K0
      );
      const yPoint: any[] = [];
      for (let i = 0; i < DATA.PND; i++) {
        yPoint.push(DATA.P_DATA[i]);
      }
      yPoint.push(nextY);
      return assemble(xPoint, yPoint, DATA, historyModel);
    }
    default:
      return [];
  }
}

/**
 * (+)쪽을 역순으로, 원점을 거쳐, (-)쪽을 정순으로 이어 하나의 곡선을 만든다.
 * INIT_GAP이 있으면 그만큼 x를 밀고 갭 지점에 y=0 점을 추가한다.
 *
 * 슬립 계열은 인장 전용(SLBT/SLTT)이면 (-)쪽 y를, 압축 전용(SLBC/SLTC)이면
 * (+)쪽 y를 0으로 눕힌다.
 */
function assemble(
  xPoint: any[],
  yPoint: any[],
  DATA: any,
  historyModel: string
): XYPoint[] {
  const xyPoint: XYPoint[] = [];

  let plusGap = 0.0;
  let mlusGap = 0.0;
  if (!isEmpty(DATA.INIT_GAP[0]) && !isEmpty(DATA.INIT_GAP[1])) {
    plusGap = DATA.INIT_GAP[0];
    mlusGap = DATA.INIT_GAP[1] * -1;
  }

  // 압축 전용(SLBC/SLTC)은 (+)쪽을, 인장 전용(SLBT/SLTT)은 (-)쪽을 0으로 눕힌다.
  const bPlus = !(historyModel === "SLBC" || historyModel === "SLTC");
  const bMinus = !(historyModel === "SLBT" || historyModel === "SLTT");

  // + values
  for (let i = xPoint.length - 1; i >= 0; i--) {
    xyPoint.push({
      x: plusGap + xPoint[i][0],
      y: bPlus ? yPoint[i][0] : 0,
    });
  }

  // plus gap
  if (plusGap !== 0) xyPoint.push({ x: plusGap, y: 0 });

  // zero value
  xyPoint.push({ x: 0, y: 0 });

  // minus gap
  if (mlusGap !== 0) xyPoint.push({ x: mlusGap, y: 0 });

  // - values
  for (let i = 0; i < xPoint.length; i++) {
    xyPoint.push({
      x: mlusGap + xPoint[i][1] * -1,
      y: bMinus ? yPoint[i][1] * -1 : 0,
    });
  }

  return xyPoint;
}

/**
 * stiff 테이블은 강성비(A_DATA)와 하중(P_DATA)에서 x축 변위를 역산한다.
 *
 * MIDAS 본체와 같은 식이다 (`ElemStiffScaleFactorDlg.cpp` L_Set_INIT_EI_PAlpha):
 *
 *     K2   = K1 * StiffRatio1st
 *     phi1 = CrackMoment / K1
 *     phi2 = phi1 + (YieldMoment - CrackMoment) / K2
 *
 * K0 는 모든 x 에 똑같이 걸리는 **공통 배율**이다. 그래서 값을 몰라도 1 로 두면
 * 곡선의 모양은 본체와 정확히 같고 축의 배율만 미정으로 남는다.
 *
 * K0 를 무엇으로 잡는지는 `INITSTIFFTYPE` 이 정한다 (py_stiffness). 요소에 묶인
 * 타입(0/1/2 = 6EI/L 계열, 4 = E*I)은 CIVIL 이 값을 갖고 있지 않아 못 구하고,
 * 그때는 `k0` 가 undefined 로 와서 정규화 축이 된다.
 *
 * **K0 는 부호별로 다르다.** P-Delta 입력에서 역산된 값(INITSTIFFP/N)이나 비대칭
 * 골격곡선에서는 (+)와 (-)의 초기강성이 갈린다.
 *
 * 예전에는 첫 점을 pnd 에 따라 0.1 / 0.2 로 **고정**했다. K0 처럼 곱해지는 값이
 * 아니라 더해지는 상수라, 하중이 크든 작든 탄성 구간이 항상 그 길이가 되어
 * 곡선 모양이 왜곡됐다.
 *
 * @param k0 초기강성 [K+, K-]. 없거나 한쪽이라도 0 이하면 [1, 1] 로 정규화한다.
 */
function stiffAxes(
  P_DATA: any,
  A_DATA: any,
  pnd: number,
  k0?: number[]
): [number[][], number[]] {
  // 한쪽만 유효한 상태로 그리면 (+)/(-) 축척이 달라져 곡선이 뒤틀린다.
  // 둘 다 성립할 때만 쓰고, 아니면 양쪽 모두 1 로 되돌린다.
  const usable =
    Array.isArray(k0) &&
    k0.length >= 2 &&
    k0.every((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
  const K: number[] = usable ? [k0![0], k0![1]] : [1, 1];

  // 첫 점은 탄성 구간의 끝이므로 x = P1 / K0.
  const xValue: number[][] = [[P_DATA[0][0] / K[0], P_DATA[0][1] / K[1]]];

  const nextY: number[] = [0, 0];
  for (let i = 0; i < pnd; i++) {
    const last = xValue[xValue.length - 1];

    if (i >= pnd - 1) {
      // 연장 구간의 하중 증가분 = 변위 증가분 x 그 구간의 강성(alpha * K0).
      // x 는 이미 K0 로 나눠 둔 실변위라 여기서 K0 를 되곱해야 힘 차원이 맞는다.
      nextY[0] = last[0] * A_DATA[i][0] * K[0] + P_DATA[i][0];
      nextY[1] = last[1] * A_DATA[i][1] * K[1] + P_DATA[i][1];

      // 마지막 점 뒤로 한 구간 더 늘여 곡선의 끝을 보인다.
      // (-)측도 제 값을 쓴다 - 예전에는 양쪽 모두 (+)측 x 를 써서
      // 비대칭 힌지의 (-)측 끝점이 엉뚱한 자리에 찍혔다.
      xValue.push([last[0] * 2, last[1] * 2]);
      break;
    }

    // 이 구간의 강성은 alpha * K0 이므로 변위 증가분은 dP / (alpha * K0).
    xValue.push([
      (P_DATA[i + 1][0] - P_DATA[i][0]) / (A_DATA[i][0] * K[0]) + xValue[i][0],
      (P_DATA[i + 1][1] - P_DATA[i][1]) / (A_DATA[i][1] * K[1]) + xValue[i][1],
    ]);
  }

  return [xValue, nextY];
}

/** multilinear 테이블은 (P, D) 쌍을 그대로 (y, x)로 옮긴다. */
function buildMultiPoints(DATA: any): XYPoint[] {
  const PnD = DATA.PnD_Data;
  if (PnD.length === 0) return [];

  return PnD.map((value: number[]) => ({ x: value[1], y: value[0] }));
}
