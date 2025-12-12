import { TableData } from "../states/stateTableData";
import { StyleSheet } from "@react-pdf/renderer";

export interface TableRenderConfig {
  isLandscape: boolean;
  columnWidths: { [key: number]: string };
  styles?: ReturnType<typeof StyleSheet.create>;
  repeatHeader?: boolean; // 페이지마다 헤더 반복 여부
  useCommonHeader?: boolean; // 공통 헤더 사용 여부
  pageHeight?: number; // 가로모드: 315pt, 세로모드: 562pt
}

export interface TableRenderer {
  getConfig: () => TableRenderConfig;
  // 페이지 분할 로직 제거 - 순수하게 테이블 렌더링만 담당
  renderTable: (data: TableData) => JSX.Element[];
  // 전체 데이터 행 수 반환 (페이지 분할 계산용)
  getTotalRows?: (data: TableData) => number;
  // 고정 높이 기반으로 총 페이지 수 계산
  getTotalPages?: (data: TableData) => number;
  // 테이블 헤더 렌더링 (각 페이지마다 사용)
  renderHeader?: (data: TableData) => JSX.Element[];
  // 행별 동적 높이 반환
  getRowHeight: (row: any, rowIndex: number, data: TableData) => number;
  // 페이지별 JSX 반환
  getPages: (data: TableData) => JSX.Element[][];
}

export const styles = StyleSheet.create({
  mainTable: {
    width: "100%",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 0,
  },
  mainTableRow: {
    flexDirection: "row",
    borderColor: "#000",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  // 데이터 셀 스타일
  tableCell: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 2,
    paddingRight: 2,
    borderRightWidth: 1,
    borderRightColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    height: 11, // 폰트 크기(8pt) + 패딩(0pt) + 여유 공간(2pt) = 10pt
  },
  // 데이터 폰트 스타일
  tableCellFont: {
    fontSize: 7,
    textAlign: "center",
  },
  // 헤더 셀 스타일 (4줄 헤더)
  tableHeaderQuadruple: {
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    height: 60, // Header Single + Header Double
  },

  // 헤더 셀 스타일 (3줄 헤더)
  tableHeaderTriple: {
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    height: 44, // Header Single + Header Double
  },
  // 헤더 셀 스타일 (2줄 헤더)
  tableHeaderDouble: {
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    height: 24,
  },
  tableHeaderDoubleType2: {
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },
  tableHeaderDoubleType3: {
    padding: 2,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    height: 32,
  },
  // 헤더 셀 스타일 (1줄 헤더)
  tableHeaderSingle: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    height: 16,
  },
  // 헤더 셀 스타일 (1줄 헤더)
  tableHeaderSingleType2: {
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderBottomWidth: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    height: 16, // 폰트 크기(9pt) + 패딩(4pt) + 여유 공간(3pt) = 16pt
  },

  // 헤더 폰트 스타일
  tableHeaderFont: {
    fontSize: 7,
    fontWeight: "normal",
    textAlign: "center",
  },
  tableHeaderSubFont: {
    fontSize: 7,
    fontWeight: "normal",
  },
});
