import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars, isAsciiOnly } from "./textUtils";

class StoryDriftTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true, // 가로 모드
      columnWidths: {
        1: "10%",
        2: "5%",
        3: "7%",
        4: "7%",
        5: "7%",
        6: "5%",
        7: "7.0%",
        8: "7.0%",
        9: "7.0%",
        10: "5.0%",
        11: "7.0%",
        12: "7.0%",
        13: "7.0%",
        14: "7.0%",
        15: "5.0%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 335, // 가로모드: 315pt
    };
  }

  // 공통 헤더 렌더링
  renderHeader(data: TableData): JSX.Element[] {
    const headers = data.HEAD.filter((_, index) => index !== 0);
    const columnWidths = this.getConfig().columnWidths;
    let dist = data.DIST || "";

    dist = dist.toLowerCase();

    // 데이터를 활용한 하드코딩 헤더 구현
    return [
      <View key="header-row" style={[styles.mainTableRow, {borderTopWidth: 1}]}>
        <View
          style={[
            styles.tableHeaderQuadruple,
            {
              width: columnWidths[1],
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{headers[0]}</Text>
        </View>
        <View
          style={[
            styles.tableHeaderQuadruple,
            {
              width: columnWidths[2],
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{headers[1]}</Text>
        </View>
        <View
          style={[
            styles.tableHeaderQuadruple,
            {
              width: columnWidths[3],
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{headers[2]}</Text>
          <Text style={styles.tableHeaderSubFont}>{"(" + dist + ")"}</Text>
        </View>
        <View
          style={[
            styles.tableHeaderQuadruple,
            {
              width: columnWidths[4],
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{headers[3]}</Text>
          <Text style={styles.tableHeaderFont}>(ad)</Text>
        </View>
        <View
          style={[
            styles.tableHeaderQuadruple,
            {
              width: columnWidths[5],
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{headers[4]}</Text>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: this.sumWidth(columnWidths, 6, 10),
          }}
        >
          <View style={[styles.tableHeaderSingleType2]}>
            <Text style={styles.tableHeaderFont}>
              {headers[5].split("/")[0]}
            </Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[6],
                    this.sumWidth(columnWidths, 6, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[5].split("/")[1]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[7],
                    this.sumWidth(columnWidths, 6, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[6].split("/")[1]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + dist + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[8],
                    this.sumWidth(columnWidths, 6, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[7].split("/")[1]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + dist + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[9],
                    this.sumWidth(columnWidths, 6, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[8].split("/")[1]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[10],
                    this.sumWidth(columnWidths, 6, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[9].split("/")[1]}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: this.sumWidth(columnWidths, 11, 15),
          }}
        >
          <View
            style={[styles.tableHeaderSingleType2, { borderRightWidth: 0 }]}
          >
            <Text style={styles.tableHeaderFont}>
              {headers[10].split("/")[0]}
            </Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[11],
                    this.sumWidth(columnWidths, 11, 15)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[10].split("/")[1]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + dist + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[12],
                    this.sumWidth(columnWidths, 11, 15)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[11].split("/")[1]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>{"(" + dist + ")"}</Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[13],
                    this.sumWidth(columnWidths, 11, 15)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[12].split("/")[1]}
              </Text>
              <Text style={styles.tableHeaderSubFont}>
                {"(Maximum/ Current)"}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[14],
                    this.sumWidth(columnWidths, 11, 15)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[13].split("/")[1]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderTriple,
                {
                  width: this.convertWidth(
                    columnWidths[15],
                    this.sumWidth(columnWidths, 11, 15)
                  ),
                  borderRightWidth: 0,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {headers[14].split("/")[1]}
              </Text>
            </View>
          </View>
        </View>
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
    return sum.toFixed(1) + "%";
  }

  private convertWidth(width: string, totalWidth: string): string {
    const numA = parseFloat(width.replace("%", ""));
    const numB = parseFloat(totalWidth.replace("%", ""));
    if (numB === 0) return "0%";
    const result = (numA * 100) / numB;
    return result.toFixed(1) + "%";
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
                // 1, 2, 10, 15 열은 중앙 정렬
                alignItems:
                  actualIndex === 1 ||
                  actualIndex === 2 ||
                  actualIndex === 10 ||
                  actualIndex === 15
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 15 ? 0 : 1,
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

    console.log("tableArgument", tableArgument);
    // ADDTIONAL 정보를 문자열로 변환하여 맨 앞에 추가
    if (tableArgument?.Argument?.ADDITIONAL) {
      const param = tableArgument.Argument.ADDITIONAL.SET_STORY_DRIFT_PARAMS;
      const cd = param?.DEFLECTION_AMPL_FACTOR_VALUE;
      const ie = param?.IMPORTANCE_FACTOR_VALUE;
      const sc = param?.SCALE_FACTOR_VALUE;
      const ar = param?.ALLOWABLE_RATIO;

      const additionalString = `RMC, Not Used, Cd= ${cd}, Ie= ${ie}, Scale Factor= ${sc}, Allowalbe Ratio= ${ar}`;

      console.log("추가할 ADDTIONAL 문자열:", additionalString);

      result.push(
        <View key="additional-row" style={[styles.mainTableRow, {borderTopWidth: 1}]}>
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
            <Text style={styles.tableHeaderFont}>{additionalString}</Text>
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
          currentHeight += Number(styles.tableHeaderQuadruple.height) || 60;
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

export const storyDriftTableRenderer = new StoryDriftTableRenderer();
