/**
 * 그리드에 표시할 숫자 문자열을 만든다.
 *
 * @param plain true면 값을 그대로 문자열화하고, false면 지수 표기(소수점 4자리)로 변환한다.
 */
export function formatSmallNumber(value: number, plain: boolean = false) {
  return plain ? value.toString() : value.toExponential(4);
}

/**
 * 행에 보관해 둔 원본 숫자를 담는 필드 이름.
 * MUI DataGrid 는 컬럼 정의에 없는 필드를 표시하지 않으므로 행에 그대로 실어 둔다.
 */
export const RAW_FIELD = "__raw";

/**
 * 사용자 입력이 아닌 행 부가정보. dataValid 검증에서 제외해야 한다.
 *
 * `useGridEditing.onRowChange` 는 행의 **모든 필드**를 dataValid 에 통과시키는데,
 * 이런 필드는 `default:` 분기(Plus_/Minus_ 데이터 셀 취급)로 떨어져 편집이 오류
 * 표시도 없이 initRows() 로 롤백된다. 행에 필드를 더 붙이면 여기도 손봐야 한다.
 */
export const META_FIELDS = new Set<string>([RAW_FIELD, "INITSTIFF_EDITABLE"]);

/** 표시 문자열을 만들면서 원본 숫자를 행에 함께 보관한다. */
export function setDisplayAndRaw(
  row: any,
  field: string,
  value: number,
  plain: boolean = false
) {
  row[field] = formatSmallNumber(value, plain);
  if (!row[RAW_FIELD]) row[RAW_FIELD] = {};
  row[RAW_FIELD][field] = value;
}

/**
 * 그리드 셀에서 숫자를 되읽는다.
 *
 * 표시 문자열은 formatSmallNumber 로 자릿수가 줄어든 값이라, 그대로 parseFloat 하면
 * 편집하지 않은 셀까지 유효숫자 5자리로 잘린다. 보관해 둔 원본을 같은 방식으로
 * 포맷했을 때 표시 문자열과 일치하면 사용자가 손대지 않은 셀이므로 원본을 돌려준다.
 */
export function parseGridNumber(
  row: any,
  field: string,
  plain: boolean = false
): number {
  const display = row?.[field];
  const parsed = parseFloat(display);
  const raw = row?.[RAW_FIELD]?.[field];
  if (typeof raw !== "number" || Number.isNaN(parsed)) return parsed;
  return formatSmallNumber(raw, plain) === display ? raw : parsed;
}
