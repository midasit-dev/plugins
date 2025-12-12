import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";

class StoryShearForceRatioTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: false, // 세로 모드
      columnWidths: {
        1: "8%", // Story
        2: "9%", // Level
        3: "9%", // Load
        4: "12%", // Type
        5: "8%", // No
        6: "9%", // Angle 1
        7: "9%", // Force 1
        8: "9%", // Ratio 1
        9: "9%", // Angle 2
        10: "9%", // Force 2
        11: "9%", // Ratio 2
      },
      styles,
      repeatHeader: true, // 페이지마다 헤더 반복
      pageHeight: 562, // 세로모드: 562pt
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
                styles.tableHeaderDouble,
                {
                  width: columnWidths[actualIndex],
                  borderRightWidth: actualIndex === 11 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{header}</Text>
              {actualIndex === 2 && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + dist + ")"}
                </Text>
              )}
              {(actualIndex === 7 || actualIndex === 10) && (
                <Text style={styles.tableHeaderSubFont}>
                  {"(" + force + ")"}
                </Text>
              )}
              {(actualIndex === 6 || actualIndex === 9) && (
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
                // 1열, 3열, 4열은 중앙 정렬, 나머지는 우측 정렬
                alignItems:
                  actualIndex === 1 || actualIndex === 3 || actualIndex === 4
                    ? "center"
                    : "flex-end",
                borderRightWidth: actualIndex === 11 ? 0 : 1,
              },
            ]}
          >
            <Text style={styles.tableCellFont}>{cell}</Text>
          </View>
        );
      });
  }

  // SUB_TABLES 데이터 렌더링 (첫 번째 인덱스 무시하지 않음)
  private renderSubTableRow(row: any[], rowIndex: number): JSX.Element[] {
    return row.map((cell, index) => {
      const actualIndex = index + 1;
      return (
        <View
          key={actualIndex}
          style={[
            styles.tableCell,
            {
              width: this.getConfig().columnWidths[actualIndex],
              // 1열, 3열, 4열은 중앙 정렬, 나머지는 우측 정렬
              alignItems:
                actualIndex === 1 || actualIndex === 3 || actualIndex === 4
                  ? "center"
                  : "flex-end",
              borderRightWidth: actualIndex === 11 ? 0 : 1,
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

    // argument 값 가져와서 작업할 공간 (본문 시작점)
    const tableArgument = data.tableArguments?.[0];
    if (tableArgument?.Argument?.ADDITIONAL) {
      const angle = tableArgument.Argument.ADDITIONAL.SET_ANGLE?.ANGLE;
      const additionalString = `Angle for static load case result: ${angle} [deg]`;

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

    // SUB_TABLES 데이터 처리
    if (data.SUB_TABLES) {
      data.SUB_TABLES.forEach((subTableObj, subTableIndex) => {
        const subTableName = Object.keys(subTableObj)[0];
        const subTable = subTableObj[subTableName];

        if (subTable && subTable.DATA) {
          // 제목 행 추가
          result.push(
            <View key={`subtitle-${subTableIndex}`} style={styles.mainTableRow}>
              <View
                style={[
                  styles.tableHeaderSingle,
                  {
                    width: "100%",
                    borderRightWidth: 0,
                  },
                ]}
              >
                <Text style={styles.tableHeaderFont}>{subTableName}</Text>
              </View>
            </View>
          );

          // SUB_TABLES의 DATA 렌더링 (첫 번째 인덱스 무시하지 않음)
          subTable.DATA.forEach((row, rowIndex) => {
            result.push(
              <View
                key={`subrow-${subTableIndex}-${rowIndex}`}
                style={styles.mainTableRow}
              >
                {this.renderSubTableRow(row, rowIndex)}
              </View>
            );
          });
        }
      });
    }

    return result;
  }

  getRowHeight(row: any, rowIndex: number, data: TableData): number {
    // SUB_TABLES 제목 행인 경우
    if (row[0]?.type === "subtitle") {
      return Number(styles.tableHeaderSingle.height) || 16;
    }
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

export const storyShearForceRatioTableRenderer =
  new StoryShearForceRatioTableRenderer();
