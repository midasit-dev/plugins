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
 * Replace comma with dash in property name (VBA ChgCamma)
 * VBA: ChgCamma = Replace(strORG, ",", "-")
 */
function chgComma(str: string): string {
  return str.replace(/,/g, '-');
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
export function parseSymmetricSpringTables(
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
 * VBA main.bas GetSpringData - symmetric linear (i=0, j=0):
 * Column structure:
 * 0: Property name
 * 1: Component (xl, yl, zl, θxl, θyl, θzl)
 * 2: d-K or d-F type
 * 3: d (displacement in mm)
 * 4: K (stiffness) - used when d-K mode
 * 5: F (force) - used when d-F mode, then K = F/d
 */
function parseLinearTable(data: (string | number)[][], context: ConversionContext): void {
  console.log('=== parseLinearTable ===');
  console.log('Input data rows:', data.length);

  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    console.log(`  Linear: propName="${propName}", componentStr="${componentStr}", componentIdx=${componentIdx}`);

    // VBA: strData(2) = "d-K" or "d-F"
    const typeStr = String(row[2] || '').toLowerCase();
    const isDF = typeStr.includes('d-f') || typeStr.includes('f');

    // VBA: dValue = ChangeMM_M(strData(3))
    const d = safeParseNumber(row[3]) / 1000; // mm to m

    let stiffness: number;
    if (isDF && d !== 0) {
      // d-F mode: K = F / d
      const f = safeParseNumber(row[5]);
      stiffness = f / d;
    } else {
      // d-K mode: use K directly
      stiffness = safeParseNumber(row[4]);
    }

    console.log(`    type="${typeStr}", isDF=${isDF}, d=${d}, stiffness=${stiffness}`);

    // Store data point
    const dataPoints: { d: number; k: number; f: number }[] = [];
    dataPoints.push({ d, k: stiffness, f: stiffness * d });

    updateSpringCompData(context, propName, componentIdx, stiffness, 'LINEAR', dataPoints);
  }
}

/**
 * Parse Bilinear table data (Table 2: 16 columns O~AD)
 * VBA Class130_SPGAllSym.cls nRead2STCol=15, nRead2EDCol=30
 *
 * VBA main.bas GetSpringData - symmetric bilinear (i=0, j=1):
 * Column structure:
 * 0: Property name
 * 1: Component (xl, yl, zl, θxl, θyl, θzl)
 * 2: d-K or d-F type
 * 3: d1 (displacement point 1)
 * 4: d2 (displacement point 2)
 * 5: K1 (stiffness point 1)
 * 6: K2 (stiffness point 2)
 * 7: F1 (force point 1)
 * 8: F2 (force point 2)
 */
function parseBilinearTable(data: (string | number)[][], context: ConversionContext): void {
  console.log('=== parseBilinearTable ===');
  console.log('Input data rows:', data.length);

  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    console.log(`  Bilinear: propName="${propName}", componentStr="${componentStr}", componentIdx=${componentIdx}`);

    // VBA structure: strTENS(0, m) for symmetric (direction 0)
    // m = 0, 1 for bilinear (2 points)
    const dataPoints: { d: number; k: number; f: number }[] = [];

    // VBA: d values at columns 3,4 / K values at columns 5,6 / F values at columns 7,8
    const d1 = safeParseNumber(row[3]);
    const d2 = safeParseNumber(row[4]);
    const k1 = safeParseNumber(row[5]);
    const k2 = safeParseNumber(row[6]);
    const f1 = safeParseNumber(row[7]);
    const f2 = safeParseNumber(row[8]);

    console.log(`    k1=${k1}, k2=${k2}, d1=${d1}, d2=${d2}`);

    // Convert mm to m for displacement (VBA ChangeMM_M)
    dataPoints.push({ d: d1 / 1000, k: k1, f: f1 });
    dataPoints.push({ d: d2 / 1000, k: k2, f: f2 });

    // First point stiffness for MCT output (k1)
    updateSpringCompData(context, propName, componentIdx, k1, 'NBI', dataPoints);
  }
}

/**
 * Parse Trilinear table data (Table 3: 19 columns AF~AX)
 * VBA Class130_SPGAllSym.cls nRead3STCol=32, nRead3EDCol=50
 *
 * VBA main.bas GetSpringData - symmetric trilinear (i=0, j=2):
 * Column structure:
 * 0: Property name
 * 1: Component
 * 2: d-K or d-F type
 * 3,4,5: d1,d2,d3 (displacement)
 * 6,7,8: K1,K2,K3 (stiffness)
 * 9,10,11: F1,F2,F3 (force)
 */
function parseTrilinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // VBA: strTENS(0, m) for m = 0,1,2 (3 points)
    const dataPoints: { d: number; k: number; f: number }[] = [];

    // VBA: D at col 3,4,5 / K at col 6,7,8 / F at col 9,10,11
    for (let m = 0; m < 3; m++) {
      const d = safeParseNumber(row[3 + m]);
      const k = safeParseNumber(row[6 + m]);
      const f = safeParseNumber(row[9 + m]);
      dataPoints.push({ d: d / 1000, k, f }); // mm to m
    }

    // First point stiffness for MCT output
    updateSpringCompData(context, propName, componentIdx, dataPoints[0]?.k || 0, 'KIN', dataPoints);
  }
}

