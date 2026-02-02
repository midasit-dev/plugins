// Excel Exporter - exports data to ES Excel format using xlsx library

import * as XLSX from 'xlsx';
import { SHEET_NAMES, SHEET_CONFIGS } from '../constants/sheetNames';

export interface ExportSheetData {
  configKey: string;
  data: (string | number)[][];
}

// Sub-table mapping: which config keys belong to which sheet
const SUB_TABLE_SHEETS: Record<string, string[]> = {
  [SHEET_NAMES.HINGE_PROP]: ['HINGE_PROP_ZP', 'HINGE_PROP_YP'],
  [SHEET_NAMES.SPG_ALL_SYM]: ['SPG_ALL_SYM_LINEAR', 'SPG_ALL_SYM_BILINEAR', 'SPG_ALL_SYM_TRILINEAR', 'SPG_ALL_SYM_TETRALINEAR'],
  [SHEET_NAMES.SPG_ALL_ASYM]: ['SPG_ALL_ASYM_BILINEAR', 'SPG_ALL_ASYM_TRILINEAR', 'SPG_ALL_ASYM_TETRALINEAR'],
  [SHEET_NAMES.SPG_ALL_OTHER]: ['SPG_ALL_OTHER_NAGOYA', 'SPG_ALL_OTHER_BMR'],
};

// Config key to sheet name mapping
const CONFIG_TO_SHEET: Record<string, string> = {
  NODE: SHEET_NAMES.NODE,
  FRAME: SHEET_NAMES.FRAME,
  PLANE_ELEMENT: SHEET_NAMES.PLANE_ELEMENT,
  RIGID: SHEET_NAMES.RIGID,
  MATERIAL: SHEET_NAMES.MATERIAL,
  NUMB_SECT: SHEET_NAMES.NUMB_SECT,
  SECT_ELEM: SHEET_NAMES.SECT_ELEM,
  SECT: SHEET_NAMES.SECT,
  PLN_SECT: SHEET_NAMES.PLN_SECT,
  HINGE_PROP: SHEET_NAMES.HINGE_PROP,
  HINGE_PROP_ZP: SHEET_NAMES.HINGE_PROP,
  HINGE_PROP_YP: SHEET_NAMES.HINGE_PROP,
  HINGE_ASS: SHEET_NAMES.HINGE_ASS,
  ELEM_SPRING: SHEET_NAMES.ELEM_SPRING,
  SPG_6COMP: SHEET_NAMES.SPG_6COMP,
  SPG_ALL_SYM: SHEET_NAMES.SPG_ALL_SYM,
  SPG_ALL_SYM_LINEAR: SHEET_NAMES.SPG_ALL_SYM,
  SPG_ALL_SYM_BILINEAR: SHEET_NAMES.SPG_ALL_SYM,
  SPG_ALL_SYM_TRILINEAR: SHEET_NAMES.SPG_ALL_SYM,
  SPG_ALL_SYM_TETRALINEAR: SHEET_NAMES.SPG_ALL_SYM,
  SPG_ALL_ASYM: SHEET_NAMES.SPG_ALL_ASYM,
  SPG_ALL_ASYM_BILINEAR: SHEET_NAMES.SPG_ALL_ASYM,
  SPG_ALL_ASYM_TRILINEAR: SHEET_NAMES.SPG_ALL_ASYM,
  SPG_ALL_ASYM_TETRALINEAR: SHEET_NAMES.SPG_ALL_ASYM,
  SPG_ALL_OTHER: SHEET_NAMES.SPG_ALL_OTHER,
  SPG_ALL_OTHER_NAGOYA: SHEET_NAMES.SPG_ALL_OTHER,
  SPG_ALL_OTHER_BMR: SHEET_NAMES.SPG_ALL_OTHER,
  FULCRUM: SHEET_NAMES.FULCRUM,
  FULC_DETAIL: SHEET_NAMES.FULC_DETAIL,
  NODAL_MASS: SHEET_NAMES.NODAL_MASS,
  LOAD: SHEET_NAMES.LOAD,
  INTERNAL_FORCE: SHEET_NAMES.INTERNAL_FORCE,
};

/**
 * Write data to worksheet at specified position
 */
function writeDataToSheet(
  worksheet: XLSX.WorkSheet,
  data: (string | number)[][],
  startRow: number,
  startCol: number,
  headerRows: number
): void {
  if (data.length === 0) return;

  // Calculate actual start row (header starts at startRow - headerRows)
  const headerStartRow = startRow - headerRows;

  // Write each row
  for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    const excelRow = headerStartRow + rowIdx; // 1-indexed Excel row

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const excelCol = startCol + colIdx - 1; // 0-indexed for encode_col
      const cellAddress = XLSX.utils.encode_col(excelCol) + excelRow;
      const value = row[colIdx];

      if (value !== '' && value !== undefined && value !== null) {
        worksheet[cellAddress] = {
          t: typeof value === 'number' ? 'n' : 's',
          v: value,
        };
      }
    }
  }

  // Update worksheet range
  updateSheetRange(worksheet);
}

/**
 * Update worksheet range after adding data
 */
function updateSheetRange(worksheet: XLSX.WorkSheet): void {
  const cells = Object.keys(worksheet).filter(k => !k.startsWith('!'));
  if (cells.length === 0) return;

  let minRow = Infinity, maxRow = -Infinity;
  let minCol = Infinity, maxCol = -Infinity;

  for (const cell of cells) {
    const decoded = XLSX.utils.decode_cell(cell);
    minRow = Math.min(minRow, decoded.r);
    maxRow = Math.max(maxRow, decoded.r);
    minCol = Math.min(minCol, decoded.c);
    maxCol = Math.max(maxCol, decoded.c);
  }

  worksheet['!ref'] = XLSX.utils.encode_range({
    s: { r: minRow, c: minCol },
    e: { r: maxRow, c: maxCol },
  });
}

