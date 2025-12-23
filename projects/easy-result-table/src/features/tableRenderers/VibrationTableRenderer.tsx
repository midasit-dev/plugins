import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { TableData } from "../states/stateTableData";
import { TableRenderer, TableRenderConfig, styles } from "./types";
import { isAsciiOnly } from "./textUtils";

type VibRow =
  | { rowType: "title"; subTableName: string; cells: any[] }
  | { rowType: "data"; subTableName: string; cells: any[] };

class VibrationTableRenderer implements TableRenderer {
  getConfig(): TableRenderConfig {
    return {
      isLandscape: true,
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
      repeatHeader: true,
      pageHeight: 335,
    };
  }

  // ====== ✅ width list 보정 유틸 (합이 100% 미만이면 filler 추가) ======
  private normalizeWidths(widths: string[], targetTotal = 100): string[] {
    const nums = widths.map((w) => parseFloat(String(w).replace("%", "")) || 0);
    const sum = nums.reduce((a, b) => a + b, 0);

    // 부동소수 오차 감안
    const EPS = 0.001;

    if (sum >= targetTotal - EPS) {
      return widths;
    }

    const filler = +(targetTotal - sum).toFixed(3);
    // 0이면 추가 안 함
    if (filler <= EPS) return widths;

    return [...widths, `${filler}%`];
  }

