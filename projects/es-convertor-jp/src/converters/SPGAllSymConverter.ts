// SPGAllSym Converter - Class130_SPGAllSym equivalent
// Converts symmetric spring data to MCT *NL-PROP format
// Based on VBA ChangeSPGAllSym (lines 50-255)

import { ConversionContext, SpringComponentData } from '../types/converter.types';
import { safeParseNumber } from '../utils/unitConversion';

export interface SPGAllSymResult {
  mctLines: string[];
  oilDamperLines: string[];
}

export interface SymmetricSpringTableData {
  linearData: (string | number)[][];
  bilinearData: (string | number)[][];
  trilinearData: (string | number)[][];
  tetralinearData: (string | number)[][];
}

// NAGOYA bearing ratio dictionary (VBA dicNAGOYA 63-70)
const NAGOYA_BEARING_RATIOS: Record<string, number> = {
  'H15.10 HDR-G12': 1.2,
  'H15.10 HDR-G10': 1,
  'H15.10 LRB-G12': 1.2,
  'H15.10 LRB-G10': 1,
  'H15.10 RB-G12': 1.2,
  'H15.10 RB-G10': 1,
};

// VBA vSPG array (line 99): Maps output position to component index
// Array(1, 3, -2, 4, 6, -5) means:
// Position 0 → Component 1 (Dx)
// Position 1 → Component 3 (Dz)
// Position 2 → Component -2 (Dy, sign indicates direction)
// Position 3 → Component 4 (Rx)
// Position 4 → Component 6 (Rz)
// Position 5 → Component -5 (Ry)
const V_SPG = [1, 3, -2, 4, 6, -5];

// VBA vSort array (lines 105-106): Different sort orders
const V_SORT = [
  [0, 1, 2, 3, 4, 5],  // Default order
  [1, 0, 2, 4, 3, 5],  // Reference element order (20250924 修正)
];

/**
 * Escape comma in property name (VBA ChgCamma)
 */
function escapeComma(str: string): string {
  return str.replace(/,/g, '');
}

/**
 * Convert N to kN (VBA ChangeN_kN)
 */
function changeN_kN(value: number): number {
  return value / 1000;
}

/**
 * Convert mm² to m² (VBA Change_par_MM2_M2)
 */
function changeMM2_M2(value: number): number {
  return value / 1000000;
}

// Column offsets for each table (relative to main SPG_ALL_SYM startCol=2)
// Table regions are defined in sheetNames.ts SHEET_CONFIGS
const TABLE_OFFSETS = {
  LINEAR: { start: 0, end: 11 },       // cols 2-13 → 0-11 (12 cols)
  BILINEAR: { start: 13, end: 28 },    // cols 15-30 → 13-28 (16 cols)
  TRILINEAR: { start: 30, end: 48 },   // cols 32-50 → 30-48 (19 cols)
  TETRALINEAR: { start: 50, end: 76 }, // cols 52-78 → 50-76 (27 cols)
};

/**
 * Extract table data from combined raw data
 */
function extractTableData(
  rawData: (string | number)[][],
  startCol: number,
  endCol: number
): (string | number)[][] {
  return rawData.map(row => {
    const tableRow: (string | number)[] = [];
    for (let i = startCol; i <= endCol && i < row.length; i++) {
      tableRow.push(row[i] ?? '');
    }
    return tableRow;
  }).filter(row => row[0] !== undefined && String(row[0]).trim() !== '');
}

/**
 * Parse symmetric spring data from combined raw data
 * Extracts 4 table regions and populates context.springCompData
 */
function parseSymmetricSpringFromRawData(
  rawData: (string | number)[][],
  context: ConversionContext
): void {
  // Extract 4 table regions from combined data
  const linearData = extractTableData(rawData, TABLE_OFFSETS.LINEAR.start, TABLE_OFFSETS.LINEAR.end);
  const bilinearData = extractTableData(rawData, TABLE_OFFSETS.BILINEAR.start, TABLE_OFFSETS.BILINEAR.end);
  const trilinearData = extractTableData(rawData, TABLE_OFFSETS.TRILINEAR.start, TABLE_OFFSETS.TRILINEAR.end);
  const tetralinearData = extractTableData(rawData, TABLE_OFFSETS.TETRALINEAR.start, TABLE_OFFSETS.TETRALINEAR.end);

  // Parse each table
  parseLinearTable(linearData, context);
  parseBilinearTable(bilinearData, context);
  parseTrilinearTable(trilinearData, context);
  parseTetralinearTable(tetralinearData, context);
}

