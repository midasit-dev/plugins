/**
 * @fileoverview 엑셀 계산서 1.2절(杭の配置)에 들어가는 평면도 / 정면도 / 측면도를
 * 2D canvas로 그려 base64 PNG로 반환합니다.
 *
 * BaseSheet*.xlsx 템플릿의 그림 영역은 v1 기준 250×250px 이미지에 맞춰져 있습니다.
 * 이미지가 이보다 크면 옆 그림과 아래 계산서 내용을 덮어 버리므로, 크기를 고정하고
 * (devicePixelRatio 영향 없음) v1과 같은 선화 스타일로 그립니다.
 * v2 확장: 말뚝 그룹별 저면 표고(topLevel)가 다르면 말뚝 상단 위치에 반영합니다.
 */

import { CalculateProperties } from "../../utils_pyscript";
import { LegacyPileCalcItem } from "../converters/pileCalcInputConverter";
import { PileBasicDim } from "../../types/typePileDomain";

type Translate = (key: string) => string;

export interface PileReportDrawingInput {
  translate: Translate;
  piles: LegacyPileCalcItem[];
  basicDim: PileBasicDim;
  groundLevel: number;
}

export interface PileReportImages {
  plan: string;
  front: string;
  side: string;
}

// 템플릿 그림 영역 크기 (v1과 동일)
const CANVAS_SIZE = 250;
const FONT = "10px Arial";
const AXIS_COLOR = "#BFBFBF";
const LINE_COLOR = "#000000";
const ARROW_HEAD = 6;

// m → mm 정수 표기 (5.5 → "5500", 부동소수 오차 제거)
const toMm = (meter: number): string => `${Math.round(meter * 1000)}`;

// "1.5, 1.5" 형태의 문자열을 숫자 배열로
const parseList = (value: string): number[] =>
  String(value ?? "")
    .split(",")
    .filter((v) => v.trim() !== "")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));

// py_main.py CalPileCenterCoordinates와 같은 규칙으로 말뚝 중심 좌표 계산
// X: majorRefValue 1이면 기초 우측 끝에서, 2이면 좌측 끝 기준 / Y: minorRefValue 1이면 상단에서
const pileCenters = (
  pile: LegacyPileCalcItem,
  sideLength: number,
  foundationWidth: number
): [number, number][] => {
  const fromRight = pile.majorRefValue === 1;
  let x = fromRight
    ? Number(pile.majorStartPoint)
    : sideLength - Number(pile.majorStartPoint);
  const xs = [x];
  parseList(pile.majorSpace).forEach((space) => {
    x = fromRight ? x + space : x - space;
    xs.push(x);
  });
  const y =
    pile.minorRefValue === 1
      ? Number(pile.minorStartPoint)
      : foundationWidth - Number(pile.minorStartPoint);
  return xs.map((cx) => [cx, y]);
};

// 보강 포함 외경(m). Python 계산 실패 시 0
const pileDiameter = (pile: LegacyPileCalcItem): number => {
  try {
    const property = CalculateProperties(pile, "top", "reinforced");
    const d = Number(property?.[3]);
    return Number.isFinite(d) ? d : 0;
  } catch {
    return 0;
  }
};

const createCanvas = (): CanvasRenderingContext2D => {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.font = FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  return ctx;
};

const toBase64 = (ctx: CanvasRenderingContext2D): string =>
  ctx.canvas.toDataURL("image/png").split(",")[1] ?? "";

// 상단: 우→좌 화살표(載荷方向 등), 우측: 상→하 화살표 + 세로 라벨
const drawAxisArrows = (
  ctx: CanvasRenderingContext2D,
  topLabel: string,
  rightLabel: string
) => {
  const s = CANVAS_SIZE;
  ctx.save();
  ctx.strokeStyle = AXIS_COLOR;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 2]);
  ctx.beginPath();
  ctx.moveTo(s * 0.6, s * 0.04);
  ctx.lineTo(s * 0.4, s * 0.04);
  ctx.moveTo(s * 0.96, s * 0.4);
  ctx.lineTo(s * 0.96, s * 0.6);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(s * 0.4, s * 0.04);
  ctx.lineTo(s * 0.4 + ARROW_HEAD * Math.cos(-Math.PI / 6), s * 0.04 + ARROW_HEAD * Math.sin(-Math.PI / 6));
  ctx.moveTo(s * 0.4, s * 0.04);
  ctx.lineTo(s * 0.4 + ARROW_HEAD * Math.cos(Math.PI / 6), s * 0.04 + ARROW_HEAD * Math.sin(Math.PI / 6));
  ctx.moveTo(s * 0.96, s * 0.6);
  ctx.lineTo(s * 0.96 + ARROW_HEAD * Math.cos(Math.PI / 3), s * 0.6 - ARROW_HEAD * Math.sin(Math.PI / 3));
  ctx.moveTo(s * 0.96, s * 0.6);
  ctx.lineTo(s * 0.96 - ARROW_HEAD * Math.cos(Math.PI / 3), s * 0.6 - ARROW_HEAD * Math.sin(Math.PI / 3));
  ctx.stroke();

  ctx.fillStyle = LINE_COLOR;
  ctx.fillText(topLabel, s * 0.5, s * 0.03 - 1);
  ctx.translate(s * 0.985, s * 0.5);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(rightLabel, 0, 0);
  ctx.restore();
};

