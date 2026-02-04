// SPGAllASym Converter - Class140_SPGAllASym equivalent
// Converts asymmetric spring data to MCT *IHINGE-PROP format
// Based on VBA Class140_SPGAllASym.ChangeSPGAllASym (lines 38-243)

import { ConversionContext, SpringComponentData } from '../types/converter.types';
import { safeParseNumber } from '../utils/unitConversion';

export interface SPGAllASymResult {
  mctLines: string[];
}

export interface AsymmetricSpringTableData {
  bilinearData: (string | number)[][];
  trilinearData: (string | number)[][];
  tetralinearData: (string | number)[][];
}

// Bearing type dictionary (VBA dicBearingType lines 46-59)
const BEARING_TYPE_MAP: Record<string, number> = {
  'H15.10 HDR-G12': 1,
  'H15.10 HDR-G10': 2,
  'H15.10 LRB-G12': 3,
  'H15.10 LRB-G10': 4,
  'H15.10 RB-G12': 5,
  'H15.10 RB-G10': 6,
  'H13.5 HDR-G12': 1,
  'H13.5 HDR-G10': 2,
  'H13.5 LRB-G12': 3,
  'H13.5 LRB-G10': 4,
  'H13.5 RB-G12': 5,
  'H13.5 RB-G10': 6,
};

// VBA vSort array (lines 92-93): Different sort orders for 6 DOFs
// VBA: vSort = Array(Array(0, 1, 2, 3, 4, 5), Array(0, 2, 1, 3, 5, 4))
// VBA loop: For k = 1 To 6, nAbs = vSort(nSort)(k)
// VBA k=6 accesses index 6 which is out of bounds, but with On Error Resume Next it continues
// For correctness, we provide 7 elements (index 0-6) where:
//   - index 0 is unused (k starts at 1)
//   - indices 1-5 match VBA array values at those positions
//   - index 6 is set to 6 to properly check component 6
const V_SORT = [
  [0, 1, 2, 3, 4, 5, 6],  // Default: components 1,2,3,4,5,6 in order
  [0, 2, 1, 3, 5, 4, 6],  // Reference element: swap (1,2) and (4,5), keep 6
];