/**
 * Parse symmetric spring data from 4 tables and populate context.springCompData
 * This fills in the strProp (stiffness) values for each component
 */
function parseSymmetricSpringTables(
  tableData: SymmetricSpringTableData,
  context: ConversionContext
): void {
  // Parse Linear table (12 cols)
  // Columns: 0=名前, 1=成分, 2-11=data...
  parseLinearTable(tableData.linearData, context);

  // Parse Bilinear table (16 cols)
  parseBilinearTable(tableData.bilinearData, context);

  // Parse Trilinear table (19 cols)
  parseTrilinearTable(tableData.trilinearData, context);

  // Parse Tetralinear table (27 cols)
  parseTetralinearTable(tableData.tetralinearData, context);
}

/**
 * Parse Linear table data (Table 1: 12 columns B~M)
 * VBA Class130_SPGAllSym.cls nRead1STCol=2, nRead1EDCol=13
 *
 * Column structure:
 * 0 (B): Property name (ばね特性表示名)
 * 1 (C): Component (xl, yl, zl, rxl, ryl, rzl)
 * 2-11 (D-M): Linear stiffness data (single point K value)
 */
function parseLinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Get stiffness value from column 2 (first numeric value)
    const stiffness = safeParseNumber(row[2]);

    // Store all data points for potential multi-point output
    const dataPoints: { d: number; k: number }[] = [];
    // For linear, column 2 is the stiffness value, no displacement specified
    dataPoints.push({ d: 0, k: stiffness });

    updateSpringCompData(context, propName, componentIdx, stiffness, 'LINEAR', dataPoints);
  }
}

/**
 * Parse Bilinear table data (Table 2: 16 columns O~AD)
 * VBA Class130_SPGAllSym.cls nRead2STCol=15, nRead2EDCol=30
 *
 * Column structure:
 * 0 (O): Property name
 * 1 (P): Component
 * 2 (Q): d1 - Point 1 displacement
 * 3 (R): K1/F1 - Point 1 stiffness/force
 * 4 (S): d2 - Point 2 displacement
 * 5 (T): K2/F2 - Point 2 stiffness/force
 * 6-15: Additional points if extended
 */
function parseBilinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse 2 points: (d1,K1), (d2,K2)
    const dataPoints: { d: number; k: number }[] = [];
    const d1 = safeParseNumber(row[2]);
    const k1 = safeParseNumber(row[3]);
    const d2 = safeParseNumber(row[4]);
    const k2 = safeParseNumber(row[5]);

    dataPoints.push({ d: d1, k: k1 });
    dataPoints.push({ d: d2, k: k2 });

    // First point stiffness for MCT output
    updateSpringCompData(context, propName, componentIdx, k1, 'NBI', dataPoints);
  }
}

/**
 * Parse Trilinear table data (Table 3: 19 columns AF~AX)
 * VBA Class130_SPGAllSym.cls nRead3STCol=32, nRead3EDCol=50
 *
 * Column structure:
 * 0 (AF): Property name
 * 1 (AG): Component
 * 2 (AH): d1 - Point 1 displacement
 * 3 (AI): K1/F1 - Point 1 stiffness/force
 * 4 (AJ): d2 - Point 2 displacement
 * 5 (AK): K2/F2 - Point 2 stiffness/force
 * 6 (AL): d3 - Point 3 displacement
 * 7 (AM): K3/F3 - Point 3 stiffness/force
 * 8-18: Additional data
 */
function parseTrilinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse 3 points: (d1,K1), (d2,K2), (d3,K3)
    const dataPoints: { d: number; k: number }[] = [];
    const d1 = safeParseNumber(row[2]);
    const k1 = safeParseNumber(row[3]);
    const d2 = safeParseNumber(row[4]);
    const k2 = safeParseNumber(row[5]);
    const d3 = safeParseNumber(row[6]);
    const k3 = safeParseNumber(row[7]);

    dataPoints.push({ d: d1, k: k1 });
    dataPoints.push({ d: d2, k: k2 });
    dataPoints.push({ d: d3, k: k3 });

    // First point stiffness for MCT output (hysteresis type: KIN for trilinear)
    updateSpringCompData(context, propName, componentIdx, k1, 'KIN', dataPoints);
  }
}