// 수평 치수선 (x1~x2, 높이 y) + 위쪽 문자
const drawHorizontalDim = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  text: string
) => {
  const tick = 2;
  ctx.save();
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.moveTo(x1, y - tick);
  ctx.lineTo(x1, y + tick);
  ctx.moveTo(x2, y - tick);
  ctx.lineTo(x2, y + tick);
  ctx.stroke();
  ctx.fillStyle = LINE_COLOR;
  ctx.fillText(text, (x1 + x2) / 2, y - 6);
  ctx.restore();
};

// 수직 치수선 (y1~y2, 위치 x) + 왼쪽에 세로 문자
const drawVerticalDim = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
  text: string,
  textOnRight = false
) => {
  const tick = 2;
  ctx.save();
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.moveTo(x - tick, y1);
  ctx.lineTo(x + tick, y1);
  ctx.moveTo(x - tick, y2);
  ctx.lineTo(x + tick, y2);
  ctx.stroke();
  ctx.fillStyle = LINE_COLOR;
  ctx.translate(textOnRight ? x + 6 : x - 6, (y1 + y2) / 2);
  ctx.rotate(textOnRight ? Math.PI / 2 : -Math.PI / 2);
  ctx.fillText(text, 0, 0);
  ctx.restore();
};

// 표고 점선 + 라벨 (라벨은 왼쪽 정렬, 뒤 배경을 흰색으로 깔아 선과 겹쳐도 읽히게 함)
const drawLevelLine = (
  ctx: CanvasRenderingContext2D,
  y: number,
  label: string
) => {
  const s = CANVAS_SIZE;
  ctx.save();
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(s * 0.02, y);
  ctx.lineTo(s * 0.8, y);
  ctx.stroke();

  ctx.font = FONT;
  ctx.textAlign = "left";
  const textY = y - 7;
  const width = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(s * 0.02 - 1, textY - 6, width + 2, 12);
  ctx.fillStyle = LINE_COLOR;
  ctx.fillText(label, s * 0.02, textY);
  ctx.restore();
};

// 평면도
const drawPlanView = (input: PileReportDrawingInput): string => {
  const { translate, piles, basicDim } = input;
  const s = CANVAS_SIZE;
  const ctx = createCanvas();

  const sideLength = Number(basicDim.sideLength) || 0;
  const foundationWidth = Number(basicDim.foundationWidth) || 0;
  const maxSize = Math.max(sideLength, foundationWidth, 1e-6);
  // 치수 문자/방향 라벨과 겹치지 않도록 v1(0.8)보다 약간 작게
  const ratio = (s * 0.72) / maxSize;

  drawAxisArrows(ctx, translate("Pile_X_Dir"), translate("Pile_Y_Dir"));

  const w = sideLength * ratio;
  const h = foundationWidth * ratio;
  const x0 = (s - w) / 2;
  const y0 = (s - h) / 2;
  const right = x0 + w;

  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(x0, y0, w, h);

  drawHorizontalDim(ctx, x0, right, y0 - 5, toMm(sideLength));
  drawVerticalDim(ctx, right + 5, y0, y0 + h, toMm(foundationWidth), true);

  // 하중 재하점
  ctx.beginPath();
  ctx.arc(
    right - Number(basicDim.forcePointX) * ratio,
    y0 + Number(basicDim.forcePointY) * ratio,
    3,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = LINE_COLOR;
  ctx.fill();

  // 말뚝
  ctx.lineWidth = 1;
  piles.forEach((pile) => {
    const radius = Math.max((pileDiameter(pile) * ratio) / 2, 1);
    pileCenters(pile, sideLength, foundationWidth).forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(right - cx * ratio, y0 + cy * ratio, radius, 0, 2 * Math.PI);
      ctx.stroke();
    });
  });

  return toBase64(ctx);
};

