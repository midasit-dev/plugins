import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars } from "./textUtils";

class StoryAxialForceSumTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: false, // 세로 모드
      columnWidths: {
        1: "13%",
        2: "13%",
        3: "13%",
        4: "13%",
        5: "16%",
        6: "16%",
        7: "16%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 562, // 세로모드: 562pt
    };
  }

  // 하드코딩된 헤더 렌더링
  renderHeader(data: TableData): JSX.Element[] {
    const header = data.HEAD;
    const columnWidths = this.getConfig().columnWidths;

    let force = data.FORCE || "";
    let dist = data.DIST || "";

    force = force.replace(/[^N]/g, (match) => match.toLowerCase());
    dist = dist.toLowerCase();

    return [
      <View key="header-row" style={styles.mainTableRow}>
        {/* 1-2열: 각각 지정된 폭 */}
        {Array.from({ length: 5 }, (_, index) => {
          const actualIndex = index + 1;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderTriple,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header[actualIndex]}</Text>
              {(actualIndex === 3 || actualIndex === 4) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
                </Text>
              )}
              {actualIndex === 5 && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + force + ")"}
                </Text>
              )}
            </View>
          );
        })}

        {Array.from({ length: 1 }, (_, index) => {
          return (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                width: this.sumWidth(
                  columnWidths,
                  6 + index * 2,
                  7 + index * 2
                ),
              }}
            >
              <View
                style={[styles.tableHeaderSingleType2, { borderRightWidth: 0 }]}
              >
                <Text style={styles.tableHeaderFont}>
                  {header[6 + index * 2].split("/")[0]}
                </Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[6 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          6 + index * 2,
                          7 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[6 + index * 2].split("/")[1]}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[7 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          6 + index * 2,
                          7 + index * 2
                        )
                      ),
                      borderRightWidth: 0,
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[7 + index * 2].split("/")[1]}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>,
    ];
  }

  private sumWidth(
    columnWidths: Record<string, string>,
    start: number,
    end: number
  ): string {
    let sum = 0;
    for (let i = start; i <= end; i++) {
      const value = columnWidths[i.toString()];
      if (value) {
        sum += parseFloat(value.replace("%", ""));
      }
    }
    return sum.toFixed(3) + "%";
  }

  private convertWidth(width: string, totalWidth: string): string {
    const numA = parseFloat(width.replace("%", ""));
    const numB = parseFloat(totalWidth.replace("%", ""));
    if (numB === 0) return "0%";
    const result = (numA * 100) / numB;
    return result.toFixed(3) + "%";
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
                // 1, 2열은 중앙 정렬, 나머지는 우측 정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 2
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 7 ? 0 : 1,
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
        currentHeight += Number(styles.tableHeaderDouble.height) || 24;
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

export const storyAxialForceSumTableRenderer =
  new StoryAxialForceSumTableRenderer();
