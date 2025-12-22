import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars, isAsciiOnly } from "./textUtils";

class CapacityIrregularityCheckTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true, // 가로 모드
      columnWidths: {
        1: "6.0%",
        2: "6.0%",
        3: "6.0%",
        4: "6.0%",
        5: "10.0%",
        6: "10.0%",
        7: "7.5%",
        8: "7.5%",
        9: "6.0%",
        10: "10.0%",
        11: "10.0%",
        12: "7.5%",
        13: "7.5%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 335,
    };
  }

  // 공통 헤더 렌더링
  renderHeader(data: TableData): JSX.Element[] {
    const headers = data.HEAD.filter((_, index) => index !== 0);
    const columnWidths = this.getConfig().columnWidths;

    let force = data.FORCE || "";
    let dist = data.DIST || "";

    force = force.replace(/[^N]/g, (match) => match.toLowerCase());
    dist = dist.toLowerCase();

    return [
      <View key="header-row" style={styles.mainTableRow}>
        {headers.map((header, index) => {
          const actualIndex = index + 1;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderTriple,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 13 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header}</Text>
              {(actualIndex === 2 || actualIndex === 3) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
                </Text>
              )}
              {(actualIndex === 5 ||
                actualIndex === 6 ||
                actualIndex === 10 ||
                actualIndex === 11) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + force + ")"}
                </Text>
              )}
              {(actualIndex === 4 || actualIndex === 9) && (
                <Text style={styles.tableHeaderSubFont}>{"([deg])"}</Text>
              )}
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
      .filter((_, index) => index !== 0)
      .map((cell, index) => {
        const actualIndex = index + 1; // 첫 번째 열 제외하고 2부터 시작
        const cellWidth = config.columnWidths[actualIndex];
        const maxChars = calculateMaxChars(cellWidth, 7, config.isLandscape);
        const truncatedCell = truncateText(cell, maxChars);
        const isAscii = isAsciiOnly(truncatedCell);
        
        return (
          <View
            key={actualIndex}
            style={[
              styles.tableCell,
              {
                width: cellWidth,
                // 1, 8, 13 열은 중앙 정렬, 나머지는 우측 정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 8 || actualIndex === 13
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 13 ? 0 : 1,
              },
            ]}
          >
            <Text style={isAscii ? styles.tableCellFont : styles.tableCellFontMultilang}>
              {truncatedCell}
            </Text>
          </View>
        );
      });
  }

  renderTable(data: TableData): JSX.Element[] {
    const result: JSX.Element[] = [];

    // 이미 필터링된 tableArgument 사용 (첫 번째 요소)
    const tableArgument = data.tableArguments?.[0];

    // ANGLE 정보를 문자열로 변환하여 맨 앞에 추가
    if (tableArgument?.Argument?.ADDITIONAL?.SET_ANGLE?.ANGLE !== undefined) {
      const angle = tableArgument.Argument.ADDITIONAL.SET_ANGLE.ANGLE;
      const angleString = `Angle: ${angle} [deg]`;

      result.push(
        <View key="angle-row" style={styles.mainTableRow}>
          <View
            style={[
              styles.tableHeaderSingle,
              {
                width: "100%",
                alignItems: "flex-start",
                borderRightWidth: 0,
              },
            ]}
          >
            <Text style={styles.tableHeaderFont}>{angleString}</Text>
          </View>
        </View>
      );
    }

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
        // 헤더가 배열이므로 각각을 개별적으로 추가
        tableHeader.forEach((headerRow, headerIndex) => {
          currentPageRows.push(headerRow);
          currentHeight += Number(styles.tableHeaderTriple.height) || 24;
        });
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

export const capacityIrregularityCheckTableRenderer =
  new CapacityIrregularityCheckTableRenderer();
