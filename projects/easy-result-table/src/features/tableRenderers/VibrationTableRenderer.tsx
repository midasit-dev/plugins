import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { truncateText, calculateMaxChars } from "./textUtils";

class VibrationTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true, // 가로 모드
      columnWidths: {
        1: "8%",
        2: "8%",
        3: "8%",
        4: "8%",
        5: "8%",
        6: "8%",
        7: "8%",
        8: "8%",
        9: "8%",
        10: "8%",
        11: "8%",
        12: "8%",
        13: "8%",
      },
      styles,
      repeatHeader: false, // 공통 헤더 없음
      pageHeight: 335, // 가로모드: 315pt
    };
  }

  renderTable(data: TableData): JSX.Element[] {
    // SUB_TABLES의 모든 데이터를 합친 전체 데이터 생성
    const allData = this.combineAllSubTablesData(data);

    const result: JSX.Element[] = [];

    // 각 행을 개별적으로 렌더링
    allData.forEach((row, index) => {
      result.push(
        <View key={`row-${index}`} style={styles.mainTableRow}>
          {this.renderCombinedRow(row, index, data)}
        </View>
      );
    });

    return result;
  }

  // 모든 SUB_TABLES 데이터를 합치는 메서드
  private combineAllSubTablesData(data: TableData): any[][] {
    const allData: any[][] = [];

    if (!data.SUB_TABLES?.length) {
      console.warn("No SUB_TABLES found in data");
      return allData;
    }

    // 각 SUB_TABLE을 순서대로 처리
    data.SUB_TABLES.forEach((subTableObj, subTableIndex) => {
      const subTableName = Object.keys(subTableObj)[0];
      const subTable = subTableObj[subTableName];

      if (!subTable || !subTable.HEAD || !subTable.DATA) {
        console.warn(`Skipping invalid subtable: ${subTableName}`, subTable);
        return;
      }

      // 테이블 제목 행 추가
      allData.push([
        {
          type: "subtable_title",
          text: subTableName,
          subTableIndex,
          subTableName,
        },
      ]);

      // 헤더 행 추가
      allData.push(subTable.HEAD.map((cell) => ({ cell, subTableName })));

      // 데이터 행들 추가
      allData.push(
        ...subTable.DATA.map((row) =>
          row.map((cell) => ({ cell, subTableName }))
        )
      );
    });

    return allData;
  }

  // 모든 행을 구분하여 렌더링하는 메서드
  private renderCombinedRow(
    row: any[],
    rowIndex: number,
    originalData: TableData
  ): JSX.Element[] {
    // SUB_TABLE 제목 행인 경우
    if (row[0]?.type === "subtable_title") {
      let title = row[0].text;
      if (row[0].subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (1)") {
        title = "MODAL PARTICIPATION MASSES PRINTOUT - PERCENTAGE";
      } else if (
        row[0].subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (2)"
      ) {
        title = "MODAL PARTICIPATION MASSES PRINTOUT - ABSOLUTE VALUE";
      }
      return [
        <View
          key="subtable-title"
          style={[
            styles.tableHeaderSingle,
            {
              width: "100%",
              borderRightWidth: 0,
            },
          ]}
        >
          <Text style={styles.tableHeaderFont}>{title}</Text>
        </View>,
      ];
    }

    // 헤더 행인지 확인
    const isHeaderRow = this.isHeaderRow(rowIndex, originalData);
    const subTableName = row[0]?.subTableName || row[0]?.text;

    // MODAL PARTICIPATION MASSES PRINTOUT (1)(2) 테이블 특별 처리
    if (
      subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (1)" ||
      subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (2)"
    ) {
      // 8열, 폭: 6.4%, 7.8% * 7
      const widths = [
        "6.4%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
        "7.8%",
      ];
      // 제목 행
      if (row[0]?.type === "subtable_title") {
        return [
          <View
            key="subtable-title"
            style={[
              styles.tableHeaderSingle,
              {
                width: "100%",
                borderRightWidth: 0,
              },
            ]}
          >
            <Text style={styles.tableHeaderFont}>{row[0].text}</Text>
          </View>,
        ];
      }
      // 헤더 행(2줄)
      if (isHeaderRow) {
        // 모든 열: 첫 번째 열은 4글자, 나머지는 6글자 기준 2줄로 분리
        return row.map((cellObj: any, cellIndex: number) => {
          const value = cellObj.cell ?? cellObj;
          let firstLine = "";
          let secondLine = "";
          if (typeof value === "string") {
            if (cellIndex === 0) {
              firstLine = value.slice(0, 4);
              secondLine = value.slice(4);
            } else {
              firstLine = value.slice(0, 6);
              secondLine = value.slice(6);
            }
          } else {
            firstLine = value;
            secondLine = "";
          }
          return (
            <View
              key={cellIndex}
              style={[
                styles.tableHeaderDouble,
                {
                  width: widths[cellIndex],
                  borderRightWidth: cellIndex === row.length - 1 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{firstLine}</Text>
              <Text style={styles.tableHeaderSubFont}>{secondLine}</Text>
            </View>
          );
        });
      }
      // 데이터 행: 첫 번째 열 정수, 나머지 그대로
      return row.map((cellObj: any, cellIndex: number) => {
        let value = cellObj.cell ?? cellObj;
        if (cellIndex === 0) value = parseInt(value, 10);
        return (
          <View
            key={cellIndex}
            style={[
              styles.tableCell,
              {
                width: widths[cellIndex],
                borderRightWidth: cellIndex === row.length - 1 ? 0 : 1,
                alignItems: cellIndex > 0 ? "flex-end" : "center",
              },
            ]}
          >
            <Text style={styles.tableCellFont}>{value}</Text>
          </View>
        );
      });
    }

    // MODAL PARTICIPATION FACTOR PRINTOUT (kN,m) 테이블 특별 처리
    if (
      subTableName === "MODAL PARTICIPATION FACTOR PRINTOUT (kN,m)" ||
      subTableName === "MODAL DIRECTION FACTOR PRINTOUT"
    ) {
      // 7열, 폭: 6.4%, 15.6% * 6
      const widths = [
        "6.4%",
        "15.6%",
        "15.6%",
        "15.6%",
        "15.6%",
        "15.6%",
        "15.6%",
      ];
      // 제목 행
      if (row[0]?.type === "subtable_title") {
        return [
          <View
            key="subtable-title"
            style={[
              styles.tableHeaderSingle,
              {
                width: "100%",
                borderRightWidth: 0,
              },
            ]}
          >
            <Text style={styles.tableHeaderFont}>{row[0].text}</Text>
          </View>,
        ];
      }
      // 헤더 행(2줄)
      if (isHeaderRow) {
        return row.map((cellObj: any, cellIndex: number) => {
          const value = cellObj.cell ?? cellObj;
          let firstLine = "";
          let secondLine = "";
          if (typeof value === "string") {
            if (cellIndex === 0) {
              firstLine = value.slice(0, 4);
              secondLine = value.slice(4);
            } else {
              firstLine = value.slice(0, 6);
              secondLine = value.slice(6);
            }
          } else {
            firstLine = value;
            secondLine = "";
          }
          return (
            <View
              key={cellIndex}
              style={[
                styles.tableHeaderDouble,
                {
                  width: widths[cellIndex],
                  borderRightWidth: cellIndex === row.length - 1 ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{firstLine}</Text>
              <Text style={styles.tableHeaderSubFont}>{secondLine}</Text>
            </View>
          );
        });
      }
      // 데이터 행: 첫 번째 열 정수, 나머지는 그대로
      return row.map((cellObj: any, cellIndex: number) => {
        let value = cellObj.cell ?? cellObj;
        if (cellIndex === 0) value = parseInt(value, 10);
        return (
          <View
            key={cellIndex}
            style={[
              styles.tableCell,
              {
                width: widths[cellIndex],
                borderRightWidth: cellIndex === row.length - 1 ? 0 : 1,
                alignItems: cellIndex > 0 ? "flex-end" : "center",
              },
            ]}
          >
            <Text style={styles.tableCellFont}>{value}</Text>
          </View>
        );
      });
    }

    // EIGENVALUE ANALYSIS 테이블 특별 처리
    if (subTableName === "EIGENVALUE ANALYSIS") {
      // 5열, 폭: 6.4%, 15.6%, 15.6%, 15.6%, 15.6%
      const widths = ["6.4%", "15.6%", "15.6%", "15.6%", "15.6%"];
      // 헤더 행
      if (isHeaderRow) {
        return row.map((cellObj: any, cellIndex: number) => {
          const value = cellObj.cell ?? cellObj;
          let firstLine = "";
          let secondLine = "";
          if (typeof value === "string") {
            if (cellIndex === 0) {
              firstLine = value.slice(0, 4);
              secondLine = value.slice(4);
            } else if (value.includes("(")) {
              const idx = value.indexOf("(");
              // 괄호 앞에 공백이 있으면 제거
              let before = value.slice(0, idx).replace(/\s+$/, "");
              let after = value.slice(idx);
              firstLine = before;
              secondLine = after;
            } else {
              firstLine = value;
              secondLine = "";
            }
          } else {
            firstLine = value;
            secondLine = "";
          }
          return (
            <View
              key={cellIndex}
              style={[
                styles.tableHeaderDouble,
                {
                  width: widths[cellIndex] || "16%",
                  borderRightWidth: 1,
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{firstLine}</Text>
              <Text style={styles.tableHeaderSubFont}>{secondLine}</Text>
            </View>
          );
        });
      }
      // 데이터 행(헤더가 아님)이고 첫 번째 열이면 정수로 변환
      return row.map((cellObj: any, cellIndex: number) => {
        let value = cellObj.cell ?? cellObj;
        if (!isHeaderRow && cellIndex === 0) {
          value = parseInt(value, 10);
        }
        return (
          <View
            key={cellIndex}
            style={[
              styles.tableCell,
              {
                width: widths[cellIndex] || "16%",
                borderRightWidth: 1,
                alignItems: cellIndex > 0 ? "flex-end" : "center",
              },
            ]}
          >
            <Text
              style={
                isHeaderRow ? styles.tableHeaderFont : styles.tableCellFont
              }
            >
              {value}
            </Text>
          </View>
        );
      });
    }

    // 기본 렌더링 (다른 서브테이블에 공통 적용)
    return row.map((cellObj: any, cellIndex: number) => {
      const value = cellObj.cell ?? cellObj;

      return (
        <View
          key={cellIndex}
          style={[
            isHeaderRow ? styles.tableHeaderDouble : styles.tableCell,
            isHeaderRow
              ? {
                  width: this.getConfig().columnWidths[cellIndex + 1] || "8%",
                  borderRightWidth: cellIndex === row.length - 1 ? 0 : 1,
                }
              : {
                  width: this.getConfig().columnWidths[cellIndex + 1] || "8%",
                  borderRightWidth: cellIndex === row.length - 1 ? 0 : 1,
                  alignItems: cellIndex > 0 ? "flex-end" : "center",
                },
          ]}
        >
          <Text
            style={isHeaderRow ? styles.tableHeaderFont : styles.tableCellFont}
          >
            {value}
          </Text>
        </View>
      );
    });
  }

  // 헤더 행인지 확인하는 메서드
  private isHeaderRow(rowIndex: number, originalData: TableData): boolean {
    if (!originalData.SUB_TABLES?.length) {
      return false;
    }

    let currentRowIndex = 0;

    for (const subTableObj of originalData.SUB_TABLES) {
      const subTableName = Object.keys(subTableObj)[0];
      const subTable = subTableObj[subTableName];

      if (!subTable || !subTable.HEAD || !subTable.DATA) {
        continue;
      }

      // 제목 행
      currentRowIndex++;

      // 헤더 행
      if (rowIndex === currentRowIndex) {
        return true;
      }
      currentRowIndex++;

      // 데이터 행들
      currentRowIndex += subTable.DATA.length;
    }

    return false;
  }

  getRowHeight(row: any, rowIndex: number, data: TableData): number {
    return Number(styles.tableCell.height) || 11;
  }

  getPages(data: TableData): JSX.Element[][] {
    const config = this.getConfig();
    const pageHeight = config.pageHeight!;
    const allRows = this.renderTable(data);

    // 페이지 분할 로직
    const pages: JSX.Element[][] = [];
    let currentPageRows: JSX.Element[] = [];
    let currentHeight = 0;

    allRows.forEach((row, idx) => {
      const rowHeight = this.getRowHeight(data.DATA?.[idx] || [], idx, data);
      if (
        currentHeight + rowHeight > pageHeight &&
        currentPageRows.length > 0
      ) {
        pages.push([
          <View key={`table-${pages.length}`} style={styles.mainTable}>
            {currentPageRows}
          </View>,
        ]);
        currentPageRows = [];
        currentHeight = 0;
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

export const vibrationTableRenderer = new VibrationTableRenderer();
