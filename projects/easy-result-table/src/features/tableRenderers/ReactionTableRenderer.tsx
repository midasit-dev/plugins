import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";

class ReactionTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: false,
      columnWidths: {
        1: "9%",
        2: "13%",
        3: "13%",
        4: "13%",
        5: "13%",
        6: "13%",
        7: "13%",
        8: "13%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 562, // 세로모드: 562pt
    };
  }

  // 공통 헤더 랜더링
  renderHeader(data: TableData): JSX.Element[] {
    let force = data.FORCE || "";
    let dist = data.DIST || "";

    force = force.replace(/[^N]/g, (match) => match.toLowerCase());
    dist = dist.toLowerCase();

    return data.HEAD.filter((_, index) => index !== 0).map((header, index) => {
      const actualIndex = index + 1;
      let main = header;
      let sub = "";

      if (actualIndex >= 3 && actualIndex <= 5) {
        main = header.split("(")[0];
        sub = `(${force})`;
      } else if (actualIndex >= 6 && actualIndex <= 8) {
        main = header.split("(")[0];
        sub = `(${force}.${dist})`;
      }

      return (
        <View
          key={actualIndex}
          style={[
            styles.tableHeaderDouble,
            {
              width: this.getConfig().columnWidths[actualIndex],
              borderRightWidth: actualIndex === 8 ? 0 : 1,
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{main}</Text>
          {sub && <Text style={styles.tableHeaderSubFont}>{sub}</Text>}
        </View>
      );
    });
  }

  // 본문 데이터 렌더링
  private renderRow(row: any[], rowIndex: number): JSX.Element[] {
    return row
      .filter((_, index) => index !== 0)
      .map((cell, index) => {
        const actualIndex = index + 1;
        const value = actualIndex > 2 ? Number(cell).toFixed(3) : cell;

        return (
          <View
            key={actualIndex}
            style={[
              styles.tableCell,
              {
                width: this.getConfig().columnWidths[actualIndex],
                alignItems: actualIndex >= 3 ? "flex-end" : "center",
                borderRightWidth: actualIndex === 8 ? 0 : 1,
              },
            ]}
          >
            <Text style={styles.tableCellFont}>{value}</Text>
          </View>
        );
      });
  }

  // 본문 데이터와 요약 테이블을 합친 전체 데이터 생성
  renderTable(data: TableData): JSX.Element[] {
    // 본문 데이터와 요약 테이블을 합친 전체 데이터 생성
    const allData = this.combineMainAndSummaryData(data);

    const result: JSX.Element[] = [];

    // 각 데이터 행을 개별적으로 렌더링 (헤더 제외)
    allData.forEach((row, index) => {
      result.push(
        <View key={`row-${index}`} style={styles.mainTableRow}>
          {this.renderCombinedRow(row, index, data)}
        </View>
      );
    });

    return result;
  }

  // 페이지별 JSX 반환
  getPages(data: TableData): JSX.Element[][] {
    const config = this.getConfig();
    const pageHeight = config.pageHeight!;
    const allRows = this.renderTable(data);
    const tableHeader = this.renderHeader(data);

    // 페이지 분할
    const pages: JSX.Element[][] = [];
    let currentPageRows: JSX.Element[] = [];
    let currentHeight = 0;
    allRows.forEach((row, idx) => {
      const rowHeight = this.getRowHeight(data.DATA?.[idx] || [], idx, data);
      if (
        currentHeight + rowHeight > pageHeight &&
        currentPageRows.length > 0
      ) {
        // 페이지가 바뀔 때마다 헤더 반복
        pages.push([
          <View key={`table-${pages.length}`} style={styles.mainTable}>
            {currentPageRows}
          </View>,
        ]);
        currentPageRows = [];
        currentHeight = 0;
      }
      // 페이지의 첫 행에는 항상 헤더 추가
      if (currentHeight === 0 && tableHeader) {
        currentPageRows.push(
          <View key={`header-${pages.length}`} style={styles.mainTableRow}>
            {tableHeader}
          </View>
        );
        currentHeight += Number(config.styles?.tableHeaderDouble?.height) || 22;
      }
      currentPageRows.push(row);
      currentHeight += rowHeight;
    });
    if (currentPageRows.length > 0)
      pages.push([
        <View key={`table-${pages.length}`} style={styles.mainTable}>
          {currentPageRows}
        </View>,
      ]);
    return pages;
  }

  // 본문 데이터와 요약 테이블을 합치는 메서드
  public combineMainAndSummaryData(data: TableData): any[][] {
    const mainData = data.DATA || [];
    const summaryData = this.getSummaryTableData(data);

    return [...mainData, ...summaryData];
  }

  // 요약 테이블 데이터를 행 배열로 변환
  private getSummaryTableData(data: TableData): any[][] {
    if (!data.SUB_TABLES?.length) {
      return [];
    }

    const subTable =
      data.SUB_TABLES[0]["SUMMATION OF REACTION FORCES PRINTOUT"];
    if (!subTable || !subTable.DATA || !subTable.DATA.length) {
      return [];
    }

    const summaryRows: any[][] = [];

    // 제목 행 추가
    summaryRows.push([
      { type: "summary_title", text: "SUMMATION OF REACTION FORCES PRINTOUT" },
    ]);

    // 헤더 행 추가
    summaryRows.push(subTable.HEAD);

    // 데이터 행들을 개별적으로 추가
    subTable.DATA.forEach((row) => {
      summaryRows.push(row);
    });

    return summaryRows;
  }

  // 본문과 요약 테이블을 구분하여 렌더링하는 메서드
  private renderCombinedRow(
    row: any[],
    rowIndex: number,
    originalData: TableData
  ): JSX.Element[] {
    // 요약 테이블 제목 행인 경우
    if (row[0]?.type === "summary_title") {
      return [
        <View
          key="summary-title"
          style={[
            styles.tableHeaderSingle,
            {
              borderRightWidth: 0,
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{row[0].text}</Text>
        </View>,
      ];
    }

    // 요약 테이블 헤더나 데이터 행인 경우
    const mainDataLength = originalData.DATA?.length || 0;
    const isSummaryRow = rowIndex >= mainDataLength;

    if (isSummaryRow) {
      // 요약 테이블 제목 다음 행은 헤더
      const isSummaryHeader = rowIndex === mainDataLength + 1;

      if (isSummaryHeader) {
        // 요약 테이블 헤더는 공통 헤더의 2,3,4,5열 값을 사용
        const commonHeaders =
          originalData.HEAD?.filter((_, index) => index >= 2 && index <= 5) ||
          [];

        return [
          // 왼쪽 빈칸
          <View
            key="empty-header"
            style={[
              styles.tableHeaderDouble,
              {
                width: "9%",
                borderRightWidth: 1,
                backgroundColor: "#fff",
              },
            ]}
          >
            <Text style={styles.tableHeaderFont}></Text>
          </View>,
          // 공통 헤더의 2,3,4,5열 값 사용
          ...commonHeaders.map((header, cellIndex) => {
            const actualIndex = cellIndex + 2; // 2,3,4,5열
            let force = originalData.FORCE || "";

            force = force.replace(/[^N]/g, (match) => match.toLowerCase());

            let main = header;
            let sub = "";

            if (actualIndex >= 3 && actualIndex <= 5) {
              main = header.split("(")[0];
              sub = `(${force})`;
            }

            return (
              <View
                key={cellIndex}
                style={[
                  styles.tableHeaderDouble,
                  {
                    width: "13%",
                    borderRightWidth: 1,
                  },
                ]}
              >
                <Text style={styles.tableHeaderFont}>{main}</Text>
                {sub && <Text style={styles.tableHeaderSubFont}>{sub}</Text>}
              </View>
            );
          }),
        ];
      } else {
        // 요약 테이블 데이터 행은 기존 스타일 유지 (왼쪽에 빈칸 추가)
        return [
          // 왼쪽 빈칸
          <View
            key="empty-data"
            style={[
              styles.tableCell,
              {
                width: "9%",
                borderRightWidth: 1,
              },
            ]}
          >
            <Text style={styles.tableCellFont}></Text>
          </View>,
          // 실제 데이터
          ...row.map((cell, cellIndex) => (
            <View
              key={cellIndex}
              style={[
                styles.tableCell,
                {
                  width: "13%",
                  alignItems: cellIndex >= 1 ? "flex-end" : "center",
                  borderRightWidth: 1,
                },
              ]}
            >
              <Text style={styles.tableCellFont}>{cell}</Text>
            </View>
          )),
        ];
      }
    }

    // 일반 본문 행인 경우
    return this.renderRow(row, rowIndex);
  }

  // 행별 동적 높이 반환
  getRowHeight(row: any, rowIndex: number, data: TableData): number {
    const dataRowHeight =
      Number(this.getConfig().styles?.tableCell?.height) || 10;
    const headerRowDoubleHeight =
      Number(this.getConfig().styles?.tableHeaderDouble?.height) || 24;
    const headerRowSingleHeight =
      Number(this.getConfig().styles?.tableHeaderSingle?.height) || 20;
    // summary title (첫 행)
    if (row[0]?.type === "summary_title") return headerRowSingleHeight;
    // summary header (두 번째 행)
    const mainDataLength = data.DATA?.length || 0;
    if (rowIndex === mainDataLength + 1) return headerRowDoubleHeight;
    // summary data
    if (rowIndex > mainDataLength + 1) return dataRowHeight;
    // 일반 데이터
    return dataRowHeight;
  }
}

export const reactionTableRenderer = new ReactionTableRenderer();