// 정면도(front: X-Z) / 측면도(side: Y-Z)
const drawElevationView = (
  input: PileReportDrawingInput,
  view: "front" | "side"
): string => {
  const { translate, piles, basicDim, groundLevel } = input;
  const s = CANVAS_SIZE;
  const ctx = createCanvas();

  const sideLength = Number(basicDim.sideLength) || 0;
  const foundationWidth = Number(basicDim.foundationWidth) || 0;
  const horizontal = view === "front" ? sideLength : foundationWidth;

  // 기준 저면 표고: 말뚝별 저면 표고의 최고값 (계산/3D 뷰어와 동일)
  const topLevels = piles.map((p) => Number(p.topLevel)).filter(Number.isFinite);
  const baseTopLevel = topLevels.length > 0 ? Math.max(...topLevels) : 0;
  const groundDepth = baseTopLevel - Number(groundLevel);

  const pileOffset = (pile: LegacyPileCalcItem) =>
    Math.max(baseTopLevel - Number(pile.topLevel), 0);
  const maxDepth = Math.max(
    0,
    groundDepth,
    ...piles.map((p) => pileOffset(p) + Number(p.pileLength))
  );

  // 기초 두께는 표시용 (v1과 같이 기초 폭의 10%)
  const footingThickness = horizontal * 0.1;
  const ratio = Math.min(
    (s * 0.74) / Math.max(footingThickness + maxDepth, 1e-6),
    (s * 0.6) / Math.max(horizontal, 1e-6)
  );

  drawAxisArrows(
    ctx,
    translate(view === "front" ? "Pile_X_Dir" : "Pile_Y_Dir"),
    translate("Pile_Z_Dir")
  );

  const w = horizontal * ratio;
  const x0 = (s - w) / 2;
  const right = x0 + w;
  const yTop = s * 0.14;
  const yBase = yTop + footingThickness * ratio;

  // 기초
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(x0, yTop, w, yBase - yTop);
  drawHorizontalDim(ctx, x0, right, yTop - 5, toMm(horizontal));

  // 말뚝 (경사각만큼 하단을 수평 이동)
  const longest = { top: 0, bottom: 0, length: 0 };
  for (const pile of piles) {
    const diameter = Math.max(pileDiameter(pile) * ratio, 1);
    const length = Number(pile.pileLength) || 0;
    const top = yBase + pileOffset(pile) * ratio;
    const bottom = top + length * ratio;
    const angles = parseList(view === "front" ? pile.majorDegree : pile.minorDegree);

    pileCenters(pile, sideLength, foundationWidth).forEach((center, j) => {
      const c = view === "front" ? center[0] : center[1];
      const x = right - c * ratio;
      const shift = Math.tan((Math.PI / 180) * (angles[j] ?? 0)) * length * ratio;
      ctx.beginPath();
      ctx.moveTo(x - diameter / 2, top);
      ctx.lineTo(x + diameter / 2, top);
      ctx.lineTo(x + diameter / 2 + shift, bottom);
      ctx.lineTo(x - diameter / 2 + shift, bottom);
      ctx.closePath();
      ctx.stroke();
    });

    if (length > longest.length) {
      Object.assign(longest, { top, bottom, length });
    }
  }

  // 말뚝 길이 치수 (가장 긴 말뚝)
  if (longest.length > 0) {
    drawVerticalDim(ctx, s * 0.87, longest.top, longest.bottom, toMm(longest.length));
  }

  // 저면 표고 / 설계 지반면 표고
  drawLevelLine(ctx, yBase, `${translate("Top_Level")} : ${baseTopLevel}`);
  drawLevelLine(
    ctx,
    yBase + groundDepth * ratio,
    `${translate("Soil_Top_Level")} : ${Number(groundLevel)}`
  );

  return toBase64(ctx);
};

// 계산서용 평면도 / 정면도 / 측면도 3장 생성
export const drawPileReportImages = (
  input: PileReportDrawingInput
): PileReportImages => ({
  plan: drawPlanView(input),
  front: drawElevationView(input, "front"),
  side: drawElevationView(input, "side"),
});
