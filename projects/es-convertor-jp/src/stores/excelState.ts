// Excel state management with Recoil

import { atom, selector } from 'recoil';
import { ParseResult } from '../parsers/ExcelParser';
import { SHEET_NAMES } from '../constants/sheetNames';

// Parsed Excel result
export const excelParseResultState = atom<ParseResult | null>({
  key: 'excelParseResult',
  default: null,
});

// Currently selected file
export const selectedFileState = atom<File | null>({
  key: 'selectedFile',
  default: null,
});

// File name
export const fileNameState = atom<string>({
  key: 'fileName',
  default: '',
});

// Loading state
export const isLoadingState = atom<boolean>({
  key: 'isLoading',
  default: false,
});

// Error message
export const errorMessageState = atom<string | null>({
  key: 'errorMessage',
  default: null,
});

// Available sheets selector
export const availableSheetsSelector = selector<string[]>({
  key: 'availableSheets',
  get: ({ get }) => {
    const parseResult = get(excelParseResultState);
    if (!parseResult) return [];
    return Array.from(parseResult.sheets.keys());
  },
});

// Check if required sheets exist
export const hasRequiredSheetsSelector = selector<boolean>({
  key: 'hasRequiredSheets',
  get: ({ get }) => {
    const parseResult = get(excelParseResultState);
    if (!parseResult) return false;
    return parseResult.sheets.has(SHEET_NAMES.NODE);
  },
});

// Sheet count selector
export const sheetCountSelector = selector<number>({
  key: 'sheetCount',
  get: ({ get }) => {
    const parseResult = get(excelParseResultState);
    if (!parseResult) return 0;
    return parseResult.sheets.size;
  },
});

// Node count selector
export const nodeCountSelector = selector<number>({
  key: 'nodeCount',
  get: ({ get }) => {
    const parseResult = get(excelParseResultState);
    if (!parseResult || !parseResult.sheets.has(SHEET_NAMES.NODE)) return 0;
    return parseResult.sheets.get(SHEET_NAMES.NODE)!.data.length;
  },
});

// Element count selector
export const elementCountSelector = selector<number>({
  key: 'elementCount',
  get: ({ get }) => {
    const parseResult = get(excelParseResultState);
    if (!parseResult) return 0;

    let count = 0;
    if (parseResult.sheets.has(SHEET_NAMES.FRAME)) {
      count += parseResult.sheets.get(SHEET_NAMES.FRAME)!.data.length;
    }
    if (parseResult.sheets.has(SHEET_NAMES.PLANE_ELEMENT)) {
      count += parseResult.sheets.get(SHEET_NAMES.PLANE_ELEMENT)!.data.length;
    }
    return count;
  },
});
