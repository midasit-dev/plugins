import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars, isAsciiOnly } from "./textUtils";

class OverturningMomentTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true, // 가로 모드
      columnWidths: {
        // 첫 번째 테이블: 1~12열
        1: "7.0%",
        2: "7.0%",
        3: "7.0%",
        4: "7.0%",
        5: "7.0%",
        6: "5.0%",
        7: "10.0%",
        8: "10.0%",
        9: "10.0%",
        10: "10.0%",
        11: "10.0%",
        12: "10.0%",
        // 두 번째 테이블: 1~5, 13~19열
        13: "5.0%",
        14: "10.0%",
        15: "10.0%",
        16: "10.0%",
        17: "10.0%",
        18: "10.0%",
        19: "10.0%",
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 335,
    };
  }

  // 첫 번째 테이블 헤더 렌더링 (1~12열)
  private renderFirstTableHeader(data: TableData): JSX.Element[] {
    const header = data.HEAD;
    const columnWidths = this.getConfig().columnWidths;

    let force = data.FORCE || "";
    let dist = data.DIST || "";

    force = force.replace(/[^N]/g, (match) => match.toLowerCase());
    dist = dist.toLowerCase();

    return [
      <View key="first-table-header-row" style={styles.mainTableRow}>
        {/* 1-6열: 각각 지정된 폭 */}
        {Array.from({ length: 6 }, (_, index) => {
          const actualIndex = index + 1;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderQuadruple,
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
                <Text style={styles.tableHeaderSubFont}>{"(tau)"}</Text>
              )}
              {actualIndex === 6 && (
                <Text style={styles.tableHeaderSubFont}>{"([deg])"}</Text>
              )}
            </View>
          );
        })}
        {/* 7-10열: 각각 지정된 폭 */}
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: this.sumWidth(columnWidths, 7, 10),
          }}
        >
          <View style={styles.tableHeaderSingleType2}>
            <Text style={styles.tableHeaderFont}>
              {header[7].split("/")[0] + " (" + force + "." + dist + ")"}
            </Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderSingleType2,
                {
                  width: this.convertWidth(
                    this.sumWidth(columnWidths, 7, 8),
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[7].split("/")[1]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderSingleType2,
                {
                  width: this.convertWidth(
                    this.sumWidth(columnWidths, 9, 10),
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[9].split("/")[1]}
              </Text>
            </View>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[7],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[7].split("/")[2]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[8],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[8].split("/")[2]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[9],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[9].split("/")[2]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[10],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[10].split("/")[2]}
              </Text>
            </View>
          </View>
        </View>
        {/* 11-12열: 각각 지정된 폭 */}
        {Array.from({ length: 2 }, (_, index) => {
          const actualIndex = index + 11;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderQuadruple,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 12 ? 0 : 1,
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
      </View>,
    ];
  }

  // 두 번째 테이블 헤더 렌더링 (1~5, 13~19열)
  private renderSecondTableHeader(data: TableData): JSX.Element[] {
    const allHeaders = data.HEAD;
    const firstHeaders = allHeaders.slice(0, 6); // 1~5열
    const secondHeaders = allHeaders.slice(13); // 13~19열
    const header = firstHeaders.concat(secondHeaders);

    const columnWidths = this.getConfig().columnWidths;

    let force = data.FORCE || "";
    let dist = data.DIST || "";

    force = force.replace(/[^N]/g, (match) => match.toLowerCase());
    dist = dist.toLowerCase();

    return [
      <View key="first-table-header-row" style={styles.mainTableRow}>
        {/* 1-6열: 각각 지정된 폭 */}
        {Array.from({ length: 6 }, (_, index) => {
          const actualIndex = index + 1;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderQuadruple,
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
                <Text style={styles.tableHeaderSubFont}>{"(tau)"}</Text>
              )}
              {actualIndex === 6 && (
                <Text style={styles.tableHeaderSubFont}>{"([deg])"}</Text>
              )}
            </View>
          );
        })}
        {/* 7-10열: 각각 지정된 폭 */}
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: this.sumWidth(columnWidths, 7, 10),
          }}
        >
          <View style={styles.tableHeaderSingleType2}>
            <Text style={styles.tableHeaderFont}>
              {header[7].split("/")[0] + " (" + force + "." + dist + ")"}
            </Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderSingleType2,
                {
                  width: this.convertWidth(
                    this.sumWidth(columnWidths, 7, 8),
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[7].split("/")[1]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderSingleType2,
                {
                  width: this.convertWidth(
                    this.sumWidth(columnWidths, 9, 10),
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[9].split("/")[1]}
              </Text>
            </View>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[7],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[7].split("/")[2]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[8],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[8].split("/")[2]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[9],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[9].split("/")[2]}
              </Text>
            </View>
            <View
              style={[
                styles.tableHeaderDoubleType2,
                {
                  width: this.convertWidth(
                    columnWidths[10],
                    this.sumWidth(columnWidths, 7, 10)
                  ),
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>
                {header[10].split("/")[2]}
              </Text>
            </View>
          </View>
        </View>
        {/* 11-12열: 각각 지정된 폭 */}
        {Array.from({ length: 2 }, (_, index) => {
          const actualIndex = index + 11;
          return (
            <View
              key={actualIndex}
              style={[
                styles.tableHeaderQuadruple,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 12 ? 0 : 1,
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
      </View>,
    ];
  }

  // 공통 헤더 렌더링 (2개 테이블 모두)
  renderHeader(data: TableData): JSX.Element[] {
    return [
      ...this.renderFirstTableHeader(data),
      ...this.renderSecondTableHeader(data),
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

  // 첫 번째 테이블 행 렌더링 (1~12열)
  private renderFirstTableRow(row: any[], rowIndex: number): JSX.Element[] {
    const filteredRow = row.filter((_, index) => index !== 0).slice(0, 12);
    const columnWidths = this.getConfig().columnWidths;

    return filteredRow.map((cell, index) => {
      const actualIndex = index + 1;
      const isAscii = isAsciiOnly(String(cell));
      
      return (
        <View
          key={actualIndex}
          style={[
            styles.tableCell,
            {
              width: columnWidths[actualIndex],
              // 1, 2열을 제외하고 모두 우측 정렬
              alignItems: "flex-end",
              borderRightWidth: actualIndex === 12 ? 0 : 1,
            },
          ]}
        >
          <Text style={isAscii ? styles.tableCellFont : styles.tableCellFontMultilang}>
            {cell}
          </Text>
        </View>
      );
    });
  }

  // 두 번째 테이블 행 렌더링 (1~5, 13~19열)
  private renderSecondTableRow(row: any[], rowIndex: number): JSX.Element[] {
    const filteredRow = row.filter((_, index) => index !== 0);
    const firstCells = filteredRow.slice(0, 5); // 1~5열
    const secondCells = filteredRow.slice(12, 19); // 13~19열
    const columnWidths = this.getConfig().columnWidths;

    const result: JSX.Element[] = [];

    // 1~5열 셀
    firstCells.forEach((cell, index) => {
      const actualIndex = index + 1;
      const isAscii = isAsciiOnly(String(cell));
      
      result.push(
        <View
          key={actualIndex}
          style={[
            styles.tableCell,
            {
              width: columnWidths[actualIndex],
              // 1, 2열을 제외하고 모두 우측 정렬
              alignItems: "flex-end",
              borderRightWidth: 1,
            },
          ]}
        >
          <Text style={isAscii ? styles.tableCellFont : styles.tableCellFontMultilang}>
            {cell}
          </Text>
        </View>
      );
    });

    // 13~19열 셀
    secondCells.forEach((cell, index) => {
      const actualIndex = index + 13;
      const isAscii = isAsciiOnly(String(cell));
      
      result.push(
        <View
          key={actualIndex}
          style={[
            styles.tableCell,
            {
              width: columnWidths[actualIndex],
              // 1, 2열을 제외하고 모두 우측 정렬
              alignItems: "flex-end",
              borderRightWidth: actualIndex === 19 ? 0 : 1,
            },
          ]}
        >
          <Text style={isAscii ? styles.tableCellFont : styles.tableCellFontMultilang}>
            {cell}
          </Text>
        </View>
      );
    });

    return result;
  }

  renderTable(data: TableData): JSX.Element[] {
    const result: JSX.Element[] = [];
    // 첫 번째 테이블: 1~12열 데이터로 모든 행 렌더링
    data.DATA?.forEach((row, index) => {
      result.push(
        <View key={`first-table-row-${index}`} style={styles.mainTableRow}>
          {this.renderFirstTableRow(row, index)}
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
    const firstTableHeader = this.renderFirstTableHeader(data);
    const secondTableHeader = this.renderSecondTableHeader(data);

    // ANGLE 정보 추출
    const tableArgument = data.tableArguments?.[0];
    const angle = tableArgument?.Argument?.ADDITIONAL?.SET_ANGLE?.ANGLE;
    const angleString =
      angle !== undefined ? `Angle: ${angle} [deg]` : undefined;
    const angleView = angleString ? (
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
    ) : null;

    const pages: JSX.Element[][] = [];

    // 첫 번째 테이블 페이지들 생성
    let currentPageRows: JSX.Element[] = [];
    let currentHeight = 0;
    let isFirstTableAngleInserted = false;

    const firstTableRows = allRows.filter((row) =>
      row.key?.includes("first-table-row")
    );
    firstTableRows.forEach((row, idx) => {
      const rowHeight = this.getRowHeight(data.DATA?.[idx] || [], idx, data);
      if (
        currentHeight + rowHeight > pageHeight &&
        currentPageRows.length > 0
      ) {
        pages.push([
          <View key={`first-table-${pages.length}`} style={styles.mainTable}>
            {currentPageRows}
          </View>,
        ]);
        currentPageRows = [];
        currentHeight = 0;
      }
      // 페이지의 첫 행에는 항상 헤더 추가
      if (currentHeight === 0 && firstTableHeader) {
        firstTableHeader.forEach((headerRow) => {
          currentPageRows.push(headerRow);
          currentHeight += Number(styles.tableHeaderQuadruple.height) || 60;
        });
      }
      // 첫 데이터 행 위에만 angle 삽입
      if (!isFirstTableAngleInserted && angleView) {
        currentPageRows.push(angleView);
        currentHeight += Number(styles.tableHeaderSingle.height) || 16;
        isFirstTableAngleInserted = true;
      }
      currentPageRows.push(row);
      currentHeight += rowHeight;
    });
    if (currentPageRows.length > 0) {
      pages.push([
        <View key={`first-table-${pages.length}`} style={styles.mainTable}>
          {currentPageRows}
        </View>,
      ]);
    }

    // 두 번째 테이블 페이지들 생성 (새 페이지에서 시작)
    currentPageRows = [];
    currentHeight = 0;
    let isSecondTableAngleInserted = false;
    data.DATA?.forEach((row, index) => {
      const rowHeight = this.getRowHeight(row, index, data);
      if (
        currentHeight + rowHeight > pageHeight &&
        currentPageRows.length > 0
      ) {
        pages.push([
          <View key={`second-table-${pages.length}`} style={styles.mainTable}>
            {currentPageRows}
          </View>,
        ]);
        currentPageRows = [];
        currentHeight = 0;
      }
      if (currentHeight === 0 && secondTableHeader) {
        secondTableHeader.forEach((headerRow) => {
          currentPageRows.push(headerRow);
          currentHeight += Number(styles.tableHeaderQuadruple.height) || 60;
        });
      }
      // 두 번째 테이블 첫 데이터 행 위에만 angle 삽입
      if (!isSecondTableAngleInserted && angleView) {
        currentPageRows.push(angleView);
        currentHeight += Number(styles.tableHeaderSingle.height) || 16;
        isSecondTableAngleInserted = true;
      }
      // 두 번째 테이블 행 (1~5, 13~19열)
      const secondTableRow = (
        <View key={`second-table-row-${index}`} style={styles.mainTableRow}>
          {this.renderSecondTableRow(row, index)}
        </View>
      );
      currentPageRows.push(secondTableRow);
      currentHeight += rowHeight;
    });
    if (currentPageRows.length > 0) {
      pages.push([
        <View key={`second-table-${pages.length}`} style={styles.mainTable}>
          {currentPageRows}
        </View>,
      ]);
    }
    return pages;
  }
}

export const overturningMomentTableRenderer =
  new OverturningMomentTableRenderer();
