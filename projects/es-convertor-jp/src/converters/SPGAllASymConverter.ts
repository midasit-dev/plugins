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

// VBA vSort array (lines 92-93): Different sort orders
const V_SORT = [
  [0, 1, 2, 3, 4, 5],  // Default order
  [0, 2, 1, 3, 5, 4],  // Reference element order
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
 * Column structure for asymmetric bilinear:
 * 0: Property name
 * 1: Component (xl, yl, zl, rxl, ryl, rzl)
 * 2-12: Tension data (d1,K1,F1, d2,K2,F2, ...)
 * 13-23: Compression data (d1,K1,F1, d2,K2,F2, ...)
 * 24: Extra data
 */
function parseBilinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse tension data (2 points)
    const tensionData: { d: number; k: number; f: number }[] = [];
    for (let i = 0; i < 2; i++) {
      const d = safeParseNumber(row[2 + i * 3]);
      const k = safeParseNumber(row[3 + i * 3]);
      const f = safeParseNumber(row[4 + i * 3]);
      if (d !== 0 || k !== 0 || f !== 0) {
        tensionData.push({ d, k, f });
      }
    }

    // Parse compression data (2 points)
    const compressionData: { d: number; k: number; f: number }[] = [];
    for (let i = 0; i < 2; i++) {
      const d = Math.abs(safeParseNumber(row[13 + i * 3]));
      const k = Math.abs(safeParseNumber(row[14 + i * 3]));
      const f = Math.abs(safeParseNumber(row[15 + i * 3]));
      if (d !== 0 || k !== 0 || f !== 0) {
        compressionData.push({ d, k, f });
      }
    }

    const stiffness = tensionData.length > 0 ? tensionData[0].k : 0;
    updateSpringCompData(context, propName, componentIdx, stiffness, 'NBI', 1, tensionData, compressionData);
  }
}

/**
 * Parse Trilinear table data (Table 2: 29 columns AB~BD)
 * VBA Class140_SPGAllASym nRead2STCol=28, nRead2EDCol=56
 */
function parseTrilinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse tension data (3 points)
    const tensionData: { d: number; k: number; f: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const d = safeParseNumber(row[2 + i * 3]);
      const k = safeParseNumber(row[3 + i * 3]);
      const f = safeParseNumber(row[4 + i * 3]);
      if (d !== 0 || k !== 0 || f !== 0) {
        tensionData.push({ d, k, f });
      }
    }

    // Parse compression data (3 points)
    const compressionData: { d: number; k: number; f: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const d = Math.abs(safeParseNumber(row[15 + i * 3]));
      const k = Math.abs(safeParseNumber(row[16 + i * 3]));
      const f = Math.abs(safeParseNumber(row[17 + i * 3]));
      if (d !== 0 || k !== 0 || f !== 0) {
        compressionData.push({ d, k, f });
      }
    }

    const stiffness = tensionData.length > 0 ? tensionData[0].k : 0;
    updateSpringCompData(context, propName, componentIdx, stiffness, 'KIN', 1, tensionData, compressionData);
  }
}

/**
 * Parse Tetralinear table data (Table 3: 45 columns BF~CX)
 * VBA Class140_SPGAllASym nRead3STCol=58, nRead3EDCol=102
 */
