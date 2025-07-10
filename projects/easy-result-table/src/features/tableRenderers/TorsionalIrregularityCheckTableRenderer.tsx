import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";

class TorsionalIrregularityCheckTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: false, // 세로 모드
      columnWidths: {
        1: "9%",
        2: "9%",
        3: "12%",
        4: "12%",
        5: "12%",
        6: "12%",
        7: "12%",
        8: "12%",
        9: "10%",
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

    let dist = data.DIST || "";

    dist = dist.toLowerCase();

    return [
      <View key="header-row" style={styles.mainTableRow}>
        {/* 1-2열: 각각 지정된 폭 */}
        {Array.from({ length: 4 }, (_, index) => {
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
            </View>
          );
        })}

        {/* 3-8열: 각각 7.7% */}
        {Array.from({ length: 2 }, (_, index) => {
          return (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                width: this.sumWidth(
                  columnWidths,
                  5 + index * 2,
                  6 + index * 2
                ),
              }}
            >
              <View style={[styles.tableHeaderSingleType2]}>
                <Text style={styles.tableHeaderFont}>
                  {header[5 + index * 2].split("/")[0]}
                </Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[5 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          5 + index * 2,
                          6 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[5 + index * 2].split("/")[1]}
                  </Text>
                  {index === 0 && (
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
                        columnWidths[6 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          5 + index * 2,
                          6 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[6 + index * 2].split("/")[1]}
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
                  borderRightWidth: 0,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header[actualIndex]}</Text>
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
    return row
      .filter((_, index) => index !== 0) // 첫 번째 열 제외
      .map((cell, index) => {
        const actualIndex = index + 1;
        return (
          <View
            key={actualIndex}
            style={[
              styles.tableCell,
              {
                width: this.getConfig().columnWidths[actualIndex],
                // 1, 2, 9열은 중앙 정렬, 나머지는 우측 정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 2 || actualIndex === 9
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 9 ? 0 : 1,
              },
            ]}
          >
            <Text style={styles.tableCellFont}>{cell}</Text>
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

export const torsionalIrregularityCheckTableRenderer =
  new TorsionalIrregularityCheckTableRenderer();
