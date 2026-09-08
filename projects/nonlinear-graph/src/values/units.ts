/**
 * db/UNIT 의 단위 코드를 표기용 문자열로 바꾼다.
 *
 * UNIT 은 **이름만** 준다 (`{FORCE:"KN", DIST:"M"}`). 환산 계수가 없고, 필요하지도
 * 않다 — API 가 돌려주는 값이 이미 모델의 현재 단위계이기 때문이다. 표기에만 쓴다.
 */
const FORCE_LABEL: { [code: string]: string } = {
  N: "N",
  KN: "kN",
  KGF: "kgf",
  TONF: "tonf",
  LBF: "lbf",
  KIPS: "kips",
};

const LENGTH_LABEL: { [code: string]: string } = {
  M: "m",
  CM: "cm",
  MM: "mm",
  FT: "ft",
  IN: "in",
};

/** 코드를 모르면 코드 자체를 돌려준다 — 빈 축 라벨보다 낫다. */
export function forceUnit(code?: string): string {
  if (!code) return "";
  return FORCE_LABEL[code] ?? FORCE_LABEL[code.toUpperCase()] ?? code;
}

export function lengthUnit(code?: string): string {
  if (!code) return "";
  return LENGTH_LABEL[code] ?? LENGTH_LABEL[code.toUpperCase()] ?? code;
}