// Column offsets for each table (relative to main SPG_ALL_ASYM startCol=2)
// Based on VBA nRead*STCol and nRead*EDCol
const TABLE_OFFSETS = {
  BILINEAR: { start: 0, end: 24 },      // cols 2-26 → 0-24 (25 cols)
  TRILINEAR: { start: 26, end: 54 },    // cols 28-56 → 26-54 (29 cols)
  TETRALINEAR: { start: 56, end: 100 }, // cols 58-102 → 56-100 (45 cols)
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
 * Parse asymmetric spring data from combined raw data
 * Extracts 3 table regions and populates context.springCompData
 */
function parseAsymmetricSpringFromRawData(
  rawData: (string | number)[][],
  context: ConversionContext
): void {
  // Extract 3 table regions from combined data
  const bilinearData = extractTableData(rawData, TABLE_OFFSETS.BILINEAR.start, TABLE_OFFSETS.BILINEAR.end);
  const trilinearData = extractTableData(rawData, TABLE_OFFSETS.TRILINEAR.start, TABLE_OFFSETS.TRILINEAR.end);
  const tetralinearData = extractTableData(rawData, TABLE_OFFSETS.TETRALINEAR.start, TABLE_OFFSETS.TETRALINEAR.end);

  // Parse each table
  parseBilinearTable(bilinearData, context);
  parseTrilinearTable(trilinearData, context);
  parseTetralinearTable(tetralinearData, context);
}

/**
 * Parse Bilinear table data (Table 1: 25 columns B~Z)
 * VBA Class140_SPGAllASym nRead1STCol=2, nRead1EDCol=26
 *
 * Column structure for asymmetric bilinear (from VBA main.bas GetSpringData):
 * VBA uses strTENS(0, m) and strTENS(1, m) where:
 *   strTENS(0, m): D from col 3+m*3, K from col 4+m*3, F from col 5+m*3 → columns 3-8
 *   strTENS(1, m): D from col 10+m*3, K from col 11+m*3, F from col 12+m*3 → columns 10-15
 *
 * VBA output order (nTens=1 first, then nTens=0):
 *   - strTENS(1) output first = columns 10-15 = TENSION (small values like 7.89)
 *   - strTENS(0) output second = columns 3-8 = COMPRESSION (large values like 2500)
 *
 * Therefore:
 *   - Columns 3-8: COMPRESSION data (strTENS(0))
 *   - Columns 10-15: TENSION data (strTENS(1))
 */
function parseBilinearTable(data: (string | number)[][], context: ConversionContext): void {
  console.log('=== parseBilinearTable (ASYM) ===');

  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    console.log(`  ASYM Bilinear: propName="${propName}", componentStr="${componentStr}", componentIdx=${componentIdx}`);

    // VBA column mapping (from main.bas GetSpringData):
    // strTENS(direction, m) where m=0,1 for bilinear (2 points)
    //
    // strTENS(0, m) = COMPRESSION: D=m+3, K=m+5, F=m+7
    //   m=0,1: D=col 3,4 / K=col 5,6 / F=col 7,8 (type-wise consecutive)
    //
    // strTENS(1, m) = TENSION: D=m+10, K=m+12, F=m+14 (with Abs)
    //   m=0,1: D=col 10,11 / K=col 12,13 / F=col 14,15 (type-wise consecutive)

    // Parse COMPRESSION data (2 points) - VBA strTENS(0)
    const compressionData: { d: number; k: number; f: number }[] = [];
    for (let m = 0; m < 2; m++) {
      const d = Math.abs(safeParseNumber(row[3 + m])) / 1000; // col 3, 4
      const k = Math.abs(safeParseNumber(row[5 + m]));        // col 5, 6
      const f = Math.abs(safeParseNumber(row[7 + m]));        // col 7, 8
      if (d !== 0 || k !== 0 || f !== 0) {
        compressionData.push({ d, k, f });
      }
    }

    // Parse TENSION data (2 points) - VBA strTENS(1)
    // Note: Values may be negative in Excel, VBA uses Abs()
    const tensionData: { d: number; k: number; f: number }[] = [];
    for (let m = 0; m < 2; m++) {
      const d = Math.abs(safeParseNumber(row[10 + m])) / 1000; // col 10, 11
      const k = Math.abs(safeParseNumber(row[12 + m]));         // col 12, 13
      const f = Math.abs(safeParseNumber(row[14 + m]));         // col 14, 15
      if (d !== 0 || k !== 0 || f !== 0) {
        tensionData.push({ d, k, f });
      }
    }

    console.log(`    tensionData: ${JSON.stringify(tensionData)}`);
    console.log(`    compressionData: ${JSON.stringify(compressionData)}`);

    // TAK extension: If existing component has TAK hyst type (set by SPG6Comp),
    // extend 2-point data to 3-point by duplicating first point (VBA: ReDim Preserve + shift)
    // VBA logic: [p0, p1] → [p0, p0, p1]
    const existingSprData = context.springCompData.get(propName);
    const existingComp = existingSprData?.components.find(c => c.componentIndex === componentIdx);
    if (existingComp && existingComp.mctHyst === 'TAK') {
      if (tensionData.length === 2) {
        tensionData.unshift({ ...tensionData[0] });
      }
      if (compressionData.length === 2) {
        compressionData.unshift({ ...compressionData[0] });
      }
    }

    const stiffness = tensionData.length > 0 ? tensionData[0].k : 0;
    updateSpringCompData(context, propName, componentIdx, stiffness, 'NBI', 1, tensionData, compressionData);
  }
}

/**
 * Parse Trilinear table data (Table 2: 29 columns AB~BD)
 * VBA Class140_SPGAllASym nRead2STCol=28, nRead2EDCol=56
 *
 * VBA column mapping (from main.bas GetSpringData, j=1):
 * strTENS(0, m) = COMPRESSION: D=m+3, K=m+6, F=m+9
 *   m=0,1,2: D=col 3,4,5 / K=col 6,7,8 / F=col 9,10,11
 * strTENS(1, m) = TENSION: D=m+12, K=m+15, F=m+18 (with Abs)
 *   m=0,1,2: D=col 12,13,14 / K=col 15,16,17 / F=col 18,19,20
 */
function parseTrilinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse COMPRESSION data (3 points) - VBA strTENS(0)
    const compressionData: { d: number; k: number; f: number }[] = [];
    for (let m = 0; m < 3; m++) {
      const d = Math.abs(safeParseNumber(row[3 + m])) / 1000;  // col 3, 4, 5
      const k = Math.abs(safeParseNumber(row[6 + m]));         // col 6, 7, 8
      const f = Math.abs(safeParseNumber(row[9 + m]));         // col 9, 10, 11
      if (d !== 0 || k !== 0 || f !== 0) {
        compressionData.push({ d, k, f });
      }
    }

    // Parse TENSION data (3 points) - VBA strTENS(1)
    const tensionData: { d: number; k: number; f: number }[] = [];
    for (let m = 0; m < 3; m++) {
      const d = Math.abs(safeParseNumber(row[12 + m])) / 1000; // col 12, 13, 14
      const k = Math.abs(safeParseNumber(row[15 + m]));         // col 15, 16, 17
      const f = Math.abs(safeParseNumber(row[18 + m]));         // col 18, 19, 20
      if (d !== 0 || k !== 0 || f !== 0) {
        tensionData.push({ d, k, f });
      }
    }

    const stiffness = tensionData.length > 0 ? tensionData[0].k : 0;
    updateSpringCompData(context, propName, componentIdx, stiffness, 'KIN', 1, tensionData, compressionData);
  }
}

/**
 * Parse Tetralinear table data (Table 3: 45 columns BF~CX)
 * VBA Class140_SPGAllASym nRead3STCol=58, nRead3EDCol=102
 *
 * VBA column mapping (from main.bas GetSpringData, j=2):
 * strTENS(0, m) = COMPRESSION: D=m+5, K=m+9, F=m+16
 *   m=0,1,2,3: D=col 5,6,7,8 / K=col 9,10,11,12 / F=col 16,17,18,19
 * strTENS(1, m) = TENSION: D=m+22, K=m+26, F=m+33 (with Abs)
 *   m=0,1,2,3: D=col 22,23,24,25 / K=col 26,27,28,29 / F=col 33,34,35,36
 */
function parseTetralinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse COMPRESSION data (4 points) - VBA strTENS(0)
    const compressionData: { d: number; k: number; f: number }[] = [];
    for (let m = 0; m < 4; m++) {
      const d = Math.abs(safeParseNumber(row[5 + m])) / 1000;  // col 5, 6, 7, 8
      const k = Math.abs(safeParseNumber(row[9 + m]));         // col 9, 10, 11, 12
      const f = Math.abs(safeParseNumber(row[16 + m]));        // col 16, 17, 18, 19
      if (d !== 0 || k !== 0 || f !== 0) {
        compressionData.push({ d, k, f });
      }
    }

    // Parse TENSION data (4 points) - VBA strTENS(1)
    const tensionData: { d: number; k: number; f: number }[] = [];
    for (let m = 0; m < 4; m++) {
      const d = Math.abs(safeParseNumber(row[22 + m])) / 1000; // col 22, 23, 24, 25
      const k = Math.abs(safeParseNumber(row[26 + m]));         // col 26, 27, 28, 29
      const f = Math.abs(safeParseNumber(row[33 + m]));         // col 33, 34, 35, 36
      if (d !== 0 || k !== 0 || f !== 0) {
        tensionData.push({ d, k, f });
      }
    }

    const stiffness = tensionData.length > 0 ? tensionData[0].k : 0;
    updateSpringCompData(context, propName, componentIdx, stiffness, 'TTE', 1, tensionData, compressionData);
  }
}

/**
 * Get component index from string (1-6)
 * VBA dicComponent mapping:
 *   "xl" -> 1, "yl" -> 2, "zl" -> 3
 *   "θxl" -> 4, "θyl" -> 5, "θzl" -> 6
 *
 * CRITICAL: Must check rotational DOFs first because 'θxl'.includes('xl') is true!
 */
