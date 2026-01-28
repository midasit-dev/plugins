// ES Excel sheet names (Japanese)
// Based on main.bas lines 30-51

import { SECTION_SHAPES } from '../converters/SectConverter';

// Actual sheet names from ES Excel files
export const SHEET_NAMES = {
  NODE: '節点座標',
  FRAME: 'フレーム要素',
  PLANE_ELEMENT: '平板要素',        // Was: 面要素
  RIGID: '剛体要素',
  MATERIAL: '材料',
  NUMB_SECT: '数値断面',
  SECT_ELEM: '断面要素',
  SECT: '断面特性ｵﾌﾟｼｮﾝ',           // Was: 断面特性入力諸元
  PLN_SECT: '平板断面',              // Was: 面断面
  HINGE_PROP: 'M-φ要素詳細',
  HINGE_ASS: 'M-φ特性表',            // Was: M-φ入力表
  ELEM_SPRING: 'ばね要素',
  SPG_6COMP: 'ばね特性表_6成分概要',   // Was: ばね入力表_6成分サマリ
  SPG_ALL_SYM: 'ばね特性表_成分一覧(対称)',   // Was: ばね入力表_成分一覧(対称)
  SPG_ALL_ASYM: 'ばね特性表_成分一覧(非対称)', // Was: ばね入力表_成分一覧(非対称)
  SPG_ALL_OTHER: 'ばね特性表_成分一覧(その他)', // Was: ばね入力表_成分一覧(その他)
  FULCRUM: '支点',
  FULC_DETAIL: '支点詳細',
  NODAL_MASS: '節点質量',
  LOAD: '荷重値',                    // Was: 荷重仕様
  INTERNAL_FORCE: '内力',
} as const;

export type SheetName = typeof SHEET_NAMES[keyof typeof SHEET_NAMES];

// Sheet column configurations - Based on VBA class constants
// nReadSTRow, nReadSTCol, nReadEDCol from each Class*.cls file
export interface DropdownConfig {
  colIndex: number;  // 0-based column index within the data range
  options: string[];
}

export interface HeaderCellValue {
  row: number;      // 0-based row index within header rows
  col: number;      // 0-based column index
  value: string;    // Fixed value to display
}

export interface SheetConfig {
  name: string;
  startRow: number;
  startCol: number;
  endCol: number;
  headerRows?: number;  // Number of header rows (default: 1)
  headerValues?: HeaderCellValue[];  // Fixed values for header cells
  dropdowns?: DropdownConfig[];
}

// Section shape options for dropdown (from VBA dicSectList - Class070_Sect.cls lines 498-514)
// Filter out empty string from dropdown options
const SECTION_SHAPE_OPTIONS = Object.keys(SECTION_SHAPES).filter(k => k !== '');

