import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";

class StoryShearTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true, // 가로 모드
      columnWidths: {
        1: "6.4%",
        2: "7.2%",
        3: "7.2%",
        4: "7.2%",
        5: "7.2%",
        6: "7.2%",
        7: "7.2%",
        8: "7.2%",
        9: "7.2%",
        10: "7.2%",
        11: "7.2%",
        12: "7.2%",
        13: "7.2%",
        14: "7.2%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 335, // 가로모드: 315pt
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
        {/* 1~3열 */}
        {Array.from({ length: 3 }, (_, index) => {
          const actualIndex = index + 1;
          return (
            <View
              style={[
                styles.tableHeaderQuadruple,
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

        {/* Inertial Force */}
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: this.sumWidth(columnWidths, 4, 5),
          }}
        >
          <View style={[styles.tableHeaderDoubleType3]}>
            <Text style={styles.tableHeaderFont}>
              {header[4].split("/")[0]}
            </Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[4],
                    this.sumWidth(columnWidths, 4, 5)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[4].split("/")[1]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + dist + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[5],
                    this.sumWidth(columnWidths, 4, 5)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[5].split("/")[1]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + dist + ")"}</Text>
            </View>
          </View>
        </View>

        {/* Shear Force */}
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: this.sumWidth(columnWidths, 6, 11),
          }}
        >
          {/* First Row */}
          <View style={[styles.tableHeaderSingleType2]}>
            <Text style={styles.tableHeaderFont}>
              {header[6].split("/")[0]}
            </Text>
          </View>
          {/* Second Row */}
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderSingleType2,
                {
                  width: this.convertWidth(
                    this.sumWidth(columnWidths, 6, 7),
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[6].split("/")[1]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderSingleType2,
                {
                  width: this.convertWidth(
                    this.sumWidth(columnWidths, 8, 9),
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[8].split("/")[1]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderSingleType2,
                {
                  width: this.convertWidth(
                    this.sumWidth(columnWidths, 10, 11),
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[10].split("/")[1]}
              </Text>
            </View>
          </View>
          {/* Third Row */}
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[6],
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[6].split("/")[2]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + force + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[7],
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[7].split("/")[2]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + force + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[8],
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[8].split("/")[2]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + force + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[9],
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[9].split("/")[2]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + force + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[10],
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[10].split("/")[2]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + force + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[11],
                    this.sumWidth(columnWidths, 6, 11)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[11].split("/")[2]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + force + ")"}</Text>
            </View>
          </View>
        </View>

        {/* 12-14열: 각각 7.2% */}
        {Array.from({ length: 3 }, (_, index) => {
          const actualIndex = index + 12;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderQuadruple,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 14 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header[actualIndex]}</Text>
              {actualIndex === 12 && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
                </Text>
              )}
              {actualIndex === 13 && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + force + ")"}
                </Text>
              )}
              {actualIndex === 14 && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + force + "." + dist + ")"}
                </Text>
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
                // 1, 3열은 중앙 정렬, 나머지는 우측 정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 3
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 14 ? 0 : 1,
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
        currentHeight += Number(styles.tableHeaderQuadruple.height) || 60;
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

export const storyShearTableRenderer = new StoryShearTableRenderer();