function getComponentIndex(componentStr: string): number {
  const str = componentStr.trim();
  const strLower = str.toLowerCase();

  // Check for rotational DOFs FIRST (order matters!)
  // VBA uses θ (theta) character, also check for common variations
  if (str.includes('θxl') || str.includes('θXl') || str.includes('ΘXL') ||
      strLower.includes('θxl') || str.includes('回xl') || strLower.includes('rxl') ||
      str.includes('θx') || str.includes('Θx')) return 4;
  if (str.includes('θyl') || str.includes('θYl') || str.includes('ΘYL') ||
      strLower.includes('θyl') || str.includes('回yl') || strLower.includes('ryl') ||
      str.includes('θy') || str.includes('Θy')) return 5;
  if (str.includes('θzl') || str.includes('θZl') || str.includes('ΘZL') ||
      strLower.includes('θzl') || str.includes('回zl') || strLower.includes('rzl') ||
      str.includes('θz') || str.includes('Θz')) return 6;

  // Check for linear DOFs (after rotational to avoid false matches)
  if (strLower.includes('xl')) return 1;
  if (strLower.includes('yl')) return 2;
  if (strLower.includes('zl')) return 3;

  const num = parseInt(str, 10);
  if (num >= 1 && num <= 6) return num;

  return 1;
}

/**
 * Update springCompData with asymmetric data
 */
function updateSpringCompData(
  context: ConversionContext,
  propName: string,
  componentIdx: number,
  stiffness: number,
  hystType: string,
  iType: number,
  tensionData: { d: number; k: number; f: number }[],
  compressionData: { d: number; k: number; f: number }[]
): void {
  let sprData = context.springCompData.get(propName);

  if (!sprData) {
    sprData = { components: [] };
    context.springCompData.set(propName, sprData);
  }

  let comp = sprData.components.find(c => c.componentIndex === componentIdx);
  if (!comp) {
    comp = {
      componentIndex: componentIdx,
      componentType: 1, // Asymmetric
      subType: 0,
      propertyName: propName,
      rotate: 0,
      mctHyst: hystType,
      mctHyst2: '',
      mctSym: 1, // Asymmetric
      mctType: iType,
      mctSFType: 1,
      mctStiff: stiffness,
      category: [hystType],
      data: [],
      tensionData: [],
    };
    sprData.components.push(comp);
  } else {
    // Update stiffness and other values
    comp.mctStiff = stiffness;
    comp.mctSym = 1;
    comp.mctType = iType;

    // CRITICAL: Only update mctHyst if it wasn't already set by SPG6Comp
    // SPG6Comp sets specific types like SLBC, SLBT which should be preserved
    // as they determine which direction data to use in NL-PROP generation
    if (!comp.mctHyst || comp.mctHyst === '' || comp.mctHyst === 'NBI') {
      comp.mctHyst = hystType;
    }
  }

  // Store tension and compression data
  // VBA indexing: strTENS(0) = COMPRESSION, strTENS(1) = TENSION
  // Must match VBA order for correct output
  if (!comp.tensionData) {
    comp.tensionData = [];
  }
  comp.tensionData[0] = compressionData;  // strTENS(0) = COMPRESSION (cols 3-8)
  comp.tensionData[1] = tensionData;       // strTENS(1) = TENSION (cols 10-15)

  console.log(`  updateSpringCompData: propName="${propName}", componentIdx=${componentIdx}`);
  console.log(`    mctHyst="${comp.mctHyst}", stiffness=${stiffness}`);
  console.log(`    tensionData[0].k=${tensionData[0]?.k}, compressionData[0].k=${compressionData[0]?.k}`);
}

/**
 * Calculate cumulative P values (VBA lines 152-160)
 */
