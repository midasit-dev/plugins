import { GridColDef } from "@mui/x-data-grid";

/**
 * 붙여넣기 한 줄을 기존 행에 얹는다.
 *
 * **기존 행을 바탕으로 삼는 것이 핵심이다.** 예전에는 `{ id }` 로 행을 새로 만들어
 * 붙여넣지 않은 것이 전부 사라졌다 - 커서 왼쪽 컬럼, 표시값 옆에 원본 숫자를
 * 담아 둔 `__raw`, 그리고 행 부가정보까지. 그러면 붙여넣은 값이 저장 경로에서
 * 조용히 버려지거나 정밀도가 깎인다.
 *
 * **칸을 건너뛰지 않는다.** 붙여넣기는 복사한 표의 열 순서가 그대로 들어가야
 * 사용자가 결과를 예측할 수 있다. 통과 여부는 `dataValid` 하나로만 가른다.
 */
export interface PasteRowResult {
  row: any;
  /** 유효성 검사에 걸린 컬럼. 있으면 붙여넣기 전체를 취소한다. */
  invalidField: string | null;
}

export function buildPastedRow(
  id: number,
  existing: any,
  startColumns: GridColDef<any>[],
  values: string[],
  dataValid: (row: any, col: string, value: any) => boolean
): PasteRowResult {
  const row: any = { ...(existing ?? {}), id };

  for (let i = 0; i < startColumns.length; i++) {
    const field = startColumns[i].field;
    const value = values[i];
    if (!dataValid(row, field, value)) return { row, invalidField: field };
    row[field] = value;
  }

  return { row, invalidField: null };
}
