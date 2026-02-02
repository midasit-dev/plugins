// Excel Parser - parses ES Excel files using xlsx library

import * as XLSX from 'xlsx';
import { ESExcelData } from '../types/excel.types';
import { SHEET_NAMES, SHEET_CONFIGS } from '../constants/sheetNames';

export interface ParsedSheet {
  name: string;
  data: (string | number)[][];
}

export interface ParseResult {
  success: boolean;
  sheets: Map<string, ParsedSheet>;
  subTables: Map<string, (string | number)[][]>;  // Sub-table data by config key
  errors: string[];
  warnings: string[];
}

// Sub-table config keys that need separate parsing
const SUB_TABLE_CONFIGS: { sheetName: string; configKeys: string[] }[] = [
  {
    sheetName: SHEET_NAMES.HINGE_PROP,
    configKeys: ['HINGE_PROP_ZP', 'HINGE_PROP_YP'],
  },
  {
    sheetName: SHEET_NAMES.SPG_ALL_SYM,
    configKeys: ['SPG_ALL_SYM_LINEAR', 'SPG_ALL_SYM_BILINEAR', 'SPG_ALL_SYM_TRILINEAR', 'SPG_ALL_SYM_TETRALINEAR'],
  },
  {
    sheetName: SHEET_NAMES.SPG_ALL_ASYM,
    configKeys: ['SPG_ALL_ASYM_BILINEAR', 'SPG_ALL_ASYM_TRILINEAR', 'SPG_ALL_ASYM_TETRALINEAR'],
  },
  {
    sheetName: SHEET_NAMES.SPG_ALL_OTHER,
    configKeys: ['SPG_ALL_OTHER_NAGOYA', 'SPG_ALL_OTHER_BMR'],
  },
];

/**
 * Parse Excel file from File object
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sheets = new Map<string, ParsedSheet>();
  const subTables = new Map<string, (string | number)[][]>();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Parse each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = parseSheet(worksheet, sheetName);

      if (data.length > 0) {
        sheets.set(sheetName, { name: sheetName, data });
      }

      // Parse sub-tables for sheets that have them
      const subTableConfig = SUB_TABLE_CONFIGS.find(c => c.sheetName === sheetName);
      if (subTableConfig) {
        for (const configKey of subTableConfig.configKeys) {
          const subTableData = parseSheetWithConfig(worksheet, configKey);
          if (subTableData.length > 0) {
            subTables.set(configKey, subTableData);
          }
        }
      }
    }

    // Check for required sheets
    if (!sheets.has(SHEET_NAMES.NODE)) {
      warnings.push('節点座標シートが見つかりません');
    }

    return { success: true, sheets, subTables, errors, warnings };
  } catch (error) {
    errors.push(`Excelファイルの読み込みに失敗しました: ${error}`);
    return { success: false, sheets, subTables, errors, warnings };
  }
}

/**
 * Get cell value from worksheet using cell address
 * @param worksheet - XLSX worksheet
 * @param col - 1-indexed column number (1=A, 2=B, etc.)
 * @param row - 1-indexed row number
 */
function getCellValue(worksheet: XLSX.WorkSheet, col: number, row: number): string | number {
  const colLetter = XLSX.utils.encode_col(col - 1); // Convert to 0-indexed for encode_col
  const cellAddress = `${colLetter}${row}`;
  const cell = worksheet[cellAddress];
  if (!cell) return '';
  // Return value (v) or formatted text (w), prefer v for numbers
  return cell.v !== undefined ? cell.v : (cell.w || '');
}

/**
 * Parse worksheet data with given config parameters
 * Returns empty array if there are no data rows (only headers don't count)
 */