/**
 * Parse Tetralinear table data (Table 4: 27 columns AZ~CA)
 * VBA Class130_SPGAllSym.cls nRead4STCol=52, nRead4EDCol=78
 *
 * VBA main.bas GetSpringData - symmetric tetralinear (i=0, j=3):
 * Column structure:
 * 0: Property name
 * 1: Component
 * 2: d-K or d-F type
 * 3: unused
 * 4: unused
 * 5,6,7,8: d1,d2,d3,d4 (displacement)
 * 9,10,11,12: K1,K2,K3,K4 (stiffness)
 * 16,17,18,19: F1,F2,F3,F4 (force)
 */
function parseTetralinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // VBA: strTENS(0, m) for m = 0,1,2,3 (4 points)
    const dataPoints: { d: number; k: number; f: number }[] = [];

    // VBA: D at col 5-8 / K at col 9-12 / F at col 16-19
    for (let m = 0; m < 4; m++) {
      const d = safeParseNumber(row[5 + m]);
      const k = safeParseNumber(row[9 + m]);
      const f = safeParseNumber(row[16 + m]);
      dataPoints.push({ d: d / 1000, k, f }); // mm to m
    }

    // First point stiffness for MCT output
    updateSpringCompData(context, propName, componentIdx, dataPoints[0]?.k || 0, 'TTE', dataPoints);
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

  // Try numeric
  const num = parseInt(str, 10);
  if (num >= 1 && num <= 6) return num;

  return 1; // Default to Dx
}

/**
 * Update springCompData with stiffness value and data points
 * VBA: m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m) = {strD, strK, strF}
 */
function updateSpringCompData(
  context: ConversionContext,
  propName: string,
  componentIdx: number,
  stiffness: number,
  hystType: string,
  dataPoints?: { d: number; k: number; f: number }[]
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
      mctType: 1,      // VBA: mct_iTYPE = 1 (d-F mode fixed)
      mctSFType: 5,    // VBA: mct_SFType = 3 + mct_iTYPE * 2 = 5
      mctStiff: stiffness,
      category: [hystType],
      data: [],
    };
    sprData.components.push(comp);
  } else {
    // Update existing component with stiffness from detail table
    comp.mctStiff = stiffness;
    // Keep mctHyst from SPG6Comp if already set
    if (!comp.mctHyst || comp.mctHyst === '' || comp.mctHyst === 'LINEAR') {
      comp.mctHyst = hystType;
    }
  }

  // Store data points as tensionData (VBA strTENS structure)
  // tensionData[0] = positive direction, tensionData[1] = negative direction (for symmetric, both same)
  //
  // VBA behavior: Always overwrite existing data (no skip logic)
  // VBA parsing order: SYMMETRIC first, ASYMMETRIC second
  // So SYMMETRIC data is written first, then ASYMMETRIC data overwrites it if exists
  if (dataPoints && dataPoints.length > 0) {
    if (!comp.tensionData) {
      comp.tensionData = [];
    }
    // Store as direction 0 (positive)
    comp.tensionData[0] = dataPoints;
    // For symmetric, direction 1 is same as direction 0
    comp.tensionData[1] = dataPoints.map(pt => ({ ...pt }));
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

  // Debug: Dump springCompData summary
  console.log('=== convertSymmetricSprings: springCompData summary ===');
  console.log(`Total properties: ${context.springCompData.size}`);
  for (const [propName, sprData] of context.springCompData) {
    const compSummary = sprData.components.map(c => {
      const stiff = c.tensionData?.[0]?.[0]?.k ?? c.mctStiff ?? 0;
      const compStiff = c.tensionData?.[1]?.[0]?.k ?? 0;
      return `${c.componentIndex}:${c.mctHyst}(k=${stiff},ck=${compStiff})`;
    }).join(', ');
    console.log(`  "${propName}": [${compSummary}]`);
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
    const line1 = `${chgComma(sprName)},ELEMENT,${strType},0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,${nDamper},`;
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
      } else if (compData && ((compData.mctStiff !== undefined && compData.mctStiff !== 0) ||
                 (compData.tensionData && compData.tensionData.length > 0))) {
        // Has stiffness data (VBA 164-182)
        bAllFree = false;

        // VBA logic: If strProp is not numeric, get from strTENS
        // mct_iTYPE = 1 (d-F mode) → use strK (stiffness)
        // mct_iTYPE = 0 (d-K mode) → use strF (force)
        let stiffValue = compData.mctStiff || 0;

        // Check if tensionData exists and has values (VBA strTENS)
        if (compData.tensionData && compData.tensionData.length > 0) {
          // VBA indexing: strTENS(0) = COMPRESSION, strTENS(1) = TENSION
          // VBA: If mct_HYST = "SLBC" Then o = 1 → use compression direction
          // SLBC is compression-only bilinear, so use tensionData[0] (COMPRESSION)
          const directionIdx = (compData.mctHyst === 'SLBC') ? 0 : 1;
          const tensData = compData.tensionData[directionIdx];

          if (tensData && tensData.length > 0) {
            // VBA: mct_iTYPE = 1 → use strK, else use strF
            // Since mct_iTYPE is fixed to 1 (d-F), use strK
            const firstPoint = tensData[0];
            if (firstPoint && firstPoint.k !== undefined && firstPoint.k !== 0) {
              stiffValue = firstPoint.k;
            }
          }
        }

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
      oilDamperLines.push(`${damperNo},${chgComma(damperName)}, , 0, , , , , 0, 2, 0, 1`);

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
