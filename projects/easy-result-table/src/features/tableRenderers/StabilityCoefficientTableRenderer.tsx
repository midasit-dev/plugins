import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars, isAsciiOnly } from "./textUtils";

class StabilityCoefficientTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true, // 가로 모드
      columnWidths: {
        1: "12%",
        2: "8%",
        3: "8%",
        4: "10%",
        5: "10%",
        6: "10%",
        7: "8%",
        8: "10%",
        9: "10%",
        10: "6%",
        11: "10%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 335,
    };
  }

  // 공통 헤더 렌더링
  renderHeader(data: TableData): JSX.Element[] {
    const headers = data.HEAD.filter((_, index) => index !== 0); // 첫 번째 열 제외
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
                  borderRightWidth: actualIndex === 11 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header}</Text>
              {(actualIndex === 3 || actualIndex === 6) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
                </Text>
              )}
              {(actualIndex === 4 || actualIndex === 5) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + force + ")"}
                </Text>
              )}
              {actualIndex === 7 && (
                <Text style={styles.tableHeaderSubFont}>{"(Beta)"}</Text>
              )}
              {actualIndex === 8 && (
                <Text style={styles.tableHeaderSubFont}>{"(Theta)"}</Text>
              )}
              {actualIndex === 11 && (
                <Text style={styles.tableHeaderSubFont}>{"(ad)"}</Text>
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
      .filter((_, index) => index !== 0) // 첫 번째 열 제외
      .map((cell, index) => {
        const actualIndex = index + 1;
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
                // 1, 2, 10열은 중앙 정렬, 나머지는 우측 정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 2 || actualIndex === 10
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 11 ? 0 : 1,
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

    // argument 값 가져와서 작업할 공간 (본문 첫 행)
    const tableArgument = data.tableArguments?.[0];
    if (tableArgument?.Argument?.ADDITIONAL) {
      const cd =
        tableArgument.Argument.ADDITIONAL.SET_STABILITY_COEFFICIENT_PARAMS
          ?.DEFLECTION_AMPL_FACTOR_VALUE;
      const Ie =
        tableArgument.Argument.ADDITIONAL.SET_STABILITY_COEFFICIENT_PARAMS
          ?.IMPORTANCE_FACTOR_VALUE;
      const sc =
        tableArgument.Argument.ADDITIONAL.SET_STABILITY_COEFFICIENT_PARAMS
          ?.SCALE_FACTOR_VALUE;

      const additionalString = `Cd= ${cd}, Ie= ${Ie}, Scale Factor= ${sc}`;

      result.push(
        <View key="additional-row" style={styles.mainTableRow}>
          <View
            style={[
              styles.tableHeaderSingle,
              {
                width: "100%",
                borderRightWidth: 0,
                alignItems: "flex-start",
              },
            ]}
          >
            <Text style={styles.tableHeaderFont}>{additionalString}</Text>
          </View>
        </View>
      );
    }

    // 본문 데이터 렌더링
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
        currentHeight += Number(styles.tableHeaderTriple.height) || 44;
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

export const stabilityCoefficientTableRenderer =
  new StabilityCoefficientTableRenderer();
