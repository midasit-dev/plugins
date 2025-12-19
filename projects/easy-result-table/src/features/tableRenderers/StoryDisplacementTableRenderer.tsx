import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars } from "./textUtils";

class StoryDisplacementTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: false, // 세로 모드
      columnWidths: {
        1: "9%",
        2: "10%",
        3: "10%",
        4: "13%",
        5: "13%",
        6: "15%",
        7: "15%",
        8: "15%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 562, // 세로모드: 562pt
    };
  }

  // 공통 헤더 렌더링
  renderHeader(data: TableData): JSX.Element[] {
    const headers = data.HEAD.filter((_, index) => index !== 0); // 첫 번째 열 제외
    const columnWidths = this.getConfig().columnWidths;

    let dist = data.DIST || "";
    dist = dist.toLowerCase();

    return [
      <View key="header-row" style={styles.mainTableRow}>
        {headers.map((header, index) => {
          const actualIndex = index + 1;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderDouble,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 8 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header}</Text>
              {actualIndex === 4 ||
              actualIndex === 5 ||
              actualIndex === 6 ||
              actualIndex === 7 ? (
                <Text style={styles.tableHeaderFont}>{"(" + dist + ")"}</Text>
              ) : null}
            </View>
          );
        })}
      </View>,
    ];
  }

  // 본문 데이터 렌더링
  private renderRow(row: any[], rowIndex: number): JSX.Element[] {
    const config = this.getConfig();
    return row
      .filter((_, index) => index !== 0) // 첫 번째 열 제외
      .map((cell, index) => {
        const actualIndex = index + 1;
        const cellWidth = config.columnWidths[actualIndex];
        const maxChars = calculateMaxChars(cellWidth, 7, config.isLandscape);
        const truncatedCell = truncateText(cell, maxChars);
        
        return (
          <View
            key={actualIndex}
            style={[
              styles.tableCell,
              {
                width: cellWidth,
                // 첫 3개는 중앙 정렬, 나머지는 오른쪽 정렬
                alignItems: actualIndex <= 3 ? "center" : "flex-end",
                borderRightWidth: actualIndex === 8 ? 0 : 1,
              },
            ]}
          >
            <Text style={styles.tableCellFont}>{truncatedCell}</Text>
          </View>
        );
      });
  }

  renderTable(data: TableData): JSX.Element[] {
    const result: JSX.Element[] = [];

    // 각 데이터 행을 개별적으로 렌더링
    data.DATA?.forEach((row, index) => {
      result.push(
        <View key={`row-${index}`} style={styles.mainTableRow}>
          {this.renderRow(row, index)}
        </View>
      );
    });

    return result;
  }

  getRowHeight(row: any, rowIndex: number, data: TableData): number {
    return Number(styles.tableCell.height) || 11;
  }

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
        // tableHeader는 이미 mainTableRow로 감싸져 있으므로 그대로 추가
        tableHeader.forEach((headerRow) => {
          currentPageRows.push(headerRow);
        });
        currentHeight += Number(styles.tableHeaderDouble.height) || 44;
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
}

export const storyDisplacementTableRenderer =
  new StoryDisplacementTableRenderer();