export const SHEET_CONFIGS: Record<string, SheetConfig> = {
  // Class010_Node: row=3, col=2-6 (5 cols)
  NODE: { name: SHEET_NAMES.NODE, startRow: 3, startCol: 2, endCol: 6 },
  // Class020_Frame: row=3, col=2-11 (10 cols)
  FRAME: { name: SHEET_NAMES.FRAME, startRow: 3, startCol: 2, endCol: 11 },
  // Class030_PlnElm: row=3, col=2-9 (8 cols)
  PLANE_ELEMENT: { name: SHEET_NAMES.PLANE_ELEMENT, startRow: 3, startCol: 2, endCol: 9 },
  // Class040_Rigid: row=3, col=2-4 (3 cols)
  RIGID: { name: SHEET_NAMES.RIGID, startRow: 3, startCol: 2, endCol: 4 },
  // Class050_Material: row=3, col=2-10 (9 cols)
  MATERIAL: { name: SHEET_NAMES.MATERIAL, startRow: 3, startCol: 2, endCol: 10 },
  // Class055_NumbSect: row=3, col=2-17 (16 cols)
  NUMB_SECT: { name: SHEET_NAMES.NUMB_SECT, startRow: 3, startCol: 2, endCol: 17 },
  // Class060_SectElem: row=3, col=2-13 (12 cols)
  SECT_ELEM: { name: SHEET_NAMES.SECT_ELEM, startRow: 3, startCol: 2, endCol: 13 },
  // Class070_Sect: row=4, col=2-30 (29 cols)
  // Column 28 (AD) = Shape dropdown
  // Header has 2 rows (row 2: 断面, row 3: 形状)
  SECT: {
    name: SHEET_NAMES.SECT,
    startRow: 4,
    startCol: 2,
    endCol: 30,
    headerRows: 2,
    headerValues: [
      { row: 0, col: 28, value: '断面' },
      { row: 1, col: 28, value: '形状' },
    ],
    dropdowns: [{ colIndex: 28, options: SECTION_SHAPE_OPTIONS }]
  },
  // Class080_PlnSect: row=3, col=2-7 (6 cols)
  // Header row with fixed values: col 4 = 厚さ：(m), col 5 = 材料
  PLN_SECT: {
    name: SHEET_NAMES.PLN_SECT,
    startRow: 3,
    startCol: 2,
    endCol: 7,
    headerRows: 1,
    headerValues: [
      { row: 0, col: 4, value: '厚さ：(m)' },
      { row: 0, col: 5, value: '材料' },
    ],
  },
  // Class090_Hinge_Prop: Has two data regions (zp and yp)
  // Region 1 (zp): row=4, col=2-25 (B-Y, 24 cols) with title "軸zp" at row 2
  // Region 2 (yp): row=4, col=27-50 (AA-AX, 24 cols) with title "軸yp" at row 2
  // VBA ClearData(..., 2) = 2 header rows
  HINGE_PROP: { name: SHEET_NAMES.HINGE_PROP, startRow: 4, startCol: 2, endCol: 25, headerRows: 2 },
  HINGE_PROP_ZP: {
    name: SHEET_NAMES.HINGE_PROP,
    startRow: 4,
    startCol: 2,
    endCol: 25,
    headerRows: 2,
  },
  HINGE_PROP_YP: {
    name: SHEET_NAMES.HINGE_PROP,
    startRow: 4,
    startCol: 27,
    endCol: 50,
    headerRows: 2,
  },
  // Class100_Hinge_Ass: row=4, col=2-15 (14 cols)
  // VBA ClearData(..., 2) = 2 header rows
  HINGE_ASS: { name: SHEET_NAMES.HINGE_ASS, startRow: 4, startCol: 2, endCol: 15, headerRows: 2 },
  // Class110_ElemSpring: row=4, col=2-9 (8 cols), header rows 2-3
  ELEM_SPRING: { name: SHEET_NAMES.ELEM_SPRING, startRow: 4, startCol: 2, endCol: 9, headerRows: 2 },
  // Class120_SPG6Comp: row=4, col=2-15 (14 cols), header rows 2-3
  SPG_6COMP: { name: SHEET_NAMES.SPG_6COMP, startRow: 4, startCol: 2, endCol: 15, headerRows: 2 },
  // Class130_SPGAllSym: row=5, 4 tables with header rows 3-4
  // Table 1: 線形(Linear) - B~M (12 cols)
  // Table 2: バイリニア(Bilinear) - O~AD (16 cols)
  // Table 3: トリリニア(Trilinear) - AF~AX (19 cols)
  // Table 4: テトラリニア(Tetralinear) - AZ~CA (27 cols)
  SPG_ALL_SYM: { name: SHEET_NAMES.SPG_ALL_SYM, startRow: 5, startCol: 2, endCol: 78, headerRows: 2 },
  SPG_ALL_SYM_LINEAR: {
    name: SHEET_NAMES.SPG_ALL_SYM,
    startRow: 5,
    startCol: 2,
    endCol: 13,
    headerRows: 2,
  },
  SPG_ALL_SYM_BILINEAR: {
    name: SHEET_NAMES.SPG_ALL_SYM,
    startRow: 5,
    startCol: 15,
    endCol: 30,
    headerRows: 2,
  },
  SPG_ALL_SYM_TRILINEAR: {
    name: SHEET_NAMES.SPG_ALL_SYM,
    startRow: 5,
    startCol: 32,
    endCol: 50,
    headerRows: 2,
  },
  SPG_ALL_SYM_TETRALINEAR: {
    name: SHEET_NAMES.SPG_ALL_SYM,
    startRow: 5,
    startCol: 52,
    endCol: 78,
    headerRows: 2,
  },
  // Class140_SPGAllASym: row=5, 3 tables with header rows 3-4
  // Table 1: バイリニア(Bilinear) - B~Z (cols 2-26, 25 cols)
  // Table 2: トリリニア(Trilinear) - AB~BD (cols 28-56, 29 cols)
  // Table 3: テトラリニア(Tetralinear) - BF~CX (cols 58-102, 45 cols)
  SPG_ALL_ASYM: { name: SHEET_NAMES.SPG_ALL_ASYM, startRow: 5, startCol: 2, endCol: 102, headerRows: 2 },
  SPG_ALL_ASYM_BILINEAR: {
    name: SHEET_NAMES.SPG_ALL_ASYM,
    startRow: 5,
    startCol: 2,
    endCol: 26,
    headerRows: 2,
  },
  SPG_ALL_ASYM_TRILINEAR: {
    name: SHEET_NAMES.SPG_ALL_ASYM,
    startRow: 5,
    startCol: 28,
    endCol: 56,
    headerRows: 2,
  },
  SPG_ALL_ASYM_TETRALINEAR: {
    name: SHEET_NAMES.SPG_ALL_ASYM,
    startRow: 5,
    startCol: 58,
    endCol: 102,
    headerRows: 2,
  },
  // Class150_SPGAllOther: row=5, 2 tables with header rows 3-4
  // Table 1: 名古屋高速ゴム支承 - B~L (cols 2-12, 11 cols)
  // Table 2: BMR(CD)ダンパー - N~Y (cols 14-25, 12 cols)
  SPG_ALL_OTHER: { name: SHEET_NAMES.SPG_ALL_OTHER, startRow: 5, startCol: 2, endCol: 25, headerRows: 2 },
  SPG_ALL_OTHER_NAGOYA: {
    name: SHEET_NAMES.SPG_ALL_OTHER,
    startRow: 5,
    startCol: 2,
    endCol: 12,
    headerRows: 2,
  },
  SPG_ALL_OTHER_BMR: {
    name: SHEET_NAMES.SPG_ALL_OTHER,
    startRow: 5,
    startCol: 14,
    endCol: 25,
    headerRows: 2,
  },
  // Class160_Fulcrum: row=3, col=2-13 (12 cols)
  FULCRUM: { name: SHEET_NAMES.FULCRUM, startRow: 3, startCol: 2, endCol: 13 },
  // Class170_FulcDetail: row=4, col=2-21 (20 cols)
  // VBA ClearData(..., 2) = 2 header rows
  FULC_DETAIL: { name: SHEET_NAMES.FULC_DETAIL, startRow: 4, startCol: 2, endCol: 21, headerRows: 2 },
  // Class180_NodalMass: row=4, col=2-11 (10 cols)
  // VBA ClearData(..., 2) = 2 header rows
  NODAL_MASS: { name: SHEET_NAMES.NODAL_MASS, startRow: 4, startCol: 2, endCol: 11, headerRows: 2 },
  // Class190_Load: row=3, col=2-20 (19 cols)
  LOAD: { name: SHEET_NAMES.LOAD, startRow: 3, startCol: 2, endCol: 20 },
  // Class200_InternalForce: row=3, col=2-12 (11 cols)
  INTERNAL_FORCE: { name: SHEET_NAMES.INTERNAL_FORCE, startRow: 3, startCol: 2, endCol: 12 },
};
