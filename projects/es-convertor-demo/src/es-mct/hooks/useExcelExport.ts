import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useConverterState } from '../context/ConverterContext';
import { ALL_TABS } from '../constants/tabs';

/**
 * Excel Export 훅
 * Context 데이터 → xlsx.writeFile
 */
export function useExcelExport() {
  const { tabData } = useConverterState();

  const triggerExport = useCallback(() => {
    const workbook = XLSX.utils.book_new();

    // 시트명 중복 방지를 위한 추적
    const addedSheets = new Set<string>();

    for (const tabConfig of ALL_TABS) {
      const data = tabData[tabConfig.id];
      if (!data || data.length === 0) continue;

      // 같은 시트에 여러 탭이 있는 경우 (예: hinge_zp, hinge_yp → 같은 시트)
      // 첫 번째 탭만 시트를 만들고, 다른 탭은 해당 시트에 추가
      if (addedSheets.has(tabConfig.sheetName)) {
        // 기존 시트에 컬럼 범위로 삽입
        const sheet = workbook.Sheets[tabConfig.sheetName];
        if (!sheet) continue;

        const { startRow, startCol } = tabConfig.readRange;
        data.forEach((row, ri) => {
          row.forEach((cell, ci) => {
            const addr = XLSX.utils.encode_cell({ r: startRow - 1 + ri, c: startCol - 1 + ci });
            sheet[addr] = { v: cell, t: 's' };
          });
        });

        // 시트 범위 업데이트
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        const newEndRow = startRow - 1 + data.length - 1;
        const newEndCol = tabConfig.readRange.endCol - 1;
        if (newEndRow > range.e.r) range.e.r = newEndRow;
        if (newEndCol > range.e.c) range.e.c = newEndCol;
        sheet['!ref'] = XLSX.utils.encode_range(range);
        continue;
      }

      // 새 시트 생성
      const aoa: (string | undefined)[][] = [];
      const { startRow, startCol } = tabConfig.readRange;

      // startRow 이전의 빈 행 채우기
      for (let r = 0; r < startRow - 1; r++) {
        aoa.push([]);
      }

      data.forEach((row) => {
        const sheetRow: (string | undefined)[] = [];
        // startCol 이전의 빈 셀 채우기
        for (let c = 0; c < startCol - 1; c++) {
          sheetRow.push(undefined);
        }
        sheetRow.push(...row);
        aoa.push(sheetRow);
      });

      const sheet = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(workbook, sheet, tabConfig.sheetName);
      addedSheets.add(tabConfig.sheetName);
    }

    XLSX.writeFile(workbook, 'ES_Data_Export.xlsx');
  }, [tabData]);

  return { triggerExport };
}