/**
 * Parse Tetralinear table data (Table 4: 27 columns AZ~CA)
 * VBA Class130_SPGAllSym.cls nRead4STCol=52, nRead4EDCol=78
 *
 * Column structure:
 * 0 (AZ): Property name
 * 1 (BA): Component
 * 2 (BB): d1 - Point 1 displacement
 * 3 (BC): K1/F1 - Point 1 stiffness/force
 * 4 (BD): d2 - Point 2 displacement
 * 5 (BE): K2/F2 - Point 2 stiffness/force
 * 6 (BF): d3 - Point 3 displacement
 * 7 (BG): K3/F3 - Point 3 stiffness/force
 * 8 (BH): d4 - Point 4 displacement
 * 9 (BI): K4/F4 - Point 4 stiffness/force
 * 10-26: Additional/extended data
 */
function parseTetralinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse 4 points: (d1,K1), (d2,K2), (d3,K3), (d4,K4)
    const dataPoints: { d: number; k: number }[] = [];
    const d1 = safeParseNumber(row[2]);
    const k1 = safeParseNumber(row[3]);
    const d2 = safeParseNumber(row[4]);
    const k2 = safeParseNumber(row[5]);
    const d3 = safeParseNumber(row[6]);
    const k3 = safeParseNumber(row[7]);
    const d4 = safeParseNumber(row[8]);
    const k4 = safeParseNumber(row[9]);

    dataPoints.push({ d: d1, k: k1 });
    dataPoints.push({ d: d2, k: k2 });
    dataPoints.push({ d: d3, k: k3 });
    dataPoints.push({ d: d4, k: k4 });

    // First point stiffness for MCT output (hysteresis type: TTE for tetralinear)
    updateSpringCompData(context, propName, componentIdx, k1, 'TTE', dataPoints);
  }
}

/**
 * Get component index from string (1-6)
 */
function getComponentIndex(componentStr: string): number {
  const str = componentStr.toLowerCase().trim();
  if (str.includes('xl') && !str.includes('回')) return 1;
  if (str.includes('yl') && !str.includes('回')) return 2;
  if (str.includes('zl') && !str.includes('回')) return 3;
  if (str.includes('回xl') || str.includes('rxl')) return 4;
  if (str.includes('回yl') || str.includes('ryl')) return 5;
  if (str.includes('回zl') || str.includes('rzl')) return 6;

  // Try numeric
  const num = parseInt(str, 10);
  if (num >= 1 && num <= 6) return num;

  return 1; // Default to Dx
}

/**
 * Update springCompData with stiffness value and data points
 */
function updateSpringCompData(
  context: ConversionContext,
  propName: string,
  componentIdx: number,
  stiffness: number,
  hystType: string,
  dataPoints?: { d: number; k: number }[]
): void {
  let sprData = context.springCompData.get(propName);

  if (!sprData) {
    sprData = { components: [] };
    context.springCompData.set(propName, sprData);
  }

  // Find or create component
  let comp = sprData.components.find(c => c.componentIndex === componentIdx);
  if (!comp) {
    comp = {
      componentIndex: componentIdx,
      componentType: 0,
      subType: 0,
      propertyName: propName,
      rotate: 0,
      mctHyst: hystType,
      mctHyst2: '',
      mctSym: 0,
      mctType: 0,
      mctSFType: 0,
      mctStiff: stiffness,
      category: [hystType],
      data: [],
    };
    sprData.components.push(comp);
  } else {
    // Update existing component
    comp.mctStiff = stiffness;
    if (!comp.mctHyst || comp.mctHyst === '') {
      comp.mctHyst = hystType;
    }
  }

  // Store data points for multi-point curves
  if (dataPoints && dataPoints.length > 0) {
    // Store as tensionData for potential asymmetric/detailed output
    if (!comp.tensionData) {
      comp.tensionData = [];
    }
    comp.tensionData.push(dataPoints.map(pt => ({ d: pt.d, k: pt.k, f: pt.d * pt.k })));
  }
}

