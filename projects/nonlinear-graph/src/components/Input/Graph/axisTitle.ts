import { lengthUnit } from "../../../values/units";

/**
 * 탭2(P-alpha) x축이 무엇을 나타내는가.
 *
 * 탭2 의 x 는 표에 없는 값이라 K0(초기강성)로 역산한다. K0 를 구했는지, 그리고
 * 성분이 힘이냐 모멘트냐에 따라 축의 의미가 달라진다.
 *
 *   NORMALIZED    K0 를 못 구했다. x = 변위 x K0 (배율 미정)
 *   DISPLACEMENT  힘 성분(Fx/Fy/Fz). K0 [힘/길이] -> x 는 변위 [길이]
 *   CURVATURE     모멘트 성분(Mx/My/Mz). 분포 힌지는 M-phi 관계라 x 가 곡률 [1/길이]
 *
 * K0 를 못 구하는 경우는 `INITSTIFFTYPE` 이 요소에 묶인 타입일 때다
 * (0/1/2 = 6EI/L 계열, 4 = E*I). CIVIL 이 그 값을 보관하지 않는다.
 */
export type AxisKind = "NORMALIZED" | "DISPLACEMENT" | "CURVATURE";

/** 성분 0~2 는 힘, 3~5 는 모멘트. */
const MOMENT_FROM = 3;

const hasK0 = (row: any) => {
  const k0 = row?.DATA?.K0;
  return (
    Array.isArray(k0) &&
    k0.length >= 2 &&
    k0.every((v: any) => typeof v === "number" && Number.isFinite(v) && v > 0)
  );
};

/**
 * 그릴 곡선 전체를 보고 축의 종류를 정한다.
 *
 * **하나라도 K0 가 없으면 전부 정규화한다.** 실단위 곡선과 정규화 곡선이 한 축에
 * 섞이면 눈금이 아무 의미도 갖지 못한다.
 */
export function stiffAxisKind(rows: any[], component: number): AxisKind {
  if (!Array.isArray(rows) || rows.length === 0) return "NORMALIZED";
  if (!rows.every(hasK0)) return "NORMALIZED";
  return component >= MOMENT_FROM ? "CURVATURE" : "DISPLACEMENT";
}

/** 번역 키. 실제 문구는 locales 에 있다. */
export const AXIS_TITLE_KEY: { [kind in AxisKind]: string } = {
  NORMALIZED: "Graph_xaxis_normalized",
  DISPLACEMENT: "Graph_xaxis_disp",
  CURVATURE: "Graph_xaxis_curvature",
};

/**
 * 축 제목.
 *
 * @param translate i18next 의 t
 * @param distCode  db/UNIT 의 DIST 코드 ("M" 등). 없으면 단위 없이 표기한다.
 */
export function stiffAxisTitle(
  kind: AxisKind,
  // i18next 의 t 는 옵션에 따라 객체를 돌려줄 수도 있는 타입이라 any 로 받는다.
  translate: (key: string, opts?: any) => any,
  distCode?: string
): string {
  return String(translate(AXIS_TITLE_KEY[kind], { unit: lengthUnit(distCode) }));
}
