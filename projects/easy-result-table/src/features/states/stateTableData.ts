import { atom } from "recoil";
import { GetTableArgumentState } from "../utils/getTableArguments";

export interface TableData {
  FORCE: string;
  DIST: string;
  HEAD: string[];
  DATA: string[][];
  SUB_TABLES?: SubTable[];
  tableArguments?: GetTableArgumentState[]; // 테이블 렌더러에서 사용할 인수 정보
}

export interface SubTable {
  [key: string]: {
    HEAD: string[];
    DATA: string[][];
  };
}

export interface AllTableData {
  [key: string]: {
    FORCE: string;
    DIST: string;
    HEAD: string[];
    DATA: string[][];
    SUB_TABLES?: SubTable[];
  };
}

export interface TableResponse {
  author: string;
  filename: string;
  client: string;
  company: string;
  project_title: string;
  certified_by: string;
  table: AllTableData[];
  tableArguments?: GetTableArgumentState[]; // 테이블 인수 정보 추가
}

export const tableDataState = atom<TableResponse | null>({
  key: "tableDataState",
  default: null,
});