/**
 * Convert symmetric spring properties to MCT format
 * Based on Class130_SPGAllSym.ChangeSPGAllSym (VBA 50-255)
 */
export function convertSymmetricSprings(
  rawData: (string | number)[][],
  context: ConversionContext,
  spg6CompMapping: Map<string, number>
): SPGAllSymResult {
  const mctLines: string[] = [];
  const oilDamperLines: string[] = [];

  // Parse raw data into context.springCompData if provided
  if (rawData && rawData.length > 0) {
    parseSymmetricSpringFromRawData(rawData, context);
  }

  // Damper tracking (VBA dicDamper)
  const dicDamper = new Map<string, number>();

  // MCT Comments (VBA 72-86)
  mctLines.push('*NL-PROP    ; General Link Property');
  mctLines.push('; NAME, APPTYPE, TYPE, TW, TWRATIO_I, bUSEMASS, TM, TMRATIO_I, bSSL, DY, DZ, SIESKEY(if APPTYPE=2), DESC');
  mctLines.push('; bLDX, DX, EFFDAMP, bNDX, [NL_PROP]');
  mctLines.push('; bLDY, DY, EFFDAMP, bNDY, [NL_PROP]');
  mctLines.push('; bLDZ, DZ, EFFDAMP, bNDZ, [NL_PROP]');
  mctLines.push('; bLRX, RX, EFFDAMP, bNRX, [NL_PROP]');
  mctLines.push('; bLRY, RY, EFFDAMP, bNRY, [NL_PROP]');
  mctLines.push('; bLRZ, RZ, EFFDAMP, bNRZ, [NL_PROP]');
  mctLines.push('; [NL_PROP] : DSTIFF, DAMP, DEXP, bRIGDBR, BSTIFF, REFV                                  ; Visco-elastic Damper Type');
  mctLines.push('; [NL_PROP] : STIFF, OPEN                                                                ; Gap Type or Hook Type');
  mctLines.push('; [NL_PROP] : STIFF, YSTR, PYS_RATIO, YEXP, PA, PB                                       ; Hysteretic System Type');
  mctLines.push('; [NL_PROP] : STIFF, YSTR, PYS_RATIO, PA, PB                                             ; Lead Rubber Bearing Type');
  mctLines.push('; [NL_PROP] : STIFF, FCS, FCF, RP, RADIUS, PA, PB                                        ; Friction Pendulum System Type');
  mctLines.push('; [NL_PROP] : SYM, STIFF(1~4), FCS(1~4), FCF(1~4), RP(1~4), RADIUS(1~4), STOPDIST(1~4), H_In, H_Out   ; Triple Friction Pendulum System Type');

  // Get spring property names (VBA vKeys = m_dicSprProp.Keys)
  const sprPropKeys = Array.from(context.springCompData.keys());

  if (sprPropKeys.length === 0) {
    return { mctLines, oilDamperLines };
  }

  // Iterate over spring properties (VBA 108-203)
  for (const sprName of sprPropKeys) {
    const sprData = context.springCompData.get(sprName);
    if (!sprData) continue;

    // Line 1: Property header (VBA 113-141)
    let strType = 'SPG';
    let nDamper = 0;

    // Check if VISCOUS-OIL-DAMPER type (VBA 121-129)
    if (sprData.components.some(c => c.mctHyst === 'VISCOUS-OIL-DAMPER')) {
      strType = 'AI';
      if (!dicDamper.has(sprName)) {
        nDamper = dicDamper.size + 1;
        dicDamper.set(sprName, nDamper);
      } else {
        nDamper = dicDamper.get(sprName) || 0;
      }
    }

    // Build line 1 (VBA 131-140)
    const line1 = `${escapeComma(sprName)},ELEMENT,${strType},0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,${nDamper},`;
    mctLines.push(line1);

    // Lines 2-7: 6 DOF lines (VBA 143-193)
    let bAllFree = true;

    // Determine sort order (VBA 146-148)
    // nSort = 1 if reference element exists (20250924 修正)
    const nSort = context.springRefElements?.has(sprName) ? 1 : 0;

    const dofLines: string[] = [];

    for (let m = 0; m < 6; m++) {
      // Get component index using vSort and vSPG (VBA 150-156)
      const sortedIdx = V_SORT[nSort][m];
      let compIdx = V_SPG[sortedIdx];
      compIdx = Math.abs(compIdx);

      // Find component data for this index
      const compData = sprData.components.find(c => c.componentIndex === compIdx);

      let dofLine: string;

      if (compData && compData.mctHyst === 'LITR') {
        // LITR bearing stiffness calculation (VBA 159-163)
        bAllFree = false;

        // strData format: [bearingType, rubberHeight, area]
        if (compData.data && compData.data.length >= 3) {
          const bearingType = String(compData.data[0] || '');
          const rubberHeight = safeParseNumber(compData.data[1]);
          const area = safeParseNumber(compData.data[2]);

          const bearingRatio = NAGOYA_BEARING_RATIOS[bearingType] || 1;
          // VBA: dValue = dicNAGOYA(...) * strData(1) / ChangeN_kN(Change_par_MM2_M2(strData(2)))
          const dValue = bearingRatio * rubberHeight / changeN_kN(changeMM2_M2(area));
          dofLine = `YES,${dValue}, 0, NO`;
        } else {
          dofLine = 'YES,0, 0, NO';
        }
      } else if (compData && compData.mctStiff !== undefined && compData.mctStiff !== 0) {
        // Has stiffness data (VBA 164-182)
        bAllFree = false;
        const stiffValue = compData.mctStiff;
        dofLine = `YES,${stiffValue},0,NO`;
      } else {
        // No data - free DOF (VBA 183-185)
        dofLine = 'NO, 0, 0, NO';
      }

      dofLines.push(dofLine);
    }

    // Handle bAllFree case (VBA 195-199)
    if (bAllFree) {
      for (let m = 0; m < 6; m++) {
        dofLines[m] = 'YES,0.00001,0,NO';
      }
    }

    // Add DOF lines to output
    for (const line of dofLines) {
      mctLines.push(line);
    }

    // Line 8: 31 zeros (VBA 201-202)
    mctLines.push('0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0');
  }

  // Generate VISCOUS-OIL-DAMPER section if needed (VBA 207-239)
  if (dicDamper.size > 0) {
    oilDamperLines.push('*VISCOUS-OIL-DAMPER    ; Define Seismic Control Device - Viscous/Oil Damper');
    oilDamperLines.push('; KEY, NAME, DESC, INPUTMETHOD, DEVICE TYPE, COMPANY, PRODUCT NAME, TYPE NUM, DAMPER TYPE, DASHPOT TYPE, INPUT TYPE, INPUT TYPE_EXFN ; 1st line');
    oilDamperLines.push('; [Dx] : DOF, CE, P1, C1, Alpha1, K0, PY, VY, ALPHA, C, CE - [Rz] : .....                                                            ; 2nd-7th line');

    for (const [damperName, damperNo] of dicDamper) {
      // Line 1: Damper header (VBA 221-230)
      oilDamperLines.push(`${damperNo},${escapeComma(damperName)}, , 0, , , , , 0, 2, 0, 1`);

      // Lines 2-7: 6 DOF damper lines (VBA 232-236)
      let firstDof = 'YES';
      for (let k = 0; k < 6; k++) {
        oilDamperLines.push(`${firstDof} , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100`);
        firstDof = 'NO';
      }
    }
  }

  return { mctLines, oilDamperLines };
}

/**
 * Convert with 4 separate table data arrays
 */
export function convertSymmetricSpringsWithTables(
  tableData: SymmetricSpringTableData,
  context: ConversionContext,
  spg6CompMapping: Map<string, number>
): SPGAllSymResult {
  // First, parse the 4 tables and populate context.springCompData
  parseSymmetricSpringTables(tableData, context);

  // Then generate MCT output
  return convertSymmetricSprings([], context, spg6CompMapping);
}

/**
 * Get bearing ratio by type name
 */
export function getBearingRatio(bearingType: string): number {
  return NAGOYA_BEARING_RATIOS[bearingType] || 1.0;
}

/**
 * Check if bearing type is valid
 */
export function isValidBearingType(bearingType: string): boolean {
  return bearingType in NAGOYA_BEARING_RATIOS;
}

/**
 * Get all available bearing types
 */
export function getAvailableBearingTypes(): string[] {
  return Object.keys(NAGOYA_BEARING_RATIOS);
}