  // ====== ✅ 헤더 렌더: widths.length만큼 강제 렌더 + filler는 빈칸 ======
  private renderHeaderRow(head: any[], widthsRaw: string[], rowKey: string): JSX.Element {
    const widths = this.normalizeWidths(widthsRaw);
    const renderCount = widths.length;

    return (
      <View key={`subtable-header-row-${rowKey}`} style={styles.mainTableRow}>
        {Array.from({ length: renderCount }, (_, i) => {
          // head에 값이 없으면 filler 칸 -> 빈 텍스트
          const raw = head?.[i]?.cell ?? head?.[i] ?? "";
          const text = String(raw ?? "");

          // 기존 2줄 분리 로직 유지
          let firstLine = "";
          let secondLine = "";
          if (i === 0) {
            firstLine = text.slice(0, 4);
            secondLine = text.slice(4);
          } else {
            firstLine = text.slice(0, 6);
            secondLine = text.slice(6);
          }

          return (
            <View
              key={`h-${rowKey}-${i}`}
              style={[
                styles.tableHeaderDouble,
                {
                  width: widths[i] ?? this.getConfig().columnWidths[i + 1] ?? "8%",
                  borderRightWidth: i === renderCount - 1 ? 0 : 1,
                  borderRightColor: "#000",
                },
              ]}
            >
              <Text style={styles.tableHeaderFont}>{firstLine}</Text>
              <Text style={styles.tableHeaderSubFont}>{secondLine}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  private renderTitleRow(subTableName: string): JSX.Element {
    let title = subTableName;
    if (subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (1)") {
      title = "MODAL PARTICIPATION MASSES PRINTOUT - PERCENTAGE";
    } else if (subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (2)") {
      title = "MODAL PARTICIPATION MASSES PRINTOUT - ABSOLUTE VALUE";
    }

    return (
      <View key={`title-${subTableName}`} style={styles.mainTableRow}>
        <View style={[styles.tableHeaderSingle, { width: "100%", borderRightWidth: 0 }]}>
          <Text style={styles.tableHeaderFont}>{title}</Text>
        </View>
      </View>
    );
  }

  // ====== ✅ 데이터 렌더: widths 보정 + filler는 빈칸 ======
  private renderDataRow(cells: any[], widthsRaw: string[], rowKey: string): JSX.Element {
    const widths = this.normalizeWidths(widthsRaw);
    const renderCount = widths.length;

    return (
      <View key={`data-row-${rowKey}`} style={styles.mainTableRow}>
        {Array.from({ length: renderCount }, (_, i) => {
          let value = cells?.[i]?.cell ?? cells?.[i] ?? "";

          // filler 칸이면 데이터가 없음 -> 빈칸 유지
          // (value가 ""인 경우 그대로 둠)

          if (i === 0) {
            const n = parseInt(value, 10);
            if (!Number.isNaN(n)) value = n;
          }

          const isAscii = isAsciiOnly(String(value));

          return (
            <View
              key={`d-${rowKey}-${i}`}
              style={[
                styles.tableCell,
                {
                  width: widths[i] ?? this.getConfig().columnWidths[i + 1] ?? "8%",
                  borderRightWidth: i === renderCount - 1 ? 0 : 1,
                  borderRightColor: "#000",
                  alignItems: i > 0 ? "flex-end" : "center",
                },
              ]}
            >
              <Text style={isAscii ? styles.tableCellFont : styles.tableCellFontMultilang}>
                {String(value ?? "")}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  // ====== ✅ 여기만 “원본 widths” 정의, normalize는 렌더러에서 자동 처리 ======
  private isModalParticipationFactor(subTableName: string) {
    return subTableName.startsWith("MODAL PARTICIPATION FACTOR PRINTOUT");
  }

  private isModalDirectionFactor(subTableName: string) {
    return subTableName === "MODAL DIRECTION FACTOR PRINTOUT";
  }

  private getWidthsBySubtable(subTableName: string): string[] {
    if (
      subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (1)" ||
      subTableName === "MODAL PARTICIPATION MASSES PRINTOUT (2)"
    ) {
      return [
        "6.4%",
        "7.8%","7.8%","7.8%","7.8%","7.8%","7.8%",
        "7.8%","7.8%","7.8%","7.8%","7.8%","7.8%",
      ]; // ✅ 합이 100%가 아닐 수도 있지만 자동 보정됨
    }

    if (this.isModalParticipationFactor(subTableName) || this.isModalDirectionFactor(subTableName)) {
      return ["6.4%", "15.6%","15.6%","15.6%","15.6%","15.6%","15.6%"];
    }

    if (subTableName === "EIGENVALUE ANALYSIS") {
      // ✅ 요청하신 것처럼 31.2를 직접 넣는 방식도 가능하지만,
      // 지금은 normalizeWidths가 자동으로 filler를 넣어줍니다.
      // 원본을 그대로 두면 ["6.4 + 15.6*4 = 68.8"] -> filler 31.2가 자동 추가됩니다.
      return ["6.4%", "15.6%","15.6%","15.6%","15.6%"];
    }

    const cw = this.getConfig().columnWidths;
    const max = Math.max(...Object.keys(cw).map(Number));
    return Array.from({ length: max }, (_, i) => cw[i + 1] ?? "8%");
  }

  private combineAllSubTablesData(data: TableData): VibRow[] {
    const all: VibRow[] = [];
    if (!data.SUB_TABLES?.length) return all;

    data.SUB_TABLES.forEach((subTableObj) => {
      const subTableName = Object.keys(subTableObj)[0];
      const subTable = subTableObj[subTableName];
      if (!subTable || !subTable.HEAD || !subTable.DATA) return;

      all.push({ rowType: "title", subTableName, cells: [] });

      subTable.DATA.forEach((row: any[]) => {
        all.push({
          rowType: "data",
          subTableName,
          cells: row.map((cell) => ({ cell })),
        });
      });
    });

    return all;
  }

  renderTable(data: TableData): JSX.Element[] {
    return [];
  }

  getRowHeight(row: any, rowIndex: number, data: TableData): number {
    return Number(styles.tableCell.height) || 11;
  }

  getPages(data: TableData): JSX.Element[][] {
    const config = this.getConfig();
    const pageHeight = config.pageHeight!;
    const rows = this.combineAllSubTablesData(data);

    const headMap = new Map<string, any[]>();
    data.SUB_TABLES?.forEach((subTableObj) => {
      const name = Object.keys(subTableObj)[0];
      const subTable = subTableObj[name];
      if (subTable?.HEAD) headMap.set(name, subTable.HEAD);
    });

    const pages: JSX.Element[][] = [];
    let currentPage: JSX.Element[] = [];
    let currentHeight = 0;

    let currentSubtableName: string | null = null;

    const pushPage = () => {
      if (currentPage.length === 0) return;
      pages.push([
        <View key={`table-${pages.length}`} style={styles.mainTable}>
          {currentPage}
        </View>,
      ]);
      currentPage = [];
      currentHeight = 0;
    };

    const ensureHeaderOnNewPage = (subTableName: string, keySeed: string) => {
      const head = headMap.get(subTableName);
      if (!head) return;

      const widths = this.getWidthsBySubtable(subTableName); // 원본 widths
      const headerRow = this.renderHeaderRow(head, widths, keySeed); // 내부에서 normalize 처리

      currentPage.push(headerRow);
      currentHeight += Number(styles.tableHeaderDouble.height) || 24;
    };

    rows.forEach((r, idx) => {
      const isNewSubtable = r.subTableName !== currentSubtableName;

      if (isNewSubtable) {
        currentSubtableName = r.subTableName;

        const titleRow = this.renderTitleRow(r.subTableName);
        const titleH = Number(styles.tableHeaderSingle.height) || 16;

        if (currentHeight + titleH > pageHeight && currentPage.length > 0) {
          pushPage();
        }

        currentPage.push(titleRow);
        currentHeight += titleH;

        ensureHeaderOnNewPage(r.subTableName, `${r.subTableName}-hdr-p${pages.length}-i${idx}`);
      }

      if (r.rowType === "data") {
        const widths = this.getWidthsBySubtable(r.subTableName);
        const rowH = Number(styles.tableCell.height) || 11;

        if (currentHeight + rowH > pageHeight && currentPage.length > 0) {
          pushPage();
          ensureHeaderOnNewPage(r.subTableName, `${r.subTableName}-hdr-p${pages.length}-i${idx}`);
        }

        const dataRow = this.renderDataRow(r.cells, widths, `${r.subTableName}-row-${idx}`);
        currentPage.push(dataRow);
        currentHeight += rowH;
      }
    });

    pushPage();
    return pages;
  }
}

export const vibrationTableRenderer = new VibrationTableRenderer();
