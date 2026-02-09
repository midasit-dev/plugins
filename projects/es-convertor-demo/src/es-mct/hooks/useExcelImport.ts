import { useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useConverterDispatch } from '../context/ConverterContext';
import { ALL_TABS } from '../constants/tabs';
import type { TabId, TabData } from '../types';

/**
 * Excel Import 훅
 * input[type=file] → xlsx.read → 시트명 매칭 → 컬럼 범위로 분리 → dispatch
 */
export function useExcelImport() {
  const dispatch = useConverterDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerImport = useCallback(() => {
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xlsm,.xls';
      input.style.display = 'none';
      input.addEventListener('change', handleFile);
      document.body.appendChild(input);
      inputRef.current = input;
    }
    inputRef.current.value = '';
    inputRef.current.click();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: 'array' });
      const partialData: Partial<TabData> = {};

      for (const tabConfig of ALL_TABS) {
        const sheet = workbook.Sheets[tabConfig.sheetName];
        if (!sheet) continue;

        const { startRow, startCol, endCol } = tabConfig.readRange;
        const rows: string[][] = [];

        // 시트 범위 계산
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        const maxRow = range.e.r + 1; // 1-based

        for (let r = startRow; r <= maxRow; r++) {
          const row: string[] = [];
          let hasData = false;

          for (let c = startCol; c <= endCol; c++) {
            const addr = XLSX.utils.encode_cell({ r: r - 1, c: c - 1 }); // 0-based
            const cell = sheet[addr];
            const val = cell ? String(cell.v ?? '') : '';
            if (val !== '') hasData = true;
            row.push(val);
          }

          // 빈 행이면 건너뛰기
          if (!hasData) continue;
          rows.push(row);
        }

        partialData[tabConfig.id as TabId] = rows;
      }

      dispatch({ type: 'SET_ALL_TAB_DATA', data: partialData });
    };

    reader.readAsArrayBuffer(file);
  }, [dispatch]);

  return { triggerImport };
}
