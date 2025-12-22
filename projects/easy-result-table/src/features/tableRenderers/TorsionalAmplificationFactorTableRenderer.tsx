import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars, isAsciiOnly } from "./textUtils";

class TorsionalAmplificationFactorTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: false, // 세로 모드
      columnWidths: {
        1: "9%",
        2: "9%",
        3: "11.0%",
        4: "11.0%",
        5: "13.5%",
        6: "10.0%",
        7: "13.5%",
        8: "13.5%",
        9: "13.5%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 562, // 세로모드: 562pt
    };
  }

  // 하드코딩된 공통 헤더 렌더링
  renderHeader(data: TableData): JSX.Element[] {
    const header = data.HEAD;
    const columnWidths = this.getConfig().columnWidths;

    let dist = data.DIST || "";
    dist = dist.toLowerCase();

    return [
      <View key="header-row" style={styles.mainTableRow}>
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
              {(actualIndex === 3 ||
                actualIndex === 4 ||
                actualIndex === 5) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
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
              <View style={[styles.tableHeaderSingleType2]}>
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
                    },
                  ]}
                >
                  <Text style={styles.tableHeaderFont}>
                    {header[7 + index * 2].split("/")[1]}
                  </Text>
                  <Text style={styles.tableHeaderSubFont}>
                    {"(" + dist + ")"}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {Array.from({ length: 2 }, (_, index) => {
          const actualIndex = index + 8;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderTriple,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 9 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header[actualIndex]}</Text>
              {actualIndex === 8 && (
                <Text style={styles.tableHeaderSubFont}>{"(Ax)"}</Text>
              )}
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
      .filter((_, index) => index !== 0)
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
                // 1,2,9열 중앙정렬, 나머지 우측정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 2 || actualIndex === 9
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 9 ? 0 : 1,
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

    const additionalString =
      'To obtain right results, the torsional amplification factors in "Story/Seismic Tab" dialogue box must be all set to "1"';
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
          currentHeight += Number(styles.tableHeaderTriple.height) || 44;
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

export const torsionalAmplificationFactorTableRenderer =
  new TorsionalAmplificationFactorTableRenderer();