function calculateCumulativeP(
  data: { d: number; k: number; f: number }[]
): { d: number; k: number; f: number; p: number }[] {
  const result: { d: number; k: number; f: number; p: number }[] = [];
  let prevD = 0;
  let prevP = 0;

  for (const point of data) {
    const p = point.k * (point.d - prevD) + prevP;
    result.push({ ...point, p });
    prevD = point.d;
    prevP = p;
  }

  return result;
}

/**
 * Convert asymmetric spring properties to MCT *IHINGE-PROP format
 * Based on VBA Class140_SPGAllASym.ChangeSPGAllASym (lines 38-243)
 */
export function convertAsymmetricSprings(
  rawData: (string | number)[][],
  context: ConversionContext,
  spg6CompMapping: Map<string, number>
): SPGAllASymResult {
  const mctLines: string[] = [];

  // Parse raw data into context.springCompData if provided
  if (rawData && rawData.length > 0) {
    parseAsymmetricSpringFromRawData(rawData, context);
  }

  // MCT Comments (VBA lines 68-82)
  mctLines.push('*IHINGE-PROP    ; Inelastic Hinge Property');
  mctLines.push('; NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC    ; line 1');
  mctLines.push('; bExistIJ_FX, bExistIJ_FY, bExistIJ_FZ, bExistIJ_MX, bExistIJ_FY, bExistIJ_MZ, bExistIJ_YS              ; line 2');
  mctLines.push('; bFx, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 3');
  mctLines.push('; bFy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 4');
  mctLines.push('; bFz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 5');
  mctLines.push('; bMx, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 6');
  mctLines.push('; bMy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 7');
  mctLines.push('; bMz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 8');
  mctLines.push('; bPMAUTO, PC0, [PMDATA], [PMDATA]                                                                       ; line 9');
  mctLines.push('; bYSAUTO, GAMMA1ST, GAMMA2ND, ALPHA, COUPLING, [YSDATA], [YSDATA]           ; line 10');
  mctLines.push('; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP                          ; KIN, ORG, PKO, DEG, NBI, EBI, ETR, ETE');
  mctLines.push('; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO, FACTOR            ; TAK, TAK, TTE, MTT');

  // Get spring property names from spg6CompMapping (VBA line 94-96)
  const sprPropKeys = Array.from(spg6CompMapping.keys());

  if (sprPropKeys.length === 0) {
    return { mctLines };
  }

  // VBA bug emulation: m variable is used in nTens logic but m comes from output loop
  // In VBA: nTens = 1, If m > 0 Then nTens = 0
  // - j=0, k=1: m=0 (initial) → nTens=1 (TENSION first)
  // - j=0, k>1: m=i from previous loop → nTens=0 (COMPRESSION first)
  // - j>0: m=i from previous loop → nTens=0 (COMPRESSION first)
  // Result: Only first spring's first DOF outputs TENSION first, rest output COMPRESSION first
  let isFirstSpringFirstDOF = true;

  // Iterate over spring properties (VBA lines 94-227)
  for (const sprName of sprPropKeys) {
    const sprData = context.springCompData.get(sprName);
    if (!sprData) continue;

    // VBA outputs ALL spring properties in IHINGE-PROP, not just asymmetric ones
    // Skip only if no components have data at all
    const hasAnyData = sprData.components.some(c =>
      (c.tensionData && c.tensionData.length > 0) ||
      (c.mctStiff !== undefined && c.mctStiff !== 0) ||
      (c.mctHyst && c.mctHyst !== '')
    );
    if (!hasAnyData) continue;

    // Line 1: Property header (VBA line 99)
    mctLines.push(`MLHP=NL_${sprName}, STEEL, SPR, AUTO, I, NONE, SKEL,,`);

    // Line 2: DOF existence flags (VBA line 100)
    mctLines.push('NO , NO, NO, NO, NO, NO, NO');

    // Determine sort order (VBA lines 102-104)
    const nSort = context.springRefElements?.has(sprName) ? 1 : 0;

    // Store first 6 DOF lines for duplication (VBA line 106)
    const dofLines: string[] = [];

    // Lines 3-8: 6 DOF lines (VBA lines 107-216)
    // VBA: For k = 1 To 6; nAbs = vSort(nSort)(k)
    for (let k = 1; k <= 6; k++) {
      const nAbs = V_SORT[nSort][k];
      const compData = sprData.components.find(c => c.componentIndex === nAbs);

      let dofLine: string;

      // VBA condition: If Len(strProp) > 0 Then
      //   If Not (nComponent = 0 And nType = 0) Then ... (non-linear)
      // VBA nComponent: 0=symmetric/asymmetric, 2=other (bearing)
      // VBA nType: 0=linear, 1-3=bilinear/trilinear/tetralinear
      // In TypeScript: check if component has tensionData (non-linear)
      const hasNonLinearData = compData && (
        (compData.tensionData && compData.tensionData.length > 0 &&
         compData.tensionData.some(td => td && td.length > 0)) ||
        (compData.componentType === 2 && compData.subType === 0)  // LITR bearing
      );

      if (compData && hasNonLinearData) {
        // Has non-linear data (VBA: Not (nComponent = 0 And nType = 0))
        if (compData.componentType === 2 && compData.subType === 0) {
          // LITR bearing type (VBA lines 119-128)
          const bearingType = compData.data?.[0] || '';
          const bearingTypeNo = BEARING_TYPE_MAP[bearingType] || 1;
          const rubberHeight = compData.data?.[1] || '0';
          const area = compData.data?.[2] || '0';
          dofLine = `YES,,LITR,${bearingTypeNo},${rubberHeight},${area},0.01, YES`;
        } else {
          // Symmetric/Asymmetric curve data (VBA lines 129-202)
          const hystType = compData.mctHyst || 'NBI';
          const iSym = compData.mctSym ?? 0;
          const sfType = compData.mctSFType || 5;  // VBA: 3 + mct_iTYPE * 2 = 5
          const stiff = 1;                          // VBA: mct_dStiff = 1# (always 1)
          const iType = compData.mctType ?? 1;      // VBA: mct_iTYPE = 1

          // VBA output order analysis (Class140_SPGAllASym lines 162-192):
          // VBA code: nTens = 1, If m > 0 Then nTens = 0
          // m is NOT the commented vAngle value, but the OUTPUT LOOP counter from line 208:
          //   For m = 1 To i: vWriteData = vWriteData & "," & strBuf(m): Next m
          //
          // Result:
          // - First spring (j=0), first DOF (k=1): m=0 → nTens=1 → TENSION first
          // - All other cases: m=i>0 → nTens=0 → COMPRESSION first
          //
          // In our TypeScript storage (matching VBA indexing):
          // - tensionData[0] = strTENS(0) = COMPRESSION (cols 3-8)
          // - tensionData[1] = strTENS(1) = TENSION (cols 10-15)
          const tensionFirst = isFirstSpringFirstDOF;
          isFirstSpringFirstDOF = false;  // After first DOF, always COMPRESSION first

          const firstData = tensionFirst
            ? (compData.tensionData?.[1] || [])   // TENSION first for first spring's first DOF
            : (compData.tensionData?.[0] || []);  // COMPRESSION first for others
          const secondData = tensionFirst
            ? (compData.tensionData?.[0] || [])   // COMPRESSION second
            : (compData.tensionData?.[1] || []);  // TENSION second

          // Apply Math.abs to ensure positive values (VBA applies Abs at parsing time)
          const firstDataAbsolute = firstData.map(pt => ({
            d: Math.abs(pt.d),
            k: Math.abs(pt.k),
            f: Math.abs(pt.f),
          }));
          const secondDataAbsolute = secondData.map(pt => ({
            d: Math.abs(pt.d),
            k: Math.abs(pt.k),
            f: Math.abs(pt.f),
          }));

          const firstWithP = calculateCumulativeP(firstDataAbsolute);
          const secondWithP = calculateCumulativeP(secondDataAbsolute);

          // Build line parts
          // VBA: strBuf(0) = "YES," (with trailing comma)
          // Then joined with "," → "YES," + ",SLBC" = "YES,,SLBC"
          const lineParts: (string | number)[] = [];
          lineParts.push('YES,');  // VBA strBuf(0) = "YES,"
          lineParts.push(hystType);
          lineParts.push(iSym);
          lineParts.push('0, 1');
          lineParts.push(sfType);
          lineParts.push(stiff);
          lineParts.push(iType);

          // FIRST data set (COMPRESSION for SLBC, TENSION for others)
          for (const pt of firstWithP) {
            if (iType === 0) {
              lineParts.push(pt.f);
            } else {
              lineParts.push(pt.p);
            }
          }
          // Padding to minimum 4 F/P values (VBA line 172: If i < 11 Then i = 11)
          while (lineParts.length < 11) lineParts.push('');

          // Add first data D values
          for (const pt of firstWithP) {
            lineParts.push(pt.d);
          }
          // Padding (VBA line 177: If i < 15 Then i = 15)
          while (lineParts.length < 15) lineParts.push('');

          // Add fixed ratio values (VBA line 179)
          lineParts.push('0.5, 1, 2, 4, 8');

          // SECOND data set (TENSION for SLBC, COMPRESSION for others)
          for (const pt of secondWithP) {
            if (iType === 0) {
              lineParts.push(pt.f);
            } else {
              lineParts.push(pt.p);
            }
          }
          // Padding (VBA line 189: If i < 20 Then i = 20)
          while (lineParts.length < 20) lineParts.push('');

          // Add second data D values
          for (const pt of secondWithP) {
            lineParts.push(pt.d);
          }
          // Padding (VBA line 194: If i < 24 Then i = 24)
          while (lineParts.length < 24) lineParts.push('');

          // Add final ratio and HYST2 (VBA line 196)
          lineParts.push(`0.5, 1, 2, 4, 8${compData.mctHyst2 || ''}`);

          // For TTE type, add extra line (VBA lines 198-201)
          if (hystType === 'TTE') {
            lineParts.push('0.5, 1');
          }

          dofLine = lineParts.join(',');
        }
      } else {
        // No data or linear only for this DOF (VBA lines 208-213)
        dofLine = 'NO';
      }

      dofLines.push(dofLine);
      mctLines.push(dofLine);
    }

    // Empty line (VBA line 218-219)
    mctLines.push('');

    // J-end DOF existence flags (VBA line 100 repeated for J-end)
    mctLines.push('NO , NO, NO, NO, NO, NO, NO');

    // Duplicate DOF lines for J-end (VBA lines 221-224)
    for (const line of dofLines) {
      mctLines.push(line);
    }
    mctLines.push('');

    // Final padding line (VBA line 225)
    mctLines.push('0, 0, 0, 0, 0, 0');
  }

  return { mctLines };
}