function parseWorksheetData(
  worksheet: XLSX.WorkSheet,
  startRow: number,
  startCol: number,
  endCol: number,
  headerRows: number
): (string | number)[][] {
  // Get worksheet range to determine max row
  const range = worksheet['!ref'];
  if (!range) return [];

  const decodedRange = XLSX.utils.decode_range(range);
  const maxRow = decodedRange.e.r + 1; // Convert to 1-indexed

  // Calculate row numbers (1-indexed for Excel)
  // Header starts at (startRow - headerRows)
  // Data starts at startRow
  const headerStartRow = startRow - headerRows;
  const dataStartRow = startRow;

  // First, collect data rows (skip if first column in range is empty)
  const dataRows: (string | number)[][] = [];
  for (let rowNum = dataStartRow; rowNum <= maxRow; rowNum++) {
    // Check if row has data (first column in range is not empty)
    const firstColValue = getCellValue(worksheet, startCol, rowNum);
    if (firstColValue === undefined || firstColValue === '') continue;

    // Extract columns in range
    const filteredRow: (string | number)[] = [];
    for (let colNum = startCol; colNum <= endCol; colNum++) {
      filteredRow.push(getCellValue(worksheet, colNum, rowNum));
    }
    dataRows.push(filteredRow);
  }

  // If no data rows, return empty array (don't include headers only)
  if (dataRows.length === 0) {
    return [];
  }

  // Build result: headers + data
  const filteredData: (string | number)[][] = [];

  // Add header rows
  for (let rowNum = headerStartRow; rowNum < dataStartRow && rowNum <= maxRow; rowNum++) {
    const filteredRow: (string | number)[] = [];
    for (let colNum = startCol; colNum <= endCol; colNum++) {
      filteredRow.push(getCellValue(worksheet, colNum, rowNum));
    }
    filteredData.push(filteredRow);
  }

  // Add data rows
  filteredData.push(...dataRows);

  return filteredData;
}

/**
 * Parse a single worksheet using its sheet name to find config
 */
function parseSheet(worksheet: XLSX.WorkSheet, sheetName: string): (string | number)[][] {
  // Get sheet config if available
  const configKey = Object.keys(SHEET_CONFIGS).find(
    key => SHEET_CONFIGS[key].name === sheetName
  );
  const config = configKey ? SHEET_CONFIGS[configKey] : null;

  const startRow = config?.startRow || 3;
  const startCol = config?.startCol || 2;
  const endCol = config?.endCol || 30;
  const headerRows = config?.headerRows || 1;

  return parseWorksheetData(worksheet, startRow, startCol, endCol, headerRows);
}

/**
 * Parse a worksheet using a specific config key (for sub-tables)
 */
function parseSheetWithConfig(worksheet: XLSX.WorkSheet, configKey: string): (string | number)[][] {
  const config = SHEET_CONFIGS[configKey];
  if (!config) return [];

  const startRow = config.startRow || 3;
  const startCol = config.startCol || 2;
  const endCol = config.endCol || 30;
  const headerRows = config.headerRows || 1;

  return parseWorksheetData(worksheet, startRow, startCol, endCol, headerRows);
}

/**
 * Get sheet data by name (includes header rows for display)
 */
export function getSheetData(
  sheets: Map<string, ParsedSheet>,
  sheetName: string
): (string | number)[][] {
  const sheet = sheets.get(sheetName);
  return sheet?.data || [];
}

/**
 * Get sheet data for conversion
 * Note: Header rows are already skipped during parsing (parseWorksheetData)
 * and UI data from App.tsx also doesn't include headers
 */
export function getSheetDataForConversion(
  sheets: Map<string, ParsedSheet>,
  sheetName: string
): (string | number)[][] {
  const sheet = sheets.get(sheetName);
  if (!sheet) return [];

  // Return data directly - headers are already excluded
  // (Excel parsing skips headers, UI data doesn't include headers)
  return sheet.data;
}

/**
 * Check if sheet exists
 */
export function hasSheet(sheets: Map<string, ParsedSheet>, sheetName: string): boolean {
  return sheets.has(sheetName);
}

/**
 * Get all available sheet names
 */
export function getSheetNames(sheets: Map<string, ParsedSheet>): string[] {
  return Array.from(sheets.keys());
}

/**
 * Parse Excel file and return structured ES data
 */
export async function parseESExcelFile(file: File): Promise<{
  success: boolean;
  parseResult: ParseResult;
  esData: Partial<ESExcelData> | null;
}> {
  const parseResult = await parseExcelFile(file);

  if (!parseResult.success) {
    return { success: false, parseResult, esData: null };
  }

  // Create partial ES data structure
  const esData: Partial<ESExcelData> = {
    nodes: [],
    frames: [],
    planeElements: [],
    rigidElements: [],
    materials: [],
    sections: [],
    sectionElements: [],
    plnSections: [],
    hingeProperties: [],
    hingeAssigns: [],
    springElements: [],
    springProperties: [],
    fulcrums: [],
    fulcrumDetails: [],
    nodalMasses: [],
    loadCases: [],
    concentratedLoads: [],
    supportDisplacements: [],
    beamLoads: [],
    temperatureLoads: [],
    internalForces: [],
  };

  return { success: true, parseResult, esData };
}

/**
 * Download data as Excel file
 */
export function downloadAsExcel(data: any[][], filename: string = 'output.xlsx'): void {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}
