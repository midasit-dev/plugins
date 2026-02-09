// ag-grid 관련 타입 정의
import type { ColDef } from 'ag-grid-community';

/** ag-grid 행 데이터: 인덱스 기반 필드 ("col0", "col1", ...) */
export type GridRowData = Record<string, string>;

/** 탭별 ag-grid 컬럼 정의 */
export interface TabGridConfig {
  colDefs: ColDef[];
}