/**
 * Check if data has actual content (excluding header rows)
 */
function hasActualData(data: (string | number)[][], headerRows: number): boolean {
  if (data.length <= headerRows) return false;

  // Check if any data row has non-empty first column
  for (let i = headerRows; i < data.length; i++) {
    const row = data[i];
    if (row && row[0] !== '' && row[0] !== undefined && row[0] !== null) {
      return true;
    }
  }
  return false;
}

/**
 * Export data to Excel file
 */
export function exportToExcel(
  sheetsData: ExportSheetData[],
  filename: string = 'ES Convertor_Input.xlsx'
): void {
  const workbook = XLSX.utils.book_new();
  const worksheets = new Map<string, XLSX.WorkSheet>();

  // Process each sheet data
  for (const { configKey, data } of sheetsData) {
    const config = SHEET_CONFIGS[configKey];
    if (!config) continue;

    const sheetName = CONFIG_TO_SHEET[configKey] || config.name;
    const startRow = config.startRow || 3;
    const startCol = config.startCol || 2;
    const headerRows = config.headerRows || 1;

    // Check if data has actual content
    if (!hasActualData(data, headerRows)) continue;

    // Get or create worksheet
    let worksheet = worksheets.get(sheetName);
    if (!worksheet) {
      worksheet = {};
      worksheets.set(sheetName, worksheet);
    }

    // Write data to worksheet
    writeDataToSheet(worksheet, data, startRow, startCol, headerRows);
  }

  // Add worksheets to workbook (only if they have data)
  for (const [sheetName, worksheet] of worksheets) {
    if (worksheet['!ref']) {
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  }

  // Only export if there's at least one sheet
  if (workbook.SheetNames.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Write file
  XLSX.writeFile(workbook, filename);
}

/**
 * Create export data from Recoil state data
 */
export function createExportData(
  nodeData: (string | number)[][],
  frameData: (string | number)[][],
  planeElementData: (string | number)[][],
  rigidData: (string | number)[][],
  materialData: (string | number)[][],
  numbSectData: (string | number)[][],
  sectElemData: (string | number)[][],
  sectionData: (string | number)[][],
  plnSectData: (string | number)[][],
  hingePropZpData: (string | number)[][],
  hingePropYpData: (string | number)[][],
  hingeAssData: (string | number)[][],
  springData: (string | number)[][],
  spg6CompData: (string | number)[][],
  spgAllSymLinearData: (string | number)[][],
  spgAllSymBilinearData: (string | number)[][],
  spgAllSymTrilinearData: (string | number)[][],
  spgAllSymTetralinearData: (string | number)[][],
  spgAllASymBilinearData: (string | number)[][],
  spgAllASymTrilinearData: (string | number)[][],
  spgAllASymTetralinearData: (string | number)[][],
  spgAllOtherNagoyaData: (string | number)[][],
  spgAllOtherBmrData: (string | number)[][],
  fulcrumData: (string | number)[][],
  fulcrumDetailData: (string | number)[][],
  nodalMassData: (string | number)[][],
  loadData: (string | number)[][],
  internalForceData: (string | number)[][]
): ExportSheetData[] {
  return [
    { configKey: 'NODE', data: nodeData },
    { configKey: 'FRAME', data: frameData },
    { configKey: 'PLANE_ELEMENT', data: planeElementData },
    { configKey: 'RIGID', data: rigidData },
    { configKey: 'MATERIAL', data: materialData },
    { configKey: 'NUMB_SECT', data: numbSectData },
    { configKey: 'SECT_ELEM', data: sectElemData },
    { configKey: 'SECT', data: sectionData },
    { configKey: 'PLN_SECT', data: plnSectData },
    { configKey: 'HINGE_PROP_ZP', data: hingePropZpData },
    { configKey: 'HINGE_PROP_YP', data: hingePropYpData },
    { configKey: 'HINGE_ASS', data: hingeAssData },
    { configKey: 'ELEM_SPRING', data: springData },
    { configKey: 'SPG_6COMP', data: spg6CompData },
    { configKey: 'SPG_ALL_SYM_LINEAR', data: spgAllSymLinearData },
    { configKey: 'SPG_ALL_SYM_BILINEAR', data: spgAllSymBilinearData },
    { configKey: 'SPG_ALL_SYM_TRILINEAR', data: spgAllSymTrilinearData },
    { configKey: 'SPG_ALL_SYM_TETRALINEAR', data: spgAllSymTetralinearData },
    { configKey: 'SPG_ALL_ASYM_BILINEAR', data: spgAllASymBilinearData },
    { configKey: 'SPG_ALL_ASYM_TRILINEAR', data: spgAllASymTrilinearData },
    { configKey: 'SPG_ALL_ASYM_TETRALINEAR', data: spgAllASymTetralinearData },
    { configKey: 'SPG_ALL_OTHER_NAGOYA', data: spgAllOtherNagoyaData },
    { configKey: 'SPG_ALL_OTHER_BMR', data: spgAllOtherBmrData },
    { configKey: 'FULCRUM', data: fulcrumData },
    { configKey: 'FULC_DETAIL', data: fulcrumDetailData },
    { configKey: 'NODAL_MASS', data: nodalMassData },
    { configKey: 'LOAD', data: loadData },
    { configKey: 'INTERNAL_FORCE', data: internalForceData },
  ];
}
