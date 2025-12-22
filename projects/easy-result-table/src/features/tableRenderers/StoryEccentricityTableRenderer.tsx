import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars, isAsciiOnly } from "./textUtils";

class StoryEccentricityTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: false, // 세로 모드
      columnWidths: {
        1: "7.6%",
        2: "7.7%",
        3: "7.6%",
        4: "7.6%",
        5: "7.6%",
        6: "7.6%",
        7: "7.6%",
        8: "7.6%",
        9: "8.7%",
        10: "7.6%",
        11: "7.6%",
        12: "7.6%",
        13: "7.6%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 562, // 세로모드: 562pt
    };
  }

  // 공통 헤더 렌더링 (하드코딩 공간만 준비)
  renderHeader(data: TableData): JSX.Element[] {
    const header = data.HEAD;
    const columnWidths = this.getConfig().columnWidths;

    let force = data.FORCE || "";
    let dist = data.DIST || "";

    force = force.replace(/[^N]/g, (match) => match.toLowerCase());
    dist = dist.toLowerCase();

    // 헤더 하드코딩 공간 준비
    return [
      <View key="header-row" style={styles.mainTableRow}>
        {/* 1-2열: 각각 지정된 폭 */}
        {Array.from({ length: 2 }, (_, index) => {
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
              {actualIndex === 2 && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
                </Text>
              )}
            </View>
          );
        })}

        {/* 3-8열: 각각 7.7% */}
        {Array.from({ length: 3 }, (_, index) => {
          return (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                width: this.sumWidth(
                  columnWidths,
                  3 + index * 2,
                  4 + index * 2
                ),
              }}
            >
              <View style={[styles.tableHeaderSingleType2]}>
                <Text style={styles.tableHeaderFont}>
                  {header[3 + index * 2].split("/")[0]}
                </Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[3 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          3 + index * 2,
                          4 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[3 + index * 2].split("/")[1]}
                  </Text>
                  <Text style={styles.tableHeaderSubFont}>
                    {"(" + dist + ")"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[4 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          3 + index * 2,
                          4 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[4 + index * 2].split("/")[1]}
                  </Text>
                  <Text style={styles.tableHeaderSubFont}>
                    {"(" + dist + ")"}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {Array.from({ length: 1 }, (_, index) => {
          const actualIndex = index + 9;
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
              <Text style={styles.tableHeaderSubFont}>
                {"(" + force + "." + dist + ")"}
              </Text>
            </View>
          );
        })}

        {/* 10-13열: 각각 7.7% */}
        {Array.from({ length: 2 }, (_, index) => {
          const actualIndex = index + 10;
          return (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                width: this.sumWidth(
                  columnWidths,
                  10 + index * 2,
                  11 + index * 2
                ),
              }}
            >
              <View
                style={[
                  styles.tableHeaderSingleType2,
                  { borderRightWidth: actualIndex === 10 ? 1 : 0 },
                ]}
              >
                <Text style={styles.tableHeaderFont}>
                  {header[10 + index * 2].split("/")[0]}
                </Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[10 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          10 + index * 2,
                          11 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[10 + index * 2].split("/")[1]}
                  </Text>
                  {actualIndex === 10 && (
                    <Text style={styles.tableHeaderSubFont}>
                      {"(" + dist + ")"}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[11 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          10 + index * 2,
                          11 + index * 2
                        )
                      ),
                      borderRightWidth: actualIndex === 10 ? 1 : 0,
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[11 + index * 2].split("/")[1]}
                  </Text>
                  {actualIndex === 10 && (
                    <Text style={styles.tableHeaderSubFont}>
                      {"(" + dist + ")"}
                    </Text>
                  )}
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
        const isAscii = isAsciiOnly(truncatedCell);
        
        return (
          <View
            key={actualIndex}
            style={[
              styles.tableCell,
              {
                width: cellWidth,
                // 1열만 중앙 정렬, 나머지는 우측 정렬
                alignItems: actualIndex === 1 ? "center" : "flex-end",
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

export const storyEccentricityTableRenderer =
  new StoryEccentricityTableRenderer();
