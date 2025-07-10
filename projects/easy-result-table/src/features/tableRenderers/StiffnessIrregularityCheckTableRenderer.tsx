import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";

class StiffnessIrregularityCheckTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true, // 가로 모드
      columnWidths: {
        1: "5%",
        2: "5%",
        3: "9%",
        4: "9%",
        5: "9%",
        6: "9%",
        7: "9%",
        8: "9%",
        9: "9%",
        10: "9%",
        11: "9%",
        12: "9%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 335, // 가로모드: 335pt
    };
  }

  // 하드코딩된 공통 헤더 렌더링
  renderHeader(data: TableData): JSX.Element[] {
    const header = data.HEAD;
    const columnWidths = this.getConfig().columnWidths;

    let force = data.FORCE || "";
    let dist = data.DIST || "";

    force = force.replace(/[^N]/g, (match) => match.toLowerCase());
    dist = dist.toLowerCase();

    return [
      <View key="header-row" style={styles.mainTableRow}>
        {Array.from({ length: 7 }, (_, index) => {
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
              {(actualIndex === 3 ||
                actualIndex === 4 ||
                actualIndex === 5) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
                </Text>
              )}
              {actualIndex === 6 && (
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
                  8 + index * 2,
                  9 + index * 2
                ),
              }}
            >
              <View style={[styles.tableHeaderSingleType2]}>
                <Text style={styles.tableHeaderFont}>
                  {header[8 + index * 2].split("/")[0]}
                </Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View
                  style={[
                    styles.tableHeaderDoubleType2,
                    {
                      width: this.convertWidth(
                        columnWidths[8 + index * 2],
                        this.sumWidth(
                          columnWidths,
                          8 + index * 2,
                          9 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[8 + index * 2].split("/")[1]}
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
                          8 + index * 2,
                          9 + index * 2
                        )
                      ),
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[9 + index * 2].split("/")[1]}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {Array.from({ length: 3 }, (_, index) => {
          const actualIndex = index + 10;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderTriple,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 12 ? 0 : 1,
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
      .filter((_, index) => index !== 0)
      .map((cell, index) => {
        const actualIndex = index + 1;
        return (
          <View
            key={actualIndex}
            style={[
              styles.tableCell,
              {
                width: this.getConfig().columnWidths[actualIndex],
                // 1,2,12열 중앙정렬, 나머지 우측정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 2 || actualIndex === 12
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 12 ? 0 : 1,
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
        tableHeader.forEach((headerRow) => {
          currentPageRows.push(headerRow);
          currentHeight += Number(styles.tableHeaderDouble.height) || 24;
        });
      }
      currentPageRows.push(row);
      currentHeight += rowHeight;
    });
    if (currentPageRows.length > 0) {
      pages.push([
        <View key={`table-${pages.length}`} style={styles.mainTable}>
          {currentPageRows}
        </View>,
      ]);
    }
    return pages;
  }
}

export const stiffnessIrregularityCheckTableRenderer =
  new StiffnessIrregularityCheckTableRenderer();
