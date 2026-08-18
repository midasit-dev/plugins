/**
 * 그리드에 표시할 숫자 문자열을 만든다.
 *
 * @param plain true면 값을 그대로 문자열화하고, false면 지수 표기(소수점 4자리)로 변환한다.
 */
export function formatSmallNumber(value: number, plain: boolean = false) {
  return plain ? value.toString() : value.toExponential(4);
}
