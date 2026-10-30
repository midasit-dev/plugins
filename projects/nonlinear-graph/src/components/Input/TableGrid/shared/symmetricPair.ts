import { isEmpty } from "lodash";
import { parseGridNumber } from "./format";

export type SidePair =
  | { kind: "value"; value: [number, number] } // [정(+), 부(-)] — 부(-)는 양수로 뒤집은 값
  | { kind: "missing"; field: string } // 이 칸이 비어 있어 쌍을 만들 수 없다
  | { kind: "empty" }; // 둘 다 비었다 (이 차수는 없음)

/**
 * 표의 (+)/(-) 칸 한 쌍을 [정, 부] 숫자 쌍으로 읽는다.
 *
 * 대칭이면 한쪽 칸 값을 양쪽에 쓴다. 원본은 보통 (+)쪽이지만, 압축 전용 슬립
 * (SLBC/SLTC)은 (+)쪽 칸이 비활성이라 (-)쪽을 원본으로 쓴다 (`sourceMinus`).
 */
export function readSidePair(
  row: any,
  plusField: string,
  minusField: string,
  symmetric: boolean,
  sourceMinus: boolean,
  plain: boolean = false
): SidePair {
  const hasPlus = !isEmpty(row[plusField]);
  const hasMinus = !isEmpty(row[minusField]);
  const plus = () => parseGridNumber(row, plusField, plain);
  const minus = () => parseGridNumber(row, minusField, plain) * -1;

  if (!hasPlus && !hasMinus) return { kind: "empty" };

  if (symmetric) {
    const hasSource = sourceMinus ? hasMinus : hasPlus;
    if (!hasSource)
      return { kind: "missing", field: sourceMinus ? minusField : plusField };
    const v = sourceMinus ? minus() : plus();
    return { kind: "value", value: [v, v] };
  }

  if (!hasPlus) return { kind: "missing", field: plusField };
  if (!hasMinus) return { kind: "missing", field: minusField };
  return { kind: "value", value: [plus(), minus()] };
}