function parseTetralinearTable(data: (string | number)[][], context: ConversionContext): void {
  for (const row of data) {
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    const componentStr = String(row[1] || '');
    const componentIdx = getComponentIndex(componentStr);

    // Parse tension data (4 points)
    const tensionData: { d: number; k: number; f: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const d = safeParseNumber(row[2 + i * 3]);
      const k = safeParseNumber(row[3 + i * 3]);
      const f = safeParseNumber(row[4 + i * 3]);
      if (d !== 0 || k !== 0 || f !== 0) {
        tensionData.push({ d, k, f });
      }
    }

    // Parse compression data (4 points)
    const compressionData: { d: number; k: number; f: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const d = Math.abs(safeParseNumber(row[23 + i * 3]));
      const k = Math.abs(safeParseNumber(row[24 + i * 3]));
      const f = Math.abs(safeParseNumber(row[25 + i * 3]));
      if (d !== 0 || k !== 0 || f !== 0) {
        compressionData.push({ d, k, f });
      }
    }

    const stiffness = tensionData.length > 0 ? tensionData[0].k : 0;
    updateSpringCompData(context, propName, componentIdx, stiffness, 'TTE', 1, tensionData, compressionData);
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
    comp.mctStiff = stiffness;
    comp.mctHyst = hystType;
    comp.mctSym = 1;
    comp.mctType = iType;
  }

  // Store tension and compression data
  if (!comp.tensionData) {
    comp.tensionData = [];
  }
  comp.tensionData[0] = tensionData;
  comp.tensionData[1] = compressionData;
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

  // Iterate over spring properties (VBA lines 94-227)
  for (const sprName of sprPropKeys) {
    const sprData = context.springCompData.get(sprName);
    if (!sprData) continue;

    // Skip if no asymmetric components
    const hasAsymmetric = sprData.components.some(c => c.mctSym === 1);
    if (!hasAsymmetric) continue;

    // Line 1: Property header (VBA line 99)
    mctLines.push(`MLHP=NL_${sprName}, STEEL, SPR, AUTO, I, NONE, SKEL,,`);

    // Line 2: DOF existence flags (VBA line 100)
    mctLines.push('NO , NO, NO, NO, NO, NO, NO');

    // Determine sort order (VBA lines 102-104)
    const nSort = context.springRefElements?.has(sprName) ? 1 : 0;

    // Store first 6 DOF lines for duplication (VBA line 106)
    const dofLines: string[] = [];

    // Lines 3-8: 6 DOF lines (VBA lines 107-216)
    for (let k = 1; k <= 6; k++) {
      const nAbs = V_SORT[nSort][k];
      const compData = sprData.components.find(c => c.componentIndex === nAbs);

      let dofLine: string;

      if (compData && compData.mctSym === 1) {
        // Has asymmetric data
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
          const iSym = compData.mctSym || 1;
          const sfType = compData.mctSFType || 1;
          const stiff = compData.mctStiff || 0;
          const iType = compData.mctType || 0;

          // Calculate cumulative P for tension and compression
          const tensionRaw = compData.tensionData?.[0] || [];
          const compressionRaw = compData.tensionData?.[1] || [];

          const tensionWithP = calculateCumulativeP(tensionRaw);
          const compressionWithP = calculateCumulativeP(compressionRaw);

          // Build line parts
          const lineParts: (string | number)[] = [];
          lineParts.push('YES');
          lineParts.push(hystType);
          lineParts.push(iSym);
          lineParts.push('0, 1');
          lineParts.push(sfType);
          lineParts.push(stiff);
          lineParts.push(iType);

          // Add tension F or P values (VBA lines 165-171)
          for (const pt of tensionWithP) {
            if (iType === 0) {
              lineParts.push(pt.f);
            } else {
              lineParts.push(pt.p);
            }
          }
          // Padding to minimum 4 values (VBA line 172)
          while (lineParts.length < 11) lineParts.push(0);

          // Add tension D values (VBA lines 174-176)
          for (const pt of tensionWithP) {
            lineParts.push(pt.d);
          }
          // Padding (VBA line 177)
          while (lineParts.length < 15) lineParts.push(0);

          // Add fixed ratio values (VBA line 179)
          lineParts.push('0.5, 1, 2, 4, 8');

          // Add compression F or P values (VBA lines 181-188)
          for (const pt of compressionWithP) {
            if (iType === 0) {
              lineParts.push(pt.f);
            } else {
              lineParts.push(pt.p);
            }
          }
          // Padding (VBA line 189)
          while (lineParts.length < 20) lineParts.push(0);

          // Add compression D values (VBA lines 191-193)
          for (const pt of compressionWithP) {
            lineParts.push(pt.d);
          }
          // Padding (VBA line 194)
          while (lineParts.length < 24) lineParts.push(0);

          // Add final ratio and HYST2 (VBA line 196)
          lineParts.push(`0.5, 1, 2, 4, 8${compData.mctHyst2 || ''}`);

          // For TTE type, add extra line (VBA lines 198-201)
          if (hystType === 'TTE') {
            lineParts.push('0.5, 1');
          }

          dofLine = lineParts.join(',');
        }
      } else {
        // No data for this DOF (VBA lines 208-213)
        dofLine = 'NO';
      }

      dofLines.push(dofLine);
      mctLines.push(dofLine);
    }

    // Empty line (VBA line 218-219)
    mctLines.push('');

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
