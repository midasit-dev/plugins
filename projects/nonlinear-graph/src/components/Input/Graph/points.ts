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
      const [xPoint, nextY] = stiffAxes(DATA.P_DATA, DATA.A_DATA, DATA.PND);
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

/** stiff 테이블은 강성(A_DATA)과 하중(P_DATA)에서 x축 변위를 역산한다. */
function stiffAxes(P_DATA: any, A_DATA: any, pnd: number): [number[][], number[]] {
  const xValue: number[][] = [];
  let init_x = 0;
  switch (pnd) {
    case 1:
      init_x = 0.2;
      break;
    case 2:
    case 3:
      init_x = 0.1;
      break;
  }
  xValue.push([init_x, init_x]);

  let nextY: number[] = [0, 0];
  for (let i = 0; i < pnd; i++) {
    if (i >= pnd - 1) {
      nextY[0] = xValue[xValue.length - 1][0] * A_DATA[i][0] + P_DATA[i][0];
      nextY[1] = xValue[xValue.length - 1][1] * A_DATA[i][1] + P_DATA[i][1];

      xValue.push([
        xValue[xValue.length - 1][0] * 2,
        xValue[xValue.length - 1][0] * 2,
      ]);

      break;
    }
    const plusX: number =
      (P_DATA[i + 1][0] - P_DATA[i][0]) / A_DATA[i][0] + xValue[i][0];

    const minusX: number =
      (P_DATA[i + 1][1] - P_DATA[i][1]) / A_DATA[i][1] + xValue[i][1];
    xValue.push([plusX, minusX]);
  }

  return [xValue, nextY];
}

/** multilinear 테이블은 (P, D) 쌍을 그대로 (y, x)로 옮긴다. */
function buildMultiPoints(DATA: any): XYPoint[] {
  const PnD = DATA.PnD_Data;
  if (PnD.length === 0) return [];

  return PnD.map((value: number[]) => ({ x: value[1], y: value[0] }));
}
