import { GridColDef } from "@mui/x-data-grid";

/** 해당 셀이 입력 가능한 상태인지 판단한다. false면 회색으로 비활성 표시한다. */
export type IsCellEnabled = (params: any) => boolean;

/** 편집 가능한 문자열 컬럼 */
export const textColumn = (
  field: string,
  headerName: string,
  width: number
): GridColDef => ({
  field,
  headerName,
  editable: true,
  width,
});

/**
 * 편집 가능한 우측 정렬 숫자 컬럼.
 *
 * isCellEnabled를 넘기면 그 결과에 따라 enable-cell / disable-cell 클래스가 붙는다.
 * (클래스별 배경색은 shared/gridStyle.ts 참고)
 */
export const numberColumn = (
  field: string,
  headerName: string,
  isCellEnabled?: IsCellEnabled,
  width: number = 90
): GridColDef => {
  const column: GridColDef = {
    field,
    headerName,
    editable: true,
    width,
    align: "right",
  };

  if (isCellEnabled)
    column.cellClassName = (params) =>
      isCellEnabled(params) ? "enable-cell" : "disable-cell";

  return column;
};
