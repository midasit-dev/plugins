/**
 * 차트 폰트. canvas 는 CSS 를 상속하지 않으므로 index.css 의 스택을 따로 지정한다.
 * Pretendard 에 한자 글리프가 없어 일본어 폰트를 뒤에 붙인다.
 */
export const chartFontFamily =
  'Pretendard, "Yu Gothic UI", "Yu Gothic", "Meiryo", ' +
  '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", ' +
  '"MS PGothic", "Malgun Gothic", system-ui, sans-serif';

/** 차트를 감싸는 박스 스타일 */
export const gridStyle: any = {
  width: "80%",
  height: "80%",
  margin: "0 auto",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

/** 곡선 색상. 개수를 넘어가면 순환하며 재사용한다. */
export const LineColor: string[] = [
  "#FF0000",
  "#FFA500", // Red -> Orange
  "#008000", // Yellow -> Green
  "#0000FF", // Green -> Blue
  "#4B0082", // Blue -> Indigo
  "#EE82EE", // Indigo -> Violet
];

/** 포인트 모양. 색상과 선모양을 모두 소진하면 다음 모양으로 넘어간다. */
export const pointerStyle: string[] = [
  "circle",
  "rect",
  "rectRot",
  "triangle",
  "cross",
  "crossRot",
  "star",
];

/** 선 모양(borderDash). 색상을 한 바퀴 돌면 다음 모양으로 넘어간다. */
export const lineStyle: number[][] = [
  [0, 0],
  [5, 5],
  [30, 10],
];