/**
 * Convert with 3 separate table data arrays
 */
export function convertAsymmetricSpringsWithTables(
  tableData: AsymmetricSpringTableData,
  context: ConversionContext,
  spg6CompMapping: Map<string, number>
): SPGAllASymResult {
  // Parse bilinear table
  parseBilinearTable(tableData.bilinearData, context);
  // Parse trilinear table
  parseTrilinearTable(tableData.trilinearData, context);
  // Parse tetralinear table
  parseTetralinearTable(tableData.tetralinearData, context);

  // Generate MCT output
  return convertAsymmetricSprings([], context, spg6CompMapping);
}

/**
 * Parse asymmetric spring tables into context.springCompData WITHOUT generating MCT output
 * This is used to merge asymmetric data before generating combined NL-PROP output
 */
export function parseAsymmetricSpringTables(
  tableData: AsymmetricSpringTableData,
  context: ConversionContext
): void {
  console.log('=== parseAsymmetricSpringTables ===');
  console.log('BILINEAR rows:', tableData.bilinearData.length);
  console.log('TRILINEAR rows:', tableData.trilinearData.length);
  console.log('TETRALINEAR rows:', tableData.tetralinearData.length);

  // Parse bilinear table
  parseBilinearTable(tableData.bilinearData, context);
  // Parse trilinear table
  parseTrilinearTable(tableData.trilinearData, context);
  // Parse tetralinear table
  parseTetralinearTable(tableData.tetralinearData, context);
}
